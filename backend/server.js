// backend/server.js - Complete Version
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
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Make io accessible to routes
app.set('io', io);

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const questionRoutes = require('./routes/questions');
const mentorshipRoutes = require('./routes/mentorship');
const mocktestRoutes = require('./routes/mocktests');
const studyRoutes = require('./routes/study');
const aiRoutes = require('./routes/ai');
const chatRoutes = require('./routes/chat');
const knowledgeRoutes = require('./routes/knowledge');
const sessionRoutes = require('./routes/sessions');
const paymentRoutes = require('./routes/payment');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/mocktests', mocktestRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/payment', paymentRoutes);

// Socket.IO for real-time chat
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
    });

    socket.on('send_message', (data) => {
        io.to(data.receiverId).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

app.get('/', (req, res) => {
    res.json({ message: 'Think Tank AI API is running!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.IO ready for real-time chat`);
});