// backend/routes/video.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Store active calls
const activeCalls = new Map();

// Start a call
router.post('/start', protect, async (req, res) => {
    try {
        const { targetUserId, callType = 'video' } = req.body;

        const callId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        activeCalls.set(callId, {
            caller: req.user.id,
            receiver: targetUserId,
            callType,
            status: 'initiating',
            startTime: new Date()
        });

        res.json({
            success: true,
            callId,
            message: 'Call initiated'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to start call' });
    }
});

// End a call
router.post('/end/:callId', protect, async (req, res) => {
    try {
        const { callId } = req.params;

        if (activeCalls.has(callId)) {
            const call = activeCalls.get(callId);
            call.status = 'ended';
            call.endTime = new Date();
            activeCalls.delete(callId);
        }

        res.json({
            success: true,
            message: 'Call ended'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to end call' });
    }
});

module.exports = router;