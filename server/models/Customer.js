const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  group: {
    type: String,
    enum: ['VIP', 'Thân thiết', 'Mới'],
    default: 'Mới'
  },
  status: {
    type: String,
    enum: ['Active', 'Locked'],
    default: 'Active'
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
