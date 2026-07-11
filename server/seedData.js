require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const Order = require('./models/Order');

const categories = [
  { name: 'Thời trang', description: 'Quần áo, phụ kiện thời trang nam nữ' },
  { name: 'Điện tử', description: 'Điện thoại, máy tính, phụ kiện công nghệ' },
  { name: 'Gia dụng', description: 'Đồ dùng nhà bếp, trang trí nhà cửa' }
];

const products = [
  {
    sku: 'SP001',
    name: 'Áo thun Polo Nam Cotton',
    description: 'Chất liệu 100% cotton thoáng mát, thấm hút mồ hôi tốt.',
    category: 'Thời trang',
    lowStockAlert: 10,
    variants: [
      {
        name: 'Màu Đen - Size M',
        price: 199000,
        stock: 20,
        images: ['https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500']
      },
      {
        name: 'Màu Trắng - Size L',
        price: 219000,
        stock: 30,
        images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500']
      }
    ]
  },
  {
    sku: 'SP002',
    name: 'Váy Hoa Nhí Vintage',
    description: 'Thiết kế vintage nhẹ nhàng, phù hợp đi chơi, đi dạo phố.',
    category: 'Thời trang',
    lowStockAlert: 5,
    variants: [
      {
        name: 'Màu Vàng - Size S',
        price: 299000,
        stock: 2,
        images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500']
      },
      {
        name: 'Màu Xanh - Size M',
        price: 320000,
        stock: 1,
        images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500']
      }
    ]
  },
  {
    sku: 'SP003',
    name: 'Tai nghe Bluetooth Không Dây Hifi',
    description: 'Âm thanh sống động, chống ồn chủ động ANC, pin trâu 24h.',
    category: 'Điện tử',
    lowStockAlert: 5,
    variants: [
      {
        name: 'Màu Đen',
        price: 590000,
        stock: 15,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500']
      },
      {
        name: 'Màu Bạc',
        price: 640000,
        stock: 8,
        images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500']
      }
    ]
  }
];

const customers = [
  {
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@gmail.com',
    phone: '0987654321',
    address: '123 Đường Láng, Đống Đa, Hà Nội',
    group: 'VIP'
  },
  {
    name: 'Trần Thị B',
    email: 'tranthib@gmail.com',
    phone: '0901234567',
    address: '456 Lê Lợi, Quận 1, TP. Hồ Chí Minh',
    group: 'Thân thiết'
  }
];

const orders = [
  {
    orderNumber: 'DH001',
    customerEmail: 'nguyenvana@gmail.com',
    shippingInfo: {
      recipientName: 'Nguyễn Văn A',
      phone: '0987654321',
      address: '123 Đường Láng, Đống Đa, Hà Nội'
    },
    products: [
      { productSku: 'SP001', productName: 'Áo thun Polo Nam Cotton (Màu Đen - Size M)', quantity: 2, price: 199000 }
    ],
    totalAmount: 398000,
    status: 'Chờ duyệt',
    trackingNumber: '',
    carrier: ''
  }
];

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('Please configure MONGODB_URI in server/.env');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB for seeding');

    await Category.deleteMany({});
    await Product.deleteMany({});
    await Customer.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing data.');

    await Category.insertMany(categories);
    console.log('Seeded categories');

    await Product.insertMany(products);
    console.log('Seeded products with variants');

    await Customer.insertMany(customers);
    console.log('Seeded customers');

    await Order.insertMany(orders);
    console.log('Seeded orders');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
