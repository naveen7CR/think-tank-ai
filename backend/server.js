const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/database');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Make io accessible to routes
app.set('io', io);

app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json());

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Think Tank AI API is running!' });
});

// Simple test route
app.get('/api/simple-test', (req, res) => {
    res.json({ message: 'Simple test route works!' });
});

// Import all routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/upload');
const questionRoutes = require('./routes/questions');
const mentorshipRoutes = require('./routes/mentorship');
const mocktestRoutes = require('./routes/mocktests');
const studyRoutes = require('./routes/study');
const aiRoutes = require('./routes/ai');
const chatRoutes = require('./routes/chat');
const knowledgeRoutes = require('./routes/knowledge');
const sessionRoutes = require('./routes/sessions');
const paymentRoutes = require('./routes/payment');
const videoRoutes = require('./routes/video');
const roomRoutes = require('./routes/rooms');

// Mount all routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/mocktests', mocktestRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/rooms', roomRoutes);

// ============ SOCKET.IO CONNECTIONS ============
io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    // User joins their personal room for private messages
    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`📱 User ${userId} joined personal room`);
    });

    // Join a study room
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`📚 User joined room: ${roomId}`);
    });

    // Send private message
    socket.on('send_message', (data) => {
        io.to(data.receiverId).emit('receive_message', {
            content: data.content,
            senderId: data.senderId,
            senderName: data.senderName,
            createdAt: new Date()
        });
    });

    // Send room message
    socket.on('room-message', (data) => {
        io.to(data.roomId).emit('room-message', {
            content: data.content,
            senderId: data.senderId,
            senderName: data.senderName,
            timestamp: new Date()
        });
    });

    // Video call signaling
    socket.on('video-offer', (data) => {
        io.to(data.targetUserId).emit('video-offer', {
            offer: data.offer,
            from: data.from,
            callId: data.callId
        });
    });

    socket.on('ice-candidate', (data) => {
        io.to(data.targetUserId).emit('ice-candidate', {
            candidate: data.candidate,
            from: data.from,
            callId: data.callId
        });
    });

    socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`🔌 Socket.IO ready for real-time communication`);
});