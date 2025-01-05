const mongoose = require('mongoose');

const sketchSchema = new mongoose.Schema({
  // videoId: { type: String, required: true, unique: true },
  videoId: { type: String, unique: true, sparse: true},
  title: String,
  description: String,
  publishedTime: String, // Changed to String since we're getting "X years ago"
  thumbnails: [{
    url: String,
    width: Number,
    height: Number
  }],
  duration: String, // "6:04" format
  viewCount: String, // "1,538,052 views" format
  channelTitle: String,
  importDate: { type: Date, default: Date.now },
  importMethod: String
}, { 
  timestamps: true,
  collection: 'sketches'
});

module.exports = mongoose.model('Sketch', sketchSchema);