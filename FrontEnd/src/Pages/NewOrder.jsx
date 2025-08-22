import React, { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdCancel } from "react-icons/md";

async function createOrder(orderData) {
  const res = await fetch("http://localhost:3000/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) throw new Error("Failed to create order");
  return res.json();
}

export default function NewOrder({ visible, onClose }) {
  const [formData, setFormData] = useState({
    customerName: "",
    product: "",
    quantity: 1,
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

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
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

        <label htmlFor="quantity" className="block mb-2 font-medium text-gray-800">
          Quantity:
        </label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          min="1"
          value={formData.quantity}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

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
