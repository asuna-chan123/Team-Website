const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  card_id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  session_id: {
    type: String,
    required: true
  },
  user_id: {
    type: String,
    required: true
  },
  variants_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  }
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
