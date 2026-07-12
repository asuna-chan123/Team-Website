const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');

// Create a new order
router.post('/', async (req, res) => {
  try {
    const { userId, items, totalAmount, address } = req.body;

    if (!userId || !items || !items.length || !address) {
      return res.status(400).json({ error: 'Missing required order details.' });
    }

    const order = await Order.create({
      userId,
      items,
      totalAmount,
      address,
      status: 'PENDING'
    });

    // Also update User purchase history
    await User.findByIdAndUpdate(userId, {
      $push: { purchaseHistory: { orderId: order._id, totalAmount, items, createdAt: order.createdAt } }
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get orders for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
