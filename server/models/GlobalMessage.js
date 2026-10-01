const mongoose = require('mongoose');
const GlobalMessageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true }
}, { timestamps: true });
module.exports = mongoose.model('GlobalMessage', GlobalMessageSchema);