// backend/routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// Configure multer for memory storage (we'll use base64)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

// Upload avatar
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Convert to base64 for storage
        const base64Image = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype;
        const avatarUrl = `data:${mimeType};base64,${base64Image}`;

        // Update user
        const user = await User.findById(req.user.id);
        user.avatar = avatarUrl;
        await user.save();

        res.json({
            success: true,
            message: 'Avatar uploaded successfully',
            avatar: avatarUrl
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Upload failed' });
    }
});

module.exports = router;