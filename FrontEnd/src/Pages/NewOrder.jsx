import React, { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdCancel } from "react-icons/md";

async function createOrder(orderData) {
  const res = await fetch("https://crud-task-15do.onrender.com/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });

 if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create order");
  }
  return res.json();
}


async function uploadImageToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/dihjrsgwg/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "MY_PRESET");

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error.message || "Image upload failed");
  }

  const data = await response.json();
  return data.secure_url; // Return the image URL
}


export default function NewOrder({ visible, onClose }) {
  const [formData, setFormData] = useState({
    customerName: "",
    product: "",
    quantity: 1,
    productImage: "",
    price: "",
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      alert("Order created successfully!");
      setFormData({
        customerName: "",
        product: "",
        quantity: 1,
        productImage: "",
        price: "",
      });
      onClose(); // Close modal on success
    },
    onError: (error) => {
      console.error(error);
      alert("Failed to create order");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    let imageUrl = "";
     if (formData.productImage) {
      imageUrl = await uploadImageToCloudinary(formData.productImage);
    }
    const orderPayload = {
      
      customerName: formData.customerName,
      product: formData.product,
      quantity: formData.quantity,
      price: formData.price,
      productImage: imageUrl,
    };

    
    mutation.mutate(orderPayload);
     } catch (error) {
    alert("Image upload failed: " + error.message);
  }
  };

  // Close on outside click
  const modalRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }

    if (visible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-transprent bg-opacity-40 backdrop-blur-[10px] flex items-center justify-center z-50">
      <form
        ref={modalRef}
        onSubmit={handleSubmit}
        className="max-w-md w-full p-6 bg-white/50 bg-opacity-80 rounded-xl shadow-2xl relative"
      >
        <div className="flex items-center justify-between mb-6 text-gray-700">
          <h2 className="text-2xl font-semibold text-center">Place New Order</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <MdCancel size={24} />
          </button>
        </div>

        <label htmlFor="customerName" className="block mb-2 font-medium text-gray-800">
          Customer Name:
        </label>
        <input
          type="text"
          id="customerName"
          name="customerName"
          value={formData.customerName}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label htmlFor="image" className="block mb-2 font-medium text-gray-800">
  Product Image:
</label>
<input
  type="file"
  id="productImage"
  name="productImage"
  accept="image/*"
  onChange={(e) =>
    setFormData((prev) => ({
      ...prev,
      productImage: e.target.files[0]
    }))
  }
  className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
/>

        

        <label htmlFor="product" className="block mb-2 font-medium text-gray-800">
          Product Name:
        </label>
        <input
          type="text"
          id="product"
          name="product"
          value={formData.product}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        

       <label htmlFor="quantity" className="text-sm md:text-base font-medium text-black">
            Quantity:
          </label>
          <div className='flex gap-30 text-black mb-3'>
             <input
            type="number"
            id="quantity"
            name="quantity"
            min="1"
            value={formData.quantity || 1}
            onChange={handleChange}
            required
            className="w-full p-3 border border-zinc-800 rounded-md  bg-opacity-30 text-black focus:outline-none focus:ring-2 focus:ring-white"
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
      setFormData(prev => ({ ...prev, quantity: Number(prev.quantity )+ 1 }))
    }
    className="px-3 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
  >
    +
  </button>
          </div>
         
          </div>

        <label htmlFor="price" className="block mb-2 font-medium text-gray-800">
          Price per unit:
        </label>
        <input
          type="number"
          id="price"
          name="price"
          min="0.01"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Submitting..." : "Submit Order"}
        </button>
      </form>
    </div>
  );
}
