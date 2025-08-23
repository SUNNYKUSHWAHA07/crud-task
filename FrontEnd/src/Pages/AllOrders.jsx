import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import NewOrder from './NewOrder';
import EditOrder from './EditOrder';

async function fetchOrders() {
  const res = await fetch('https://crud-task-15do.onrender.com/orders');
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

async function deleteOrderApi(id) {
  const res = await fetch(`https://crud-task-15do.onrender.com/orders/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete order');
  return res.json();
}

const AllOrders = () => {
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const queryClient = useQueryClient();

  const { data: orders = [], isLoading, isError, error } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrderApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      alert('Order deleted successfully');
    },
    onError: (error) => {
      alert('Failed to delete order: ' + error.message);
    },
  });

  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEditClick = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseEdit = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="min-h-screen w-full p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-white text-center sm:text-left">Orders</h1>
        <button
          onClick={() => setShowNewOrder(true)}
          className="bg-indigo-500/50 hover:bg-indigo-600 text-white px-4 sm:px-5 py-2 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          New Order +
        </button>
      </div>

      {/* Loading & Error */}
      {isLoading && <p className="text-center text-gray-400">Loading orders...</p>}
      {isError && <p className="text-center text-red-600">Error: {error.message}</p>}

      {/* Orders List */}
      {!isLoading && !isError && (
        <div className="max-w-5xl mx-auto backdrop-blur-md bg-white/20 rounded-lg shadow-md p-4 sm:p-6">
          {orders.length === 0 ? (
            <p className="text-center text-gray-300">No orders found.</p>
          ) : (
            <ul className="divide-y divide-gray-200 flex flex-col gap-3 overflow-y-auto max-h-[70vh]">
              {/* Table Header (desktop/tablet only) */}
              <div className="hidden sm:flex justify-between text-gray-400 font-semibold mb-2 px-2">
                <p className="w-1/6">Image</p>
                <p className="w-1/6">Customer</p>
                <p className="w-1/6">Product</p>
                <p className="w-1/6">Quantity</p>
                <p className="w-1/6">Price</p>
                <p className="w-1/6">Total</p>
                <p className="w-1/6">Actions</p>
              </div>

              {orders.map((order) => (
                <li
                  key={order._id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-2 font-semibold capitalize text-zinc-500 bg-opacity-30 rounded-lg"
                >
                  {/* Product name and quantity for mobile */}
                  <div className="flex w-full justify-between sm:hidden text-white mb-2">
                    <span className="font-semibold flex gap-2">Product: {order.product}</span>
                    <span className="ml-4">Qty: {order.quantity}</span>
                  </div>

                  {/* Product Image */}
                  <div className="md:h-20 md:w-20 h-70 w-70 md:mr-20 mx-auto rounded-md overflow-hidden border mb-2 sm:mb-0">
                    <img className="h-full w-full object-cover" src={order.productImage} alt="" />
                  </div>

                  {/* Customer Name */}
                  <p className="text-wrap  md:w-[14.2%]"><span className="sm:hidden">Customer: </span>{order.customerName}</p>
                  {/* Product Name on desktop */}
                  <p className="font-semibold  md:w-[14.2%] capitalize hidden sm:block">{order.product}</p>
                  {/* Quantity on desktop */}
                  <p className=" md:w-[14.2%] px-4 hidden sm:block">{order.quantity}</p>
                  {/* Price */}
                  <p className=" md:w-[14.2%]"><span className="sm:hidden">Price: </span>₹ {order.price}</p>
                  {/* Total */}
                  <p className=" md:w-[14.2%]"><span className="sm:hidden">Total: </span>₹ {(order.price * order.quantity).toFixed(2)}</p>
                  {/* Actions */}
                  <div className="flex gap-2 sm:gap-3 mt-2 sm:mt-0  md:w-[14.2%] justify-start sm:justify-end">
                    <button
                      onClick={() => handleEditClick(order)}
                      className="bg-indigo-500/50 hover:bg-indigo-600 text-white px-3 py-1 rounded-md shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(order._id)}
                      disabled={deleteMutation.isLoading}
                      className="bg-red-700/50 hover:bg-red-600 text-white px-3 py-1 rounded-md shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* New & Edit Order Panels */}
      <NewOrder visible={showNewOrder} onClose={() => setShowNewOrder(false)} />
      <EditOrder order={selectedOrder} visible={!!selectedOrder} onClose={handleCloseEdit} />
    </div>
  );
};

export default AllOrders;
