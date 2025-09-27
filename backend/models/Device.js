const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  deviceName: { type: String },
  class: { type: String },
  rfidReaderId: { type: String, unique: true, sparse: true },
  location: { type: String }
});

module.exports = mongoose.model('Device', DeviceSchema);