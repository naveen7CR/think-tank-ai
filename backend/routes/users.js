// backend/routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/mentors', protect, async (req, res) => {
    try {
        const mentors = await User.find({ role: 'mentor' })
            .select('name email avatar stars mentorRating skillTags bio')
            .sort('-stars');
        res.json({ success: true, data: mentors });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.put('/profile', protect, async (req, res) => {
    try {
        const { name, bio, skillTags } = req.body;
        const user = await User.findById(req.user.id);
        if (name) user.name = name;
        if (bio) user.bio = bio;
        if (skillTags) user.skillTags = skillTags;
        await user.save();
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;