const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sketch: { type: mongoose.Schema.Types.ObjectId, ref: 'Sketch' },
  rating: { type: Number, required: true },
  text: String,
  pinned: { type: Boolean, default: false }, // pinned reviews
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);