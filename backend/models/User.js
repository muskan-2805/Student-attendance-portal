const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff'], default: 'admin' },
  userId: { type: String, unique: true },
  dob: { type: Date },
  gender: { type: String },
  contact: { type: String },
   otp: {
        type: String,
        default: null,
    },
    otpExpires: {
        type: Date,
        default: null,
    },
});

module.exports = mongoose.model('User', UserSchema);