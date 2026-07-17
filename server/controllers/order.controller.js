const Order = require('../models/order.model');

exports.createOrder = async (req, res) => {
  try {
    const { userId, guestId, items, shippingDetails, paymentMethod, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item.' });
    }

    if (!shippingDetails || !shippingDetails.fullName || !shippingDetails.phone || !shippingDetails.address) {
      return res.status(400).json({ error: 'Incomplete shipping details.' });
    }

    const newOrder = await Order.create({
      userId: userId || null,
      guestId: guestId || null,
      items,
      shippingDetails,
      paymentMethod,
      totalAmount
    });

    res.status(201).json({ message: 'Order created successfully', order: newOrder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { userId, guestId } = req.query;

    if (!userId && !guestId) {
      return res.status(400).json({ error: 'Either userId or guestId is required.' });
    }

    const filter = {};
    if (userId) {
      filter.userId = userId;
    } else if (guestId) {
      filter.guestId = guestId;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
