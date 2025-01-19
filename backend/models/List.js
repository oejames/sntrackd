// models/List.js
const mongoose = require('mongoose');

const listEntrySchema = new mongoose.Schema({
  sketchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sketch' },
  notes: String,
  position: Number  // for ranked lists
});

const listSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  isRanked: { type: Boolean, default: false },
  entries: [listEntrySchema],
  createdAt: { type: Date, default: Date.now },
   // Add fields for likes/saves
   savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
   saveCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('List', listSchema);