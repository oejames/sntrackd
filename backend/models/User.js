const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   username: { type: String, required: true },
//   reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
//   watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sketch' }]
// });


const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  favoriteSketchIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sketch' }] // New field
});

module.exports = mongoose.model('User', userSchema);
