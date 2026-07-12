const mongoose = require('mongoose');

// Định nghĩa schema cho Product (Sản phẩm)
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    default: []
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  categoryName: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  rating: {
    type: Number,
    default: 4.5
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  colors: {
    type: [String],
    default: []
  },
  specifications: {
    type: mongoose.Schema.Types.Mixed, // Có thể chứa mảng thuộc tính hoặc đối tượng cấu hình chi tiết
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
