import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  product: {
    type: String,
    required: true,
    trim: true
  },

   productImage: { 
    type: String, 
    required: false 
  },

  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"]
  },
  price: {
    type: Number,
    required: true,
    min: [1, "Price must be at least 1"]
  }
}, { timestamps: true });

export const Order = mongoose.model("Order", orderSchema);
