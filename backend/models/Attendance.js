const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  rfidTag: { type: String, required: true },
  rfidReaderId: { type: String },
  studentId: { type: String, default: null },
  staffId: { type: String, default: null },
  studentName: { type: String },
  class: { type: String, default: null }, // Add this line // "class" ko rename karo
  section: { type: String },
  status: { type: String, enum: ['Present', 'Late', 'Absent'], default: 'Present' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
