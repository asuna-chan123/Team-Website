const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  avatar: { type: String, default: '' },
  purchaseHistory: { type: Array, default: [] },
}, { timestamps: true });

const { createDynamicModel } = require('../utils/mockMongoose');
module.exports = createDynamicModel('User', UserSchema);
