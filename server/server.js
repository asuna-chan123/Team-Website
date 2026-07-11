require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const Order = require('./models/Order');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI || mongoURI.includes('<CLUSTER_URL>')) {
  console.error('\n======================================================');
  console.error('ERROR: Missing or invalid MongoDB Connection String.');
  console.error('Please update the MONGODB_URI in your server/.env file');
  console.error('======================================================\n');
} else {
  mongoose.connect(mongoURI)
    .then(() => console.log('Successfully connected to MongoDB!'))
    .catch((error) => console.error('Error connecting to MongoDB:', error.message));
}

app.get('/', (req, res) => {
  res.send('Backend Server is running');
});

// Login API
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '1d' }
    );
    
    res.json({ token, message: 'Logged in successfully' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----------------------------------------------------
// PRODUCT CRUD
// ----------------------------------------------------
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ----------------------------------------------------
// CATEGORY CRUD
// ----------------------------------------------------
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ----------------------------------------------------
// CUSTOMER CRUD
// ----------------------------------------------------
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await Customer.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
    // For each customer, let's count orders and total spent
    const result = [];
    for (let c of customers) {
      const orders = await Order.find({ customerEmail: c.email });
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, o) => sum + (o.status !== 'Đã hủy' ? o.totalAmount : 0), 0);
      result.push({
        ...c.toObject(),
        totalOrders,
        totalSpent
      });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/customers/:email/orders', async (req, res) => {
  try {
    const orders = await Order.find({ customerEmail: req.params.email }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ----------------------------------------------------
// ORDER CRUD
// ----------------------------------------------------
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper to update stock for a specific variant
async function updateVariantStock(productSku, productName, quantityChange) {
  try {
    const product = await Product.findOne({ sku: productSku });
    if (!product) return;

    let targetVariant = product.variants[0];
    if (product.variants && product.variants.length > 1) {
      for (let v of product.variants) {
        if (productName.includes(v.name)) {
          targetVariant = v;
          break;
        }
      }
    }

    if (targetVariant) {
      targetVariant.stock += quantityChange;
      // Prevent negative stock
      if (targetVariant.stock < 0) targetVariant.stock = 0;
      await product.save();
    }
  } catch (error) {
    console.error('Error updating variant stock:', error);
  }
}

app.post('/api/orders', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    // Reduce product stock accordingly if order is confirmed/processing
    if (order.status !== 'Đã hủy') {
      for (let p of order.products) {
        await updateVariantStock(p.productSku, p.productName, -p.quantity);
      }
    }
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update order status or shipping info
app.put('/api/orders/:id', async (req, res) => {
  try {
    const originalOrder = await Order.findById(req.params.id);
    if (!originalOrder) return res.status(404).json({ message: 'Order not found' });

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // Handle stock changes when transitioning to/from Canceled status
    if (originalOrder.status !== 'Đã hủy' && updatedOrder.status === 'Đã hủy') {
      // Revert stock
      for (let p of updatedOrder.products) {
        await updateVariantStock(p.productSku, p.productName, p.quantity);
      }
    } else if (originalOrder.status === 'Đã hủy' && updatedOrder.status !== 'Đã hủy') {
      // Deduct stock
      for (let p of updatedOrder.products) {
        await updateVariantStock(p.productSku, p.productName, -p.quantity);
      }
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
