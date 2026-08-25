const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Staff = require('../models/Staff');

router.get('/', async (req, res) => {
    try {
        const { studentId, rfidReaderId, status, date, class: studentClass } = req.query;
        let query = {};

        if (studentId) query.studentId = studentId;
        if (rfidReaderId) query.rfidReaderId = rfidReaderId;
        if (status) query.status = status;
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query.timestamp = { $gte: startOfDay, $lte: endOfDay };
        }
        if (studentClass) query.class = studentClass;

        const attendanceLogs = await Attendance.find(query).sort({ timestamp: -1 });
        res.json(attendanceLogs);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

router.get('/:studentId', async (req, res) => {
    try {
        const attendanceLogs = await Attendance.find({ studentId: req.params.studentId }).sort({ timestamp: -1 });
        if (attendanceLogs.length === 0) {
            return res.status(404).json({ msg: 'No attendance records found for this student' });
        }
        res.json(attendanceLogs);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { rfidTag, rfidReaderId } = req.body;

        let person = await Student.findOne({ rfidTag });
        let isStudent = true;
        if (!person) {
            person = await Staff.findOne({ rfidTag });
            isStudent = false;
        }

        if (!person) {
            return res.status(404).json({ msg: 'RFID tag not registered.' });
        }

        const now = new Date();
        const lateTimeThreshold = new Date();
        lateTimeThreshold.setHours(8, 0, 0, 0);

        let finalStatus = (now > lateTimeThreshold) ? 'Late' : 'Present';

        const newAttendance = new Attendance({
            rfidTag,
            rfidReaderId,
            studentId: person.studentId || null,
            staffId: person.staffId || null,
            student: isStudent ? person._id : null, // NEW: real Mongoose ref
            staff: isStudent ? null : person._id,   // NEW: real Mongoose ref
            studentName: person.name,
            class: person.class || null,
            section: person.section || null,
            status: finalStatus,
            timestamp: now
        });

        const savedAttendance = await newAttendance.save();
        res.status(201).json(savedAttendance);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;