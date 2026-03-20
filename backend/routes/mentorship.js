// backend/routes/mentorship.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Get all mentors with ranking
router.get('/mentors', protect, async (req, res) => {
    try {
        const { subject } = req.query;

        // Mock mentor data
        const mentors = [
            {
                _id: '1',
                name: 'Dr. Sarah Johnson',
                avatar: 'https://via.placeholder.com/60',
                stars: 1250,
                mentorRating: 4.9,
                totalSessions: 342,
                skillTags: ['Mathematics', 'Physics'],
                bio: 'PhD in Mathematics with 10+ years teaching experience',
                level: '⭐ Expert Mentor'
            },
            {
                _id: '2',
                name: 'Prof. Michael Chen',
                avatar: 'https://via.placeholder.com/60',
                stars: 980,
                mentorRating: 4.8,
                totalSessions: 287,
                skillTags: ['Computer Science', 'Engineering'],
                bio: 'Senior Software Engineer at Google, teaching coding for 8 years',
                level: '🌟 Senior Mentor'
            },
            {
                _id: '3',
                name: 'Dr. Emily Rodriguez',
                avatar: 'https://via.placeholder.com/60',
                stars: 750,
                mentorRating: 4.7,
                totalSessions: 156,
                skillTags: ['Chemistry', 'Biology'],
                bio: 'Research scientist passionate about teaching',
                level: '🌟 Senior Mentor'
            }
        ];

        // Filter by subject if provided
        let filteredMentors = mentors;
        if (subject) {
            filteredMentors = mentors.filter(m => m.skillTags.includes(subject));
        }

        // Add rank
        const rankedMentors = filteredMentors.map((mentor, index) => ({
            ...mentor,
            rank: index + 1
        }));

        res.json({
            success: true,
            count: rankedMentors.length,
            data: rankedMentors
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Request a session
router.post('/request', protect, async (req, res) => {
    try {
        const { mentorId, sessionType, questionId } = req.body;

        const pricing = { chat: 50, video: 100, resource: 30 };
        const baseAmount = pricing[sessionType] || 50;
        const platformFee = baseAmount * 0.1;
        const mentorEarnings = baseAmount - platformFee;

        res.status(201).json({
            success: true,
            data: {
                id: Date.now(),
                mentor: mentorId,
                student: req.user.id,
                sessionType,
                paymentAmount: baseAmount,
                commission: platformFee,
                mentorEarnings,
                status: 'pending'
            },
            paymentRequired: baseAmount,
            platformFee: platformFee
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Complete session
router.put('/:id/complete', protect, async (req, res) => {
    try {
        const { rating, review } = req.body;

        res.json({
            success: true,
            message: 'Session completed',
            mentorNewRating: 4.8
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;