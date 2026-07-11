const mongoose = require('mongoose');

// Định nghĩa schema cho Category (Danh mục sản phẩm)
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
