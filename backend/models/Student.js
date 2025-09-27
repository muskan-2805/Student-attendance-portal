const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    studentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    class: { type: String, required: true },
    section: { type: String, required: true },
    gender: { type: String },
    dob: { type: String },
    contact: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    fatherName: { type: String },
    motherName: { type: String },
    fatherOccupation: { type: String },
    motherOccupation: { type: String },
    fatherMobile: { type: String },
    motherMobile: { type: String },
    admissionDate: { type: String },
    email: { type: String, unique: true, sparse: true },
    photo: { type: String },
    rfidTag: { type: String, unique: true, sparse: true }
});

module.exports = mongoose.model('Student', StudentSchema);