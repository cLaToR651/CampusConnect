const mongoose = require('mongoose');
const ProgramSchema = new mongoose.Schema({
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  name: { type: String, required: true },
  code: String,
  duration_years: Number
}, { timestamps: true });
module.exports = mongoose.model('Program', ProgramSchema);