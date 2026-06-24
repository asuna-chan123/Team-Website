const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  phone_number: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  identity_number: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
