const mongoose = require('mongoose');
const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  resource_type: { type: String, enum: ['notes', 'ppt', 'pdf', 'syllabus', 'previous_paper', 'other'], required: true },
  file_url: { type: String, required: true },
  file_name: { type: String, required: true },
  file_size_bytes: Number,
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester' },
  subject_name: String,
  uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });
module.exports = mongoose.model('Resource', ResourceSchema);