const mongoose = require('mongoose');
const TeamSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  name: { type: String, required: true },
  description: String,
  required_skills: [String],
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  is_open: { type: Boolean, default: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['leader', 'member'], default: 'member' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    joined_at: { type: Date, default: Date.now }
  }]
}, { timestamps: true });
module.exports = mongoose.model('Team', TeamSchema);