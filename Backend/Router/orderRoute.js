import multer from "multer";
import express from "express";
import { Order } from "../Models/orderModel.js";

const router = express.Router();





// GET all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET order by ID
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

// CREATE new order
router.post("/", async (req, res) => {
  try {
    req.body
     const { customerName, product, productImage, quantity, price } = req.body;
     
     
       if (!customerName || !product || !quantity || !price || !productImage) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const order = new Order({
      customerName,
      product,
      productImage:productImage, // save image URL here
      quantity,
      price,
     });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE order
router.put("/:id", async (req, res) => {
  try {
    if (req.body.productImage && typeof req.body.productImage !== 'string') {
      return res.status(400).json({ error: "Invalid productImage URL" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedOrder) return res.status(404).json({ error: "Order not found" });

    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// DELETE order
router.delete("/:id", async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Order deleted", order: deletedOrder });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

export default router;
