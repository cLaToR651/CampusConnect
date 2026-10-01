const mongoose = require('mongoose');
const ClubMessageSchema = new mongoose.Schema({
  club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true }
}, { timestamps: true });
module.exports = mongoose.model('ClubMessage', ClubMessageSchema);