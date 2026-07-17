const { client: redisClient } = require('../redisClient');

const GUEST_CART_TTL = 30 * 24 * 60 * 60; // 30 days in seconds
const USER_CART_TTL = 90 * 24 * 60 * 60;  // 90 days in seconds

const getCartKey = (userId, guestId) => {
  if (userId) return `cart:user:${userId}`;
  if (guestId) return `cart:guest:${guestId}`;
  return null;
};

const getCartItemsFromRedis = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error reading from Redis:', err);
    return [];
  }
};

const saveCartItemsToRedis = async (key, items, ttl) => {
  try {
    await redisClient.set(key, JSON.stringify(items), { EX: ttl });
  } catch (err) {
    console.error('Error saving to Redis:', err);
  }
};

exports.getCart = async (req, res) => {
  try {
    const { userId, guestId } = req.query;
    const key = getCartKey(userId, guestId);
    if (!key) {
      return res.status(400).json({ error: 'Either userId or guestId is required' });
    }

    const items = await getCartItemsFromRedis(key);
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    console.log('Incoming addToCart request body:', req.body);
    const { userId, guestId, productId, name, price, quantity, image } = req.body;
    const key = getCartKey(userId, guestId);
    console.log('Resolved Redis Cart Key:', key);
    if (!key) {
      console.log('Validation failed: key is missing');
      return res.status(400).json({ error: 'Either userId or guestId is required' });
    }

    if (!productId || !name || price === undefined) {
      console.log('Validation failed: missing fields', { productId, name, price });
      return res.status(400).json({ error: 'productId, name, and price are required' });
    }

    const items = await getCartItemsFromRedis(key);
    const existingIndex = items.findIndex(item => item.productId === productId);

    const qtyToAdd = parseInt(quantity, 10) || 1;

    if (existingIndex > -1) {
      items[existingIndex].quantity += qtyToAdd;
    } else {
      items.push({
        productId,
        name,
        price: parseFloat(price),
        quantity: qtyToAdd,
        image: image || ''
      });
    }

    const ttl = userId ? USER_CART_TTL : GUEST_CART_TTL;
    await saveCartItemsToRedis(key, items, ttl);

    res.json({ message: 'Item added to cart', items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { userId, guestId, productId, quantity } = req.body;
    const key = getCartKey(userId, guestId);
    if (!key) {
      return res.status(400).json({ error: 'Either userId or guestId is required' });
    }

    if (!productId || quantity === undefined) {
      return res.status(400).json({ error: 'productId and quantity are required' });
    }

    const newQty = parseInt(quantity, 10);
    if (newQty < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const items = await getCartItemsFromRedis(key);
    const existingIndex = items.findIndex(item => item.productId === productId);

    if (existingIndex > -1) {
      items[existingIndex].quantity = newQty;
      const ttl = userId ? USER_CART_TTL : GUEST_CART_TTL;
      await saveCartItemsToRedis(key, items, ttl);
      res.json({ message: 'Cart updated', items });
    } else {
      res.status(404).json({ error: 'Item not found in cart' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { userId, guestId, productId } = req.body;
    const key = getCartKey(userId, guestId);
    if (!key) {
      return res.status(400).json({ error: 'Either userId or guestId is required' });
    }

    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    let items = await getCartItemsFromRedis(key);
    items = items.filter(item => item.productId !== productId);

    const ttl = userId ? USER_CART_TTL : GUEST_CART_TTL;
    await saveCartItemsToRedis(key, items, ttl);

    res.json({ message: 'Item removed from cart', items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const { userId, guestId } = req.body;
    const key = getCartKey(userId, guestId);
    if (!key) {
      return res.status(400).json({ error: 'Either userId or guestId is required' });
    }

    await redisClient.del(key);
    res.json({ message: 'Cart cleared', items: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.mergeCart = async (req, res) => {
  try {
    const { guestId, userId } = req.body;
    if (!guestId || !userId) {
      return res.status(400).json({ error: 'Both guestId and userId are required' });
    }

    const guestKey = getCartKey(null, guestId);
    const userKey = getCartKey(userId, null);

    const guestItems = await getCartItemsFromRedis(guestKey);
    const userItems = await getCartItemsFromRedis(userKey);

    // Merge logic: if item exists in both, sum quantities; otherwise add it
    const mergedMap = new Map();
    userItems.forEach(item => {
      mergedMap.set(item.productId, { ...item });
    });

    guestItems.forEach(item => {
      if (mergedMap.has(item.productId)) {
        mergedMap.get(item.productId).quantity += item.quantity;
      } else {
        mergedMap.set(item.productId, { ...item });
      }
    });

    const mergedItems = Array.from(mergedMap.values());
    await saveCartItemsToRedis(userKey, mergedItems, USER_CART_TTL);
    await redisClient.del(guestKey); // Clean up guest cart

    res.json({ message: 'Carts merged successfully', items: mergedItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
