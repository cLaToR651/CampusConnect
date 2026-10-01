const mongoose = require('mongoose');
const PostCommentSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'ExperiencePost', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true }
}, { timestamps: true });
module.exports = mongoose.model('PostComment', PostCommentSchema);