const mongoose = require('mongoose');

// Định nghĩa schema cho Product (Sản phẩm)
const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    trim: true,
    lowercase: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    trim: true
  },
  variants: [{
    color: String,
    size: String,
    price: Number,
    stock: Number,
    image: String
  }],
  brand: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    default: 4.5
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  strict: false // Cho phép các trường khác trong DB Atlas đi qua không bị lọc bỏ
});

module.exports = mongoose.model('Product', productSchema);
