require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Admin = require('./models/Admin');
const Cart = require('./models/Cart');

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

// Login API (for Admin panel)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find admin in Admin collection
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT
    const token = jwt.sign(
      { userId: admin._id },
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
    const products = await Product.find({ isDeleted: { $ne: 1 } }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Endpoint lấy danh sách biến thể sản phẩm có tồn kho thấp (<= 15)
// Sử dụng MongoDB Aggregation Pipeline theo đúng cấu trúc yêu cầu:
// $match (chưa xóa) -> $unwind (tách variants) -> $match (tồn kho <= 15) -> $project (chọn trường) -> $sort (sắp xếp tăng dần)
app.get('/api/products/low-stock', async (req, res) => {
  try {
    const lowStockVariants = await Product.aggregate([
      // Bước 1: $match - Lọc sản phẩm chưa bị xóa (isDeleted khác 1)
      {
        $match: {
          isDeleted: { $ne: 1 }
        }
      },
      // Bước 2: $unwind - Tách mảng variants[] thành các documents (dòng) riêng lẻ
      {
        $unwind: '$variants'
      },
      // Bước 3: $match - Lọc các biến thể có tồn kho <= 15
      {
        $match: {
          'variants.stock': { $lte: 15 }
        }
      },
      // Bước 4: $project - Chọn các trường cần hiển thị và định dạng lại cấu trúc đầu ra
      {
        $project: {
          _id: 1,
          products_id: 1,
          sku: 1,
          product_name: 1,
          category: 1,
          variant_name: '$variants.name',
          variant_price: '$variants.price',
          variant_stock: '$variants.stock',
          variant_images: '$variants.images'
        }
      },
      // Bước 5: $sort - Sắp xếp theo lượng tồn kho (variant_stock) tăng dần (1: ascending)
      {
        $sort: {
          variant_stock: 1
        }
      }
    ]);
    
    res.json(lowStockVariants);
  } catch (error) {
    console.error('Error in low-stock aggregation:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    if (!req.body.products_id) {
      req.body.products_id = 'prod_' + Date.now();
    }
    if (req.body.name && !req.body.product_name) {
      req.body.product_name = req.body.name;
    }
    // Clean up extra fields
    delete req.body.lowStockAlert;

    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    if (req.body.name && !req.body.product_name) {
      req.body.product_name = req.body.name;
    }
    delete req.body.lowStockAlert;

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isDeleted: 1 }, { new: true });
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
    if (!req.body.category_id) {
      req.body.category_id = 'cat_' + Date.now();
    }
    delete req.body.description;

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
// CUSTOMER CRUD (using User model)
// ----------------------------------------------------
// Truy vấn phức tạp số 2: Báo cáo khách hàng (Sử dụng Aggregation Pipeline kết hợp $lookup và $project để tính tổng chi tiêu + số đơn hàng trực tiếp từ DB)
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await User.aggregate([
      // Bước 1: $lookup - Liên kết collection User với collection orders bằng email khách hàng
      {
        $lookup: {
          from: 'orders',
          localField: 'email',
          foreignField: 'customerEmail',
          as: 'orders'
        }
      },
      // Bước 2: $project - Tính toán tổng số đơn hàng và tổng chi tiêu trực tiếp
      {
        $project: {
          _id: 1,
          user_id: 1,
          name: '$user_name',
          email: 1,
          phone: 1,
          address: 1,
          group: { $literal: 'Mới' },
          status: { $literal: 'Active' },
          // $size dùng để đếm số lượng phần tử của mảng đơn hàng (số đơn)
          totalOrders: { $size: '$orders' },
          // Tính tổng chi tiêu của các đơn hàng không bị hủy
          totalSpent: {
            $sum: {
              $map: {
                input: {
                  // Lọc bỏ các đơn hàng có trạng thái "Đã hủy"
                  $filter: {
                    input: '$orders',
                    as: 'order',
                    cond: { $ne: ['$$order.status', 'Đã hủy'] }
                  }
                },
                as: 'o',
                // Đối với mỗi đơn hàng hợp lệ, tính tổng tiền của tất cả sản phẩm (price * quantity)
                in: {
                  $sum: {
                    $map: {
                      input: { $ifNull: ['$$o.products', []] },
                      as: 'p',
                      in: { $multiply: [{ $ifNull: ['$$p.price', 0] }, { $ifNull: ['$$p.quantity', 0] }] }
                    }
                  }
                }
              }
            }
          }
        }
      },
      // Bước 3: $sort - Sắp xếp theo khách hàng mới đăng ký lên đầu
      {
        $sort: { _id: -1 }
      }
    ]);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/customers/:email/orders', async (req, res) => {
  try {
    const orders = await Order.find({ customerEmail: req.params.email }).sort({ createdAt: -1 });
    const result = orders.map(o => {
      const totalAmount = (o.products || []).reduce((sum, p) => sum + ((p.price || 0) * (p.quantity || 0)), 0);
      return {
        ...o.toObject(),
        totalAmount
      };
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const user = new User({
      user_id: 'user_' + Date.now(),
      user_name: name || 'Khách hàng',
      email,
      phone: phone || '',
      address: address || '',
      password: 'password123'
    });
    await user.save();
    res.status(201).json({
      _id: user._id,
      user_id: user.user_id,
      name: user.user_name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      group: 'Mới',
      status: 'Active'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const updateData = {};
    if (name) updateData.user_name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      _id: user._id,
      user_id: user.user_id,
      name: user.user_name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      group: 'Mới',
      status: 'Active'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ----------------------------------------------------
// ORDER CRUD
// ----------------------------------------------------
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    const result = orders.map(o => {
      const totalAmount = (o.products || []).reduce((sum, p) => sum + ((p.price || 0) * (p.quantity || 0)), 0);
      return {
        ...o.toObject(),
        totalAmount
      };
    });
    res.json(result);
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
    if (!req.body.order_id) {
      req.body.order_id = 'ord_' + Date.now();
    }
    if (req.body.shippingInfo && req.body.shippingInfo.phone) {
      req.body.shippingInfo.phone = Number(req.body.shippingInfo.phone);
    }
    // Remove carrier & totalAmount from model insertion
    delete req.body.carrier;
    delete req.body.totalAmount;

    // Dynamically resolve product_id by productSku if missing
    if (req.body.products && Array.isArray(req.body.products)) {
      for (let p of req.body.products) {
        if (!p.product_id) {
          const prodObj = await Product.findOne({ sku: p.productSku });
          if (prodObj) {
            p.product_id = prodObj._id;
          }
        }
      }
    }

    const order = new Order(req.body);
    await order.save();
    
    // Reduce product stock accordingly if order is confirmed/processing
    if (order.status !== 'Đã hủy') {
      for (let p of order.products) {
        await updateVariantStock(p.productSku, p.productName, -p.quantity);
      }
    }
    const totalAmount = (order.products || []).reduce((sum, p) => sum + ((p.price || 0) * (p.quantity || 0)), 0);
    res.status(201).json({
      ...order.toObject(),
      totalAmount
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update order status or shipping info
app.put('/api/orders/:id', async (req, res) => {
  try {
    const originalOrder = await Order.findById(req.params.id);
    if (!originalOrder) return res.status(404).json({ message: 'Order not found' });

    if (req.body.shippingInfo && req.body.shippingInfo.phone) {
      req.body.shippingInfo.phone = Number(req.body.shippingInfo.phone);
    }
    delete req.body.carrier;
    delete req.body.totalAmount;

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

    const totalAmount = (updatedOrder.products || []).reduce((sum, p) => sum + ((p.price || 0) * (p.quantity || 0)), 0);
    res.json({
      ...updatedOrder.toObject(),
      totalAmount
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ----------------------------------------------------
// THỐNG KÊ & TRUY VẤN PHỨC TẠP BỔ SUNG
// ----------------------------------------------------

// Truy vấn phức tạp số 3: Báo cáo doanh thu theo danh mục sản phẩm (Category Revenue Statistics)
// Sử dụng Aggregation Pipeline: $match (đơn hợp lệ) -> $unwind (tách products) -> $lookup (lấy thông tin danh mục từ Product) -> $group (nhóm theo category) -> $project -> $sort
app.get('/api/stats/category-revenue', async (req, res) => {
  try {
    const revenueStats = await Order.aggregate([
      // Bước 1: Lọc bỏ các đơn hàng đã bị hủy
      {
        $match: {
          status: { $ne: 'Đã hủy' }
        }
      },
      // Bước 2: Tách mảng products trong đơn hàng thành từng dòng để tính toán
      {
        $unwind: '$products'
      },
      // Bước 3: Liên kết với collection products bằng product_id để lấy trường category
      {
        $lookup: {
          from: 'products',
          localField: 'products.product_id',
          foreignField: '_id',
          as: 'productDetail'
        }
      },
      // Bước 4: Phẳng hóa thông tin sản phẩm sau khi lookup
      {
        $unwind: '$productDetail'
      },
      // Bước 5: Nhóm theo category và cộng dồn doanh thu (price * quantity) + tổng số lượng bán ra
      {
        $group: {
          _id: '$productDetail.category',
          totalRevenue: {
            $sum: { $multiply: ['$products.price', '$products.quantity'] }
          },
          totalQuantitySold: {
            $sum: '$products.quantity'
          }
        }
      },
      // Bước 6: Làm đẹp đầu ra hiển thị
      {
        $project: {
          _id: 0,
          category: '$_id',
          totalRevenue: 1,
          totalQuantitySold: 1
        }
      },
      // Bước 7: Sắp xếp theo doanh thu giảm dần
      {
        $sort: {
          totalRevenue: -1
        }
      }
    ]);
    res.json(revenueStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Truy vấn phức tạp số 4: Top 5 sản phẩm bán chạy nhất (Top 5 Best Selling Products)
// Sử dụng Aggregation Pipeline: $match -> $unwind -> $group (tính tổng lượng bán) -> $sort -> $limit
app.get('/api/stats/top-selling', async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      // Bước 1: Lọc bỏ các đơn hàng đã bị hủy
      {
        $match: {
          status: { $ne: 'Đã hủy' }
        }
      },
      // Bước 2: Tách mảng sản phẩm trong đơn hàng
      {
        $unwind: '$products'
      },
      // Bước 3: Nhóm theo sku của sản phẩm và tính tổng số lượng bán ra + tổng doanh thu
      {
        $group: {
          _id: '$products.productSku',
          productName: { $first: '$products.productName' },
          totalQty: { $sum: '$products.quantity' },
          totalRevenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } }
        }
      },
      // Bước 4: Sắp xếp theo tổng số lượng đã bán giảm dần
      {
        $sort: { totalQty: -1 }
      },
      // Bước 5: Giới hạn chỉ lấy Top 5 sản phẩm
      {
        $limit: 5
      }
    ]);
    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Truy vấn phức tạp số 5: Bộ lọc đơn hàng nâng cao hỗ trợ phân trang & Index (Advanced Order Filter with Indexes)
// Tận dụng Compound Index { status: 1, customerEmail: 1, createdAt: -1 } và Single Index { customerEmail: 1 } để tìm kiếm cực nhanh
app.get('/api/orders/search', async (req, res) => {
  try {
    const { status, email, startDate, endDate, page = 1, limit = 10 } = req.query;
    const filter = {};

    // 1. Lọc theo trạng thái đơn hàng (Sử dụng Index)
    if (status) {
      filter.status = status;
    }

    // 2. Lọc theo email khách hàng (Sử dụng Index)
    if (email) {
      filter.customerEmail = email;
    }

    // 3. Lọc theo khoảng thời gian tạo đơn (Sử dụng Index)
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const skipIndex = (Number(page) - 1) * Number(limit);

    // Truy vấn kết hợp sắp xếp tận dụng tối đa Compound Index
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(Number(limit));

    // Đếm tổng số bản ghi phù hợp để tính phân trang
    const total = await Order.countDocuments(filter);

    res.json({
      orders: orders.map(o => {
        const totalAmount = (o.products || []).reduce((sum, p) => sum + ((p.price || 0) * (p.quantity || 0)), 0);
        return {
          ...o.toObject(),
          totalAmount
        };
      }),
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
