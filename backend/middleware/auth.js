// middleware/auth.js

const jwt = require('jsonwebtoken');

// IMPORTANT: Replace 'your_jwt_secret' with the exact secret key used 
// when you sign your JWT token during login/registration.

module.exports = function (req, res, next) {
    // 1. Get token from header (Client sends it as 'x-auth-token')
    const token = req.header('x-auth-token');

    // 2. Check if token exists
    if (!token) {
        // Stop the request immediately if no token is found
        return res.status(401).json({ msg: 'No token, authorization denied.' });
    }

    // 3. Verify token
    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        
        // Attach the decoded user payload to the request object
        // This makes the user ID available as req.user.id in auth.js
        req.user = decoded.user;
        
        // Move to the next middleware or the route handler
        next();
    } catch (err) {
        // Token is invalid (e.g., expired or tampered with)
        console.error("JWT Verification failed:", err.message);
        return res.status(401).json({ msg: 'Token is not valid or has expired.' });
    }
};