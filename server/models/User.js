const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password_hash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'club_coordinator', 'admin'],
    default: 'student',
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  },
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
  },
  academic_year: {
    type: String,
    enum: ['1st', '2nd', '3rd', '4th'],
  },
  bio: String,
  skills: [String],
  badges: [String],
  is_active: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
