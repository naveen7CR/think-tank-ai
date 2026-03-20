// backend/routes/payment.js
const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const { protect } = require('../middleware/auth');

// Mock payment - in production use Stripe
router.post('/pay/:sessionId', protect, async (req, res) => {
    try {
        const session = await Session.findById(req.params.sessionId);

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        session.paymentStatus = 'paid';
        session.status = 'active';
        await session.save();

        res.json({
            success: true,
            message: 'Payment successful!',
            data: session
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;