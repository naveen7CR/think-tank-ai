// backend/routes/mentorship.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// Get all mentors with ranking from DATABASE
router.get('/mentors', protect, async (req, res) => {
    try {
        const { subject } = req.query;
        
        // Build query
        let query = { role: 'mentor' };
        
        // Filter by subject if provided
        if (subject && subject !== '') {
            query.skillTags = subject;
        }
        
        // Fetch real mentors from database
        const mentors = await User.find(query)
            .select('name email avatar stars mentorRating totalSessions skillTags bio');
        
        // Add rank based on stars
        const rankedMentors = mentors.map((mentor, index) => ({
            ...mentor.toObject(),
            rank: index + 1,
            level: mentor.mentorRating >= 4.5 ? '⭐ Expert Mentor' : 
                   mentor.mentorRating >= 3.5 ? '🌟 Senior Mentor' : '✨ Junior Mentor'
        }));
        
        res.json({
            success: true,
            count: rankedMentors.length,
            data: rankedMentors
        });
    } catch (error) {
        console.error('Error fetching mentors:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error: ' + error.message 
        });
    }
});

module.exports = router;               
