const mongoose = require('mongoose');
const ClubSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: String,
  logo_url: String,
  contact_email: String,
  instagram_url: String,
  is_recruiting: { type: Boolean, default: false },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['member', 'coordinator', 'lead'], default: 'member' },
    joined_at: { type: Date, default: Date.now }
  }]
}, { timestamps: true });
module.exports = mongoose.model('Club', ClubSchema);