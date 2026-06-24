const { client: redisClient } = require('../redisClient');
const Order = require('../models/Order');

// Get cart
exports.getCart = async (req, res) => {
  const { userId } = req.params;
  const cartKey = `cart:${userId}`;
  try {
    const cartItems = await redisClient.hGetAll(cartKey);
    // Redis returns strings, we need to parse them back to objects
    const formattedCart = Object.keys(cartItems).map(productId => {
      return JSON.parse(cartItems[productId]);
    });
    res.json(formattedCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add to cart
exports.addToCart = async (req, res) => {
  const { userId } = req.params;
  const { productId, name, price, quantity = 1, image = '' } = req.body;
  const cartKey = `cart:${userId}`;

  try {
    // Check if item already exists in cart
    const existingItemStr = await redisClient.hGet(cartKey, productId);
    let item;
    if (existingItemStr) {
      item = JSON.parse(existingItemStr);
      item.quantity += Number(quantity);
    } else {
      item = {
        productId,
        name: name || `Product ${productId}`, // Dummy name if not provided
        price: Number(price) || 100, // Dummy price if not provided
        quantity: Number(quantity),
        image
      };
    }

    await redisClient.hSet(cartKey, productId, JSON.stringify(item));
    res.json({ message: 'Added to cart', item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Decrease quantity
exports.decreaseQuantity = async (req, res) => {
  const { userId } = req.params;
  const { productId } = req.body;
  const cartKey = `cart:${userId}`;

  try {
    const existingItemStr = await redisClient.hGet(cartKey, productId);
    if (!existingItemStr) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    const item = JSON.parse(existingItemStr);
    item.quantity -= 1;

    if (item.quantity <= 0) {
      // Remove item if quantity drops to 0
      await redisClient.hDel(cartKey, productId);
      res.json({ message: 'Item removed from cart' });
    } else {
      // Update quantity
      await redisClient.hSet(cartKey, productId, JSON.stringify(item));
      res.json({ message: 'Quantity decreased', item });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove from cart directly
exports.removeFromCart = async (req, res) => {
  const { userId, productId } = req.params;
  const cartKey = `cart:${userId}`;

  try {
    await redisClient.hDel(cartKey, productId);
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Checkout (Redis -> MongoDB)
exports.checkout = async (req, res) => {
  const { userId } = req.params;
  const { address } = req.body;
  const cartKey = `cart:${userId}`;

  if (!address) {
    return res.status(400).json({ message: 'Address is required for checkout' });
  }

  try {
    // 1. Read entire cart from Redis
    const cartData = await redisClient.hGetAll(cartKey);
    const productIds = Object.keys(cartData);

    if (productIds.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // 2. Parse items and calculate total
    const items = [];
    let totalAmount = 0;

    for (const pid of productIds) {
      const item = JSON.parse(cartData[pid]);
      items.push({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      });
      totalAmount += item.price * item.quantity;
    }

    // 3. Create Order Document in MongoDB
    const newOrder = new Order({
      userId,
      items,
      totalAmount,
      address,
      status: 'PENDING'
    });

    const savedOrder = await newOrder.save();

    // 4. Delete cart from Redis
    await redisClient.del(cartKey);

    res.json({ 
      message: 'Order placed successfully', 
      orderId: savedOrder._id,
      totalAmount 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
