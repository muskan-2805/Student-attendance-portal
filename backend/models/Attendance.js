const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  rfidTag: { type: String, required: true },
  rfidReaderId: { type: String },
  studentId: { type: String, default: null }, 
  staffId: { type: String, default: null },   
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null }, // NEW: real Mongoose ref
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', default: null },     // NEW: real Mongoose ref
  studentName: { type: String },
  class: { type: String, default: null },
  section: { type: String },
  status: { type: String, enum: ['Present', 'Late', 'Absent'], default: 'Present' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);