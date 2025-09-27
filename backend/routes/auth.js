// routes/auth.js

const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Assuming User model is here
const auth = require('../middleware/auth'); // Assuming auth middleware is here
const bcrypt = require('bcryptjs'); // Needed for password hashing

// NOTE: Add your login/register routes here if they are in this file

// -------------------------------------------------------------------
// 2. Profile Update Route (The correct, secure implementation)
// -------------------------------------------------------------------
router.post('/update-profile', auth, async (req, res) => {
    // 1. ID ko hamesha token se lein (auth middleware se)
    // Yeh user ki identity hai, jo token se aati hai.
    const userIdFromToken = req.user.id; 

    // 2. Request body se update fields lein
    const { fullName, dob, gender, email, contact } = req.body; 

    // Data object for update
    const profileFields = {};
    if (fullName) profileFields.name = fullName; // Use 'name' field for update
    if (dob) profileFields.dob = dob;
    if (gender) profileFields.gender = gender;
    if (email) profileFields.email = email;
    if (contact) profileFields.contact = contact;

    if (Object.keys(profileFields).length === 0) {
        return res.status(400).json({ success: false, msg: 'No data provided for update.' });
    }

    try {
        // 3. User ko token ki ID se khojein aur update karein
        const user = await User.findByIdAndUpdate(
            userIdFromToken, 
            { $set: profileFields },
            { new: true, runValidators: true } // new: true returns the updated document
        ).select('-password'); 

        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found or Invalid Token.' });
        }

        // 4. Success response
        return res.json({ 
            success: true, 
            msg: 'Profile updated successfully!', 
            // Frontend ko naya user object bhejein
            user: {
                _id: user.id,
                name: user.name, 
                email: user.email,
                dob: user.dob,
                gender: user.gender,
                contact: user.contact
            }
        });

    } catch (err) {
        console.error("Profile Update Failed with Error:", err); 
        
        if (err.name === 'CastError') {
             // Ye error tab aayega jab token se mili ID galat format mein ho
            return res.status(401).json({ success: false, msg: 'Authorization Error: Token is invalid.' });
        }
        if (err.code === 11000) {
            return res.status(400).json({ success: false, msg: 'Email is already in use by another account.' });
        }
        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, msg: 'Data validation failed. Please check your fields.' });
        }

        res.status(500).json({ success: false, msg: 'Failed to update profile.' });
    }
});

// -------------------------------------------------------------------
// 3. Change Password Route
// -------------------------------------------------------------------
router.post('/change-password', auth, async (req, res) => {
    const userIdFromToken = req.user.id;
    const { currentPassword, newPassword } = req.body;

    try {
        let user = await User.findById(userIdFromToken);
        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found.' });
        }

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, msg: 'Invalid current password.' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.json({ success: true, msg: 'Password successfully changed!' });

    } catch (err) {
        console.error("Change Password Failed:", err);
        res.status(500).json({ success: false, msg: 'Failed to change password.' });
    }
});

module.exports = router;