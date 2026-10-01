const mongoose = require('mongoose');
const ExperiencePostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [String],
  is_published: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model('ExperiencePost', ExperiencePostSchema);