const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
    res.json({ message: 'Think Tank AI API is running!' });
});

// Import routes - simplified
const authRoutes = require('./routes/auth');

// Only add routes that exist
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});