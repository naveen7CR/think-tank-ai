// backend/routes/chat.js
const { sendNewMessageNotification } = require('../utils/emailService');
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Get all conversations for current user
router.get('/conversations', protect, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [{ sender: req.user._id }, { receiver: req.user._id }]
        }).sort('-createdAt');

        const userIds = new Set();
        messages.forEach(msg => {
            userIds.add(msg.sender.toString());
            userIds.add(msg.receiver.toString());
        });

        const users = await User.find({ _id: { $in: Array.from(userIds) } })
            .select('name avatar role stars');

        const conversations = Array.from(userIds)
            .filter(id => id !== req.user._id.toString())
            .map(id => {
                const user = users.find(u => u._id.toString() === id);
                const lastMessage = messages.find(m =>
                    m.sender.toString() === id || m.receiver.toString() === id
                );
                const unreadCount = messages.filter(m =>
                    m.sender.toString() === id &&
                    m.receiver.toString() === req.user._id.toString() &&
                    !m.read
                ).length;

                return { user, lastMessage, unreadCount };
            });

        res.json({ success: true, data: conversations });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get messages with specific user
router.get('/messages/:userId', protect, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user._id, receiver: req.params.userId },
                { sender: req.params.userId, receiver: req.user._id }
            ]
        }).sort('createdAt');

        // Mark messages as read
        await Message.updateMany(
            { sender: req.params.userId, receiver: req.user._id, read: false },
            { read: true }
        );

        res.json({ success: true, data: messages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Send message
router.post('/send', protect, async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        
        // Validate receiverId is a valid MongoDB ObjectId
        const isValidId = /^[0-9a-fA-F]{24}$/.test(receiverId);
        
        if (!isValidId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid receiver ID. Please select a real mentor from the list.' 
            });
        }
        
        // Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ 
                success: false, 
                message: 'Receiver not found' 
            });
        }
        
        const message = await Message.create({
            sender: req.user._id,
            receiver: receiverId,
            content
        });
        
        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name avatar');
        
        // Send email notification (optional)
        try {
            if (receiver.email) {
                const { sendNewMessageNotification } = require('../utils/emailService');
                await sendNewMessageNotification(receiver.email, req.user.name, content);
                console.log('📧 Email sent to:', receiver.email);
            }
        } catch (emailError) {
            console.error('Email error:', emailError);
        }
        
        res.json({ success: true, data: populatedMessage });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error: ' + error.message 
        });
    }
});
module.exports = router;

