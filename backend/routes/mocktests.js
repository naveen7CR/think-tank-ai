// backend/routes/mocktests.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Get all mock tests
router.get('/', protect, async (req, res) => {
    try {
        const tests = [
            {
                _id: '1',
                title: 'Python Programming Basics',
                subject: 'Computer Science',
                difficulty: 'Easy',
                totalMarks: 50,
                timeLimit: 30
            },
            {
                _id: '2',
                title: 'Calculus Fundamentals',
                subject: 'Mathematics',
                difficulty: 'Medium',
                totalMarks: 100,
                timeLimit: 60
            },
            {
                _id: '3',
                title: 'Physics: Mechanics',
                subject: 'Physics',
                difficulty: 'Hard',
                totalMarks: 75,
                timeLimit: 45
            }
        ];

        res.json({
            success: true,
            data: tests
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Start a test
router.post('/:id/start', protect, async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                testId: req.params.id,
                startedAt: new Date(),
                timeLimit: 60
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Submit test
router.post('/:id/submit', protect, async (req, res) => {
    try {
        const { answers, timeTaken } = req.body;

        res.json({
            success: true,
            data: {
                score: 85,
                percentage: 85,
                totalMarks: 100,
                strengths: ['Algorithms', 'Data Structures'],
                weaknesses: ['Dynamic Programming'],
                recommendations: 'Practice more on DP problems',
                rank: '🌟 Advanced'
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;