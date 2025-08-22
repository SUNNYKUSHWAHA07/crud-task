import React, { useEffect, useState, Fragment } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// API call for updating order
async function updateOrder(order) {
  const res = await fetch(`https://crud-task-15do.onrender.com/orders/${order.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error('Failed to update order');
  return res.json();
}

const EditOrder = ({ order, visible, onClose }) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    customerName: '',
    productName: "",
    quantity: 1,
    price: '',
    id: '',
  });

  // Populate form when `order` changes
  useEffect(() => {
    if (order) {
      setFormData({
        customerName: order.customerName || '',
        productName: order.product || '',
        quantity: order.quantity || 1,
        price: order.price || '',
        id: order.id || order._id,
      });
    }
  }, [order]);

  // Mutation for updating
  const mutation = useMutation({
    mutationFn: updateOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      alert('Order updated successfully!');
      onClose();
    },
    onError: (error) => {
      console.error(error);
      alert('Failed to update order');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start md:items-center p-4 md:p-6  bg-opacity-40 backdrop-blur-sm overflow-auto">
      <div className="w-full max-w-lg md:w-[30%]  bg-opacity-50 backdrop-blur-2xl rounded-2xl p-6 flex flex-col text-white shadow-lg">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-white text-center md:text-left">Edit Order</h2>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
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
                className="w-full p-3 border border-white rounded-md  bg-opacity-30 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-white"
                placeholder={`Enter ${field}`}
              />
            </Fragment>
          ))}

          <label htmlFor="quantity" className="text-sm md:text-base font-medium text-white">
            Quantity:
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            min="1"
            value={formData.quantity || 1}
            onChange={handleChange}
            required
            className="w-full p-3 border border-white rounded-md  bg-opacity-30 text-white focus:outline-none focus:ring-2 focus:ring-white"
          />

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
            className="w-full p-3 border border-white rounded-md  bg-opacity-30 text-white focus:outline-none focus:ring-2 focus:ring-white"
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
              className="w-full md:w-auto border-2  border-black bg-black px-5 py-2 rounded-md transition disabled:opacity-50"
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
