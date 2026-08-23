const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret_key'; 

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body; 

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, msg: 'Please enter all fields.' });
    }
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ success: false, msg: 'User already exists.' });

        user = new User({ name, email, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const payload = { user: { id: user.id } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.status(201).json({ 
                success: true, 
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    dob: user.dob,
                    gender: user.gender,
                    contact: user.contact,
                    role: user.role,
                    userId: user.userId
                },
                msg: 'Registration successful and logged in.' 
            });
        });
    } catch (err) {
        console.error("Registration Failed:", err.message);
        if (err.code === 11000) {
            return res.status(400).json({ success: false, msg: 'Email already in use.' });
        }
        res.status(500).json({ success: false, msg: 'Server error during registration.' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ success: false, msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, msg: 'Invalid Credentials' });

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        res.json({ 
            success: true, 
            token, 
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                dob: user.dob,
                gender: user.gender,
                contact: user.contact
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, msg: 'Server error' });
    }
});

router.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({ success: true, user });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, msg: 'Server error.' });
    }
});

router.post('/update-profile', auth, async (req, res) => {
    try {
        const { userId, name, dob, gender, email, contact } = req.body;
        let user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, msg: 'User not found' });

        user.name = name || user.name;
        user.dob = dob || user.dob;
        user.gender = gender || user.gender;
        user.email = email || user.email;
        user.contact = contact || user.contact;
        await user.save();

        res.json({ success: true, msg: 'Profile updated successfully', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, msg: 'Server error while updating profile.' });
    }
});

router.post('/change-password', auth, async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;
        let user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, msg: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ success: false, msg: 'Current password is incorrect' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ success: true, msg: 'Password changed successfully!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, msg: 'Server error while changing password.' });
    }
});

module.exports = router;
