import React, { useEffect, useState, Fragment } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

async function updateOrder(order) {
  const res = await fetch(`https://crud-task-15do.onrender.com/orders/${order.id}`, {    
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update order');
  }
  return res.json();
}

async function uploadImageToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/dihjrsgwg/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "MY_PRESET");

  const response = await fetch(url, { method: "POST", body: formData });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error.message || "Image upload failed");
  }

  const data = await response.json();
  return data.secure_url;
}

const EditOrder = ({ order, visible, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    customerName: '',
    product: '',
    quantity: 1,
    price: '',
    id: '',
    productImage: '',
    newImageFile: null,
  });

  useEffect(() => {
    if (order) {
      setFormData({
        customerName: order.customerName || '',
        product: order.product || '',
        quantity: order.quantity || 1,
        price: order.price || '',
        id: order._id || order.id,   // <-- normalize ID
        productImage: order.productImage || '',
        newImageFile: null,
      });
    }
  }, [order]);

  const mutation = useMutation({
    mutationFn: updateOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      alert('Order updated successfully!');
      onClose();
    },
    onError: (error) => {
      console.error(error);
      alert(error.message || 'Failed to update order');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = formData.productImage;

      // Upload new image if user selected one
      if (formData.newImageFile) {
        imageUrl = await uploadImageToCloudinary(formData.newImageFile);
      }

      const updatedOrder = {
        id: formData.id,
        customerName: formData.customerName,
        product: formData.product,
        quantity: formData.quantity,
        price: formData.price,
        productImage: imageUrl,  // always send a string
      };

      mutation.mutate(updatedOrder);
    } catch (error) {
      alert("Image upload failed: " + error.message);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start md:items-center p-4 md:p-6 bg-opacity-80 backdrop-blur-lg overflow-auto">
      <div className="w-full max-w-lg md:w-[30%] bg-opacity-50 backdrop-blur-2xl rounded-2xl p-6 flex flex-col bg-zinc-500 text-white shadow-lg">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-white text-center md:text-left">
          Edit Order
        </h2>

        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
          {['customerName', 'product'].map((field) => (
            <Fragment key={field}>
              <label htmlFor={field} className="text-sm md:text-base font-medium text-white capitalize">
                {field.replace(/([A-Z])/g, ' $1')}:
              </label>
              <input
                type="text"
                id={field}
                name={field}
                value={formData[field] || ''}
                onChange={handleChange}
                required
                className="w-full p-3 border border-white rounded-md bg-transparent bg-opacity-30 text-white focus:outline-none focus:ring-2 focus:ring-white"
                placeholder={`Enter ${field}`}
              />
            </Fragment>
          ))}

          <label htmlFor="newImageFile" className="text-sm md:text-base font-medium text-white mt-2">
            Update Product Image:
          </label>
          <input
            type="file"
            id="newImageFile"
            accept="image/*"
            onChange={e => {
              const file = e.target.files[0];
              setFormData(prev => ({ ...prev, newImageFile: file || null }));
            }}
            className="w-full p-3 border border-white rounded-md bg-transparent bg-opacity-30 text-white focus:outline-none focus:ring-2 focus:ring-white"
          />

          {/* Preview new or current image */}
          {formData.newImageFile ? (
            <img
              src={URL.createObjectURL(formData.newImageFile)}
              alt="New preview"
              className="mt-2 max-h-20 rounded"
            />
          ) : formData.productImage ? (
            <img
              src={formData.productImage}
              alt="Current product"
              className="mt-2 max-h-20 rounded"
            />
          ) : null}

          <label htmlFor="quantity" className="text-sm md:text-base font-medium text-white">
            Quantity:
          </label>
          <div className='flex gap-30'>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="1"
              value={formData.quantity || 1}
              onChange={handleChange}
              required
              className="w-full p-3 border border-white rounded-md bg-opacity-30 text-white focus:outline-none focus:ring-2 focus:ring-white"
            />
            <div className="flex items-center gap-2 w-full">
              <button
                type="button"
                onClick={() =>
                  setFormData(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))
                }
                className="px-3 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
              >
                -
              </button>

              <span className="px-4 py-2 bg-gray-800 text-white rounded-md text-center min-w-[40px]">
                {formData.quantity}
              </span>

              <button
                type="button"
                onClick={() =>
                  setFormData(prev => ({ ...prev, quantity: prev.quantity + 1 }))
                }
                className="px-3 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
              >
                +
              </button>
            </div>
          </div>

          <label htmlFor="price" className="text-sm md:text-base font-medium text-white">
            Price per unit:
          </label>
          <input
            type="number"
            id="price"
            name="price"
            min="0.01"
            step="0.01"
            value={formData.price || ''}
            onChange={handleChange}
            required
            className="w-full p-3 border border-white rounded-md bg-opacity-30 text-white focus:outline-none focus:ring-2 focus:ring-white"
          />

          <div className="flex flex-col md:flex-row justify-between gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full md:w-auto bg-black px-5 py-2 rounded-md transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isLoading}
              className="w-full md:w-auto border-2 border-black bg-black px-5 py-2 rounded-md transition disabled:opacity-50"
            >
              {mutation.isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOrder;
