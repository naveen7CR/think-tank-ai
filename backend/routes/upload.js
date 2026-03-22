// backend/routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images allowed'));
        }
    }
});

router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const base64Image = req.file.buffer.toString('base64');
        const avatarUrl = `data:${req.file.mimetype};base64,${base64Image}`;

        const user = await User.findById(req.user.id);
        user.avatar = avatarUrl;
        await user.save();

        res.json({ success: true, avatar: avatarUrl });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, message: 'Upload failed' });
    }
});

module.exports = router;