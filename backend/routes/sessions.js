// backend/routes/sessions.js
const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.post('/create', protect, async (req, res) => {
    try {
        const { mentorId, type, price } = req.body;

        const session = await Session.create({
            mentor: mentorId,
            student: req.user.id,
            type,
            price: price || 50,
            platformFee: price ? price * 0.1 : 5,
            mentorEarnings: price ? price * 0.9 : 45,
            status: 'pending'
        });

        res.json({ success: true, data: session });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.put('/:id/complete', protect, async (req, res) => {
    try {
        const { rating, review } = req.body;
        const session = await Session.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        session.status = 'completed';
        session.endTime = new Date();
        session.rating = rating;
        session.review = review;
        await session.save();

        // Update mentor rating
        const mentor = await User.findById(session.mentor);
        const allSessions = await Session.find({ mentor: session.mentor, rating: { $ne: null } });
        const avgRating = allSessions.reduce((sum, s) => sum + s.rating, 0) / allSessions.length;
        mentor.mentorRating = avgRating;
        await mentor.save();

        res.json({ success: true, data: session });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;