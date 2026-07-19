const mongoose = require('mongoose');

const orderProductSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
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
  order_id: {
    type: String,
    required: true,
    unique: true
  },
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
      type: Number,
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  products: [orderProductSchema],
  status: {
    type: String,
    enum: ['Chờ duyệt', 'Đang xử lý', 'Đang giao', 'Đã giao thành công', 'Đã hủy'],
    default: 'Chờ duyệt'
  },
  trackingNumber: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Đánh chỉ mục (Index) tăng tốc truy vấn tìm kiếm đơn hàng theo email khách hàng
orderSchema.index({ customerEmail: 1 });

// Đánh chỉ mục hỗn hợp (Compound Index) phục vụ việc lọc và sắp xếp đơn hàng theo trạng thái, khách hàng và thời gian tạo
orderSchema.index({ status: 1, customerEmail: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
