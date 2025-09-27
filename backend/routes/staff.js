const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const multer = require('multer'); // Import multer
const path = require('path'); // Import path
const fs = require('fs'); // Import fs to create directory

// Middleware for authentication (optional for this demo)
const auth = (req, res, next) => {
    // For now, we will simply proceed. In a real app, you would verify a token here.
    next();
};

// --- Multer Configuration for Photo Uploads ---

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        // Check if the 'uploads' directory exists, if not, create it
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
        }
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Create a unique filename
        cb(null, `${req.params.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// --- New Endpoint for Photo Uploads ---

// @route   POST /api/staff/:id/photo
// @desc    Upload and save a photo for a specific staff member
router.post('/:id/photo', auth, upload.single('photo'), async (req, res) => {
    const { id } = req.params;
    if (!req.file) {
        return res.status(400).json({ msg: 'No file uploaded.' });
    }

    const photoPath = `/uploads/${req.file.filename}`;

    try {
        const staff = await Staff.findOneAndUpdate(
            { staffId: id },
            { $set: { photo: photoPath } },
            { new: true, runValidators: true }
        );

        if (!staff) {
            return res.status(404).json({ msg: 'Staff member not found.' });
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

// --- Existing Routes (Updated to handle photo URL) ---

// @route   POST /api/staff
// @desc    Naya staff member add karein
router.post('/', auth, async (req, res) => {
    const { staffId, fullName, rfidTag, ...rest } = req.body;
    try {
        let staff = await Staff.findOne({ staffId });
        if (staff) {
            return res.status(400).json({ msg: 'Staff with this ID already exists' });
        }
        
        staff = new Staff({ staffId, fullName, rfidTag, ...rest });
        await staff.save();
        res.status(201).json({ msg: 'Staff member added successfully!', staff });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/staff
// @desc    Sabhi staff members ko list karein
router.get('/', async (req, res) => {
    try {
        const staff = await Staff.find();
        res.json(staff);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/staff/:id
// @desc    Ek specific staff member ki details lein
router.get('/:id', async (req, res) => {
    try {
        const staff = await Staff.findOne({ staffId: req.params.id });
        if (!staff) {
            return res.status(404).json({ msg: 'Staff member not found' });
        }
        // Frontend ke liye photo path ko full URL mein badal dein
        if (staff.photo) {
            staff.photo = `http://localhost:${process.env.PORT || 5000}${staff.photo}`;
        }
        res.json(staff);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/staff/:id
// @desc    Ek specific staff member ki details update karein
router.put('/:id', auth, async (req, res) => {
    try {
        let staff = await Staff.findOne({ staffId: req.params.id });
        if (!staff) {
            return res.status(404).json({ msg: 'Staff member not found' });
        }

        Object.assign(staff, req.body);
        await staff.save();
        res.json({ msg: 'Staff member updated successfully!', staff });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/staff/:id
// @desc    Ek specific staff member ko delete karein
router.delete('/:id', auth, async (req, res) => {
    try {
        const staff = await Staff.findOneAndDelete({ staffId: req.params.id });
        if (!staff) {
            return res.status(404).json({ msg: 'Staff member not found' });
        }
        res.json({ msg: 'Staff member deleted successfully!' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;