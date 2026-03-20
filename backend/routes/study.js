// backend/routes/study.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.post('/track', protect, async (req, res) => {
    try {
        const { hours, topics } = req.body;
        const user = await User.findById(req.user.id);

        user.studyHours += hours;

        // Update streak
        const today = new Date().toDateString();
        if (user.lastStudyDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (user.lastStudyDate === yesterday.toDateString()) {
                user.streak++;
            } else {
                user.streak = 1;
            }
            user.lastStudyDate = today;
        }

        await user.save();

        res.json({
            success: true,
            data: {
                totalHours: user.studyHours,
                streak: user.streak,
                stars: user.stars
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/stats', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({
            success: true,
            data: {
                totalHours: user.studyHours,
                streak: user.streak,
                stars: user.stars
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;