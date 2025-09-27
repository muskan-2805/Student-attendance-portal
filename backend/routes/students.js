const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const path = require('path');
const fs = require('fs');
const multer = require('multer'); // Import multer

// Middleware to check if user is authenticated (Optional but recommended)
const auth = (req, res, next) => {
    // We'll keep this simple for now. We can expand on it later.
    next();
};

// --- Multer Configuration for Photo Uploads ---

// Set up disk storage for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        // Check if the 'uploads' directory exists, if not, create it
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
        }
        cb(null, uploadsDir);
    },
    // The `req` object in this function does NOT have `req.params` yet.
    // Use a reliable unique identifier, like a timestamp, here.
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// --- New Endpoint for Photo Uploads ---

// @route  POST /api/students/:id/photo
// @desc   Upload and save a photo for a specific student
router.post('/:id/photo', auth, upload.single('photo'), async (req, res) => {
    const { id } = req.params;
    if (!req.file) {
        return res.status(400).json({ msg: 'No file uploaded.' });
    }

    // Now, you have access to both `req.file` and `req.params.id`.
    const newFilename = `${id}-${req.file.filename}`;
    const oldPath = req.file.path;
    const newPath = path.join(path.dirname(oldPath), newFilename);

    // Rename the file to include the student ID
    fs.rename(oldPath, newPath, async (err) => {
        if (err) {
            console.error('File rename failed:', err);
            return res.status(500).send('Server Error');
        }

        const photoPath = `/uploads/${newFilename}`;

        try {
            const student = await Student.findOneAndUpdate(
                { studentId: id }, // Find student by their unique 'studentId'
                { $set: { photo: photoPath } }, // Update the 'photo' field
                { new: true, runValidators: true }
            );

            if (!student) {
                return res.status(404).json({ msg: 'Student not found.' });
            }

            res.status(200).json({
                msg: 'Photo updated successfully!',
                photoUrl: `http://localhost:${process.env.PORT || 5000}${photoPath}`
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });
});

// --- Existing Routes (No changes needed here) ---

// @route  POST /api/students
// @desc   Add a new student
router.post('/', auth, async (req, res) => {
    const { studentId, name, rfidTag, class: studentClass, section, ...rest } = req.body;
    try {
        let student = await Student.findOne({ studentId });
        if (student) {
            return res.status(400).json({ msg: 'Student with this ID already exists' });
        }
        student = new Student({ studentId, name, rfidTag, class: studentClass, section, ...rest });
        await student.save();
        res.status(201).json({ msg: 'Student added successfully!', student });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route  GET /api/students
// @desc   List all students
router.get('/', async (req, res) => {
    try {
        const students = await Student.find();
        const studentsWithPhotos = students.map(student => {
            const studentObj = student.toObject();
            if (studentObj.photo) {
                studentObj.photo = `http://localhost:${process.env.PORT || 5000}${studentObj.photo}`;
            }
            return studentObj;
        });
        res.json(studentsWithPhotos);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route  GET /api/students/:id
// @desc   View a specific student's details
router.get('/:id', async (req, res) => {
    try {
        const student = await Student.findOne({ studentId: req.params.id });
        if (!student) {
            return res.status(404).json({ msg: 'Student not found' });
        }
        const studentData = student.toObject();
        if (studentData.photo) {
            studentData.photo = `http://localhost:${process.env.PORT || 5000}${studentData.photo}`;
        }
        res.json(studentData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route  PUT /api/students/:id
// @desc   Update a specific student's details
router.put('/:id', auth, async (req, res) => {
    try {
        let student = await Student.findOne({ studentId: req.params.id });
        if (!student) {
            return res.status(404).json({ msg: 'Student not found' });
        }

        Object.assign(student, req.body);
        await student.save();
        res.json({ msg: 'Student updated successfully!', student });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route  DELETE /api/students/:id
// @desc   Delete a specific student
router.delete('/:id', auth, async (req, res) => {
    try {
        const student = await Student.findOneAndDelete({ studentId: req.params.id });
        if (!student) {
            return res.status(404).json({ msg: 'Student not found' });
        }
        res.json({ msg: 'Student deleted successfully!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;