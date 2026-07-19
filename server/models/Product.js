const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  variant_id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  images: [{
    type: String
  }]
});

const productSchema = new mongoose.Schema({
  products_id: {
    type: String,
    required: true,
    unique: true
  },
  sku: {
    type: String,
    required: true,
    unique: true
  },
  product_name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true
  },
  variants: [variantSchema],
  isDeleted: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Đánh chỉ mục để lọc nhanh các sản phẩm chưa xóa
productSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('Product', productSchema);
