const mongoose = require('mongoose');
const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  username: { type: String, unique: true, sparse: true },
  code: { type: String, unique: true, sparse: true },
  description: String
}, { timestamps: true });
module.exports = mongoose.model('Department', DepartmentSchema);