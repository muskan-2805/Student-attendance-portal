const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // Password hashing ke liye
const jwt = require('jsonwebtoken'); // Authentication token ke liye
const User = require('../models/User'); // User model ko import karein

// @route   POST /api/auth/register
// @desc    Naye user ko register karein
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Check karein ki email pehle se exist karta hai ya nahi
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({ name, email, password });

        // Password ko hash karein
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // MongoDB ke _id ko userId ke roop mein assign karein
        // Isse userId hamesha unique rahega
        user.userId = user._id;

        // User ko database mein save karein
        await user.save();

        res.status(201).json({ msg: 'User registered successfully!' });

    } catch (err) {
        console.error(err.message);
        // JSON format mein error response bhejein
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   POST /api/auth/login
// @desc    User login karein aur token return karein
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check karein ki user exist karta hai ya nahi
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Password ko compare karein
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // JSON Web Token (JWT) generate karein
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };
        jwt.sign(
            payload,
            'your_jwt_secret', // Secret key, isko environment variable mein rakhna chahiye
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                // Bhej dein user ka data aur token
                res.json({
                    token,
                    role: user.role,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        dob: user.dob,
                        gender: user.gender,
                        contact: user.contact
                    }
                });
            }
        );

    } catch (err) {
        console.error(err.message);
        // JSON format mein error response bhejein
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   POST /api/auth/update-profile
// @desc    User profile ko update karein
// @access  Private
router.post('/update-profile', async (req, res) => {
    try {
        const { userId, fullName, dob, gender, email, contact } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name: fullName, dob, gender, email, contact },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, msg: 'User not found.' });
        }

        res.status(200).json({ success: true, msg: 'Profile updated successfully!', user: updatedUser });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, msg: 'Failed to update profile.' });
    }
});

// @route   POST /api/auth/change-password
// @desc    User password ko change karein
// @access  Private
router.post('/change-password', async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, msg: 'Incorrect current password.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ success: true, msg: 'Password changed successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, msg: 'Failed to change password.' });
    }
});

module.exports = router;