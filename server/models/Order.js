const mongoose = require('mongoose');

const orderProductSchema = new mongoose.Schema({
  productSku: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  price: {
    type: Number,
    required: true
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  shippingInfo: {
    recipientName: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  products: [orderProductSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Chờ duyệt', 'Đang xử lý', 'Đang giao', 'Đã giao thành công', 'Đã hủy'],
    default: 'Chờ duyệt'
  },
  trackingNumber: {
    type: String,
    default: ''
  },
  carrier: {
    type: String,
    default: ''
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
