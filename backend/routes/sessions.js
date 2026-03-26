const { sendSessionBookedEmail } = require('../utils/emailService');
const User = require('../models/User');
const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const { protect } = require('../middleware/auth');

// Create a session
router.post('/create', protect, async (req, res) => {
    try {
        const { mentorId, type, price } = req.body;
        
        console.log('Creating session for mentor:', mentorId, 'type:', type);
        
        const session = await Session.create({
            mentor: mentorId,
            student: req.user.id,
            type,
            price: price || 50,
            status: 'pending',
            paymentStatus: 'pending'
        });
        
        console.log('Session created:', session._id);
        
        res.status(201).json({
            success: true,
            data: session,
            message: 'Session created successfully'
        });
    } catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
});

module.exports = router;
