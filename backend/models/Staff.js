const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
    staffId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    fatherName: { type: String, default: '' },
    motherName: { type: String, default: '' },
    gender: { type: String, default: '' },
    dob: { type: String, default: '' },
    maritalStatus: { type: String, default: '' },
    email: { type: String, unique: true, sparse: true },
    personalContact: { type: String, default: '' },
    altContact: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    jobTitle: { type: String, default: '' },
    department: { type: String, default: '' },
    joiningDate: { type: String, default: '' },
    qualifications: { type: String, default: '' },
    designation: { type: String, default: '' },
    bloodGroup: { type: String, default: '' },
    photo: { type: String, default: '' },
    rfidTag: { type: String, unique: true, sparse: true }
}, {
    collection: 'staff'
});

module.exports = mongoose.model('Staff', StaffSchema);