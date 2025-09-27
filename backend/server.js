require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Path module import karein

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Uploads folder ko static directory ke roop mein serve karein
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Atlas Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => console.error('MongoDB  connection error:', err));

// Routes (API Endpoints)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/attendance', require('./routes/attendance'));

// Naye password reset routes ko connect karein
app.use('/api/forgetPassword', require('./routes/forgotPassword'));

// Server ko start karna
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
