const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  equipment_rating: { type: Number, min: 1, max: 5 },
  service_rating: { type: Number, min: 1, max: 5 },
  comment: { type: String },
  review_date: { type: Date, default: Date.now }
});

const deviceSchema = new mongoose.Schema({
  device_name: { type: String, required: true },
  manufacturer: { type: String },
  category: {
    category_id: { type: String },
    category_name: { type: String }
  },
  daily_rental_price: { type: Number },
  deposit_amount: { type: Number },
  device_status: { type: String, default: 'Available' },
  description: { type: String },
  quantity: { type: Number, default: 0 },
  color: { type: String },
  storage_capacity: { type: String },
  image: { type: String },
  reviews: [reviewSchema]
}, { timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);
