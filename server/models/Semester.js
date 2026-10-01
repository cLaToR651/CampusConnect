const mongoose = require('mongoose');
const SemesterSchema = new mongoose.Schema({
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  semester_number: { type: Number, required: true }
}, { timestamps: true });
module.exports = mongoose.model('Semester', SemesterSchema);