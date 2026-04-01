const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Get all rooms
router.get('/', protect, async (req, res) => {
    try {
        const rooms = await Room.find({ isActive: true })
            .populate('creator', 'name avatar')
            .populate('members', 'name avatar')
            .sort('-createdAt');
        res.json({ success: true, data: rooms });
    } catch (error) {
        console.error('Error getting rooms:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get rooms user is in
router.get('/my-rooms', protect, async (req, res) => {
    try {
        const rooms = await Room.find({ 
            members: req.user.id,
            isActive: true 
        }).populate('creator', 'name avatar')
          .populate('members', 'name avatar');
        res.json({ success: true, data: rooms });
    } catch (error) {
        console.error('Error getting my rooms:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single room
router.get('/:roomId', protect, async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId)
            .populate('creator', 'name avatar')
            .populate('members', 'name avatar');
        
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }
        
        res.json({ success: true, data: room });
    } catch (error) {
        console.error('Error getting room:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create a room
router.post('/create', protect, async (req, res) => {
    try {
        const { name, description, subject, maxMembers } = req.body;
        
        const room = await Room.create({
            name,
            description,
            subject,
            creator: req.user.id,
            members: [req.user.id],
            maxMembers: maxMembers || 10
        });
        
        const populatedRoom = await Room.findById(room._id)
            .populate('creator', 'name avatar')
            .populate('members', 'name avatar');
        
        res.status(201).json({ success: true, data: populatedRoom });
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Join a room
router.post('/join/:roomId', protect, async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId);
        
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }
        
        if (room.members.includes(req.user.id)) {
            return res.status(400).json({ success: false, message: 'Already in room' });
        }
        
        if (room.members.length >= room.maxMembers) {
            return res.status(400).json({ success: false, message: 'Room is full' });
        }
        
        room.members.push(req.user.id);
        await room.save();
        
        const populatedRoom = await Room.findById(room._id)
            .populate('creator', 'name avatar')
            .populate('members', 'name avatar');
        
        res.json({ success: true, data: populatedRoom });
    } catch (error) {
        console.error('Error joining room:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Leave a room
router.post('/leave/:roomId', protect, async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId);
        
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }
        
        room.members = room.members.filter(m => m.toString() !== req.user.id);
        
        // If room is empty, delete it
        if (room.members.length === 0) {
            await Room.findByIdAndDelete(room._id);
            return res.json({ success: true, message: 'Room deleted (empty)' });
        }
        
        await room.save();
        res.json({ success: true, message: 'Left room' });
    } catch (error) {
        console.error('Error leaving room:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get room messages
router.get('/:roomId/messages', protect, async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId)
            .populate('messages.sender', 'name avatar');
        
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }
        
        res.json({ success: true, data: room.messages || [] });
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Send message to room
router.post('/:roomId/message', protect, async (req, res) => {
    try {
        const { content } = req.body;
        const room = await Room.findById(req.params.roomId);
        
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }
        
        if (!room.members.includes(req.user.id)) {
            return res.status(403).json({ success: false, message: 'Not a member of this room' });
        }
        
        const message = {
            sender: req.user.id,
            content,
            createdAt: new Date()
        };
        
        room.messages.push(message);
        await room.save();
        
        const populatedMessage = await Room.populate(message, { path: 'sender', select: 'name avatar' });
        
        res.json({ success: true, data: populatedMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
