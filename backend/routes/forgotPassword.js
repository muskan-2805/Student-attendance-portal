const express = require('express');
const router = express.Router();
const User = require('../models/User');
const transporter = require('../config/email');
const crypto = require('crypto'); // Built-in Node.js module
const bcrypt = require('bcryptjs'); // You will need to install this: npm install bcryptjs

// @route   POST /api/auth/forgot-password
// @desc    Generate OTP and send it to the user's email
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: 'If an account with that email exists, an OTP has been sent.' });
        }

        // Generate a 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        
        // Set OTP and expiration time (e.g., 10 minutes)
        user.otp = otp;
        user.otpExpires = Date.now() + 600000; // 10 minutes in milliseconds

        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ msg: 'If an account with that email exists, an OTP has been sent.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/auth/reset-password
// @desc    Verify OTP and reset the user's password
router.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        // Verify OTP and check if it's expired
        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ msg: 'Invalid or expired OTP.' });
        }

        // Hash the new password before saving
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        
        // Clear OTP fields to prevent reuse
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        res.status(200).json({ msg: 'Password reset successfully!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
