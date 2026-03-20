// backend/routes/questions.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Get all questions
router.get('/', protect, async (req, res) => {
    try {
        // Mock response for now
        res.json({
            success: true,
            data: []
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Ask a question
router.post('/', protect, async (req, res) => {
    try {
        const { title, description } = req.body;

        // Simple AI classification
        const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];
        let detectedSubject = 'General';

        const lowerDesc = description.toLowerCase();
        if (lowerDesc.includes('calculus') || lowerDesc.includes('algebra') || lowerDesc.includes('math')) {
            detectedSubject = 'Mathematics';
        } else if (lowerDesc.includes('python') || lowerDesc.includes('code') || lowerDesc.includes('programming')) {
            detectedSubject = 'Computer Science';
        } else if (lowerDesc.includes('force') || lowerDesc.includes('energy') || lowerDesc.includes('physics')) {
            detectedSubject = 'Physics';
        }

        let difficulty = 'Medium';
        if (lowerDesc.includes('hard') || lowerDesc.includes('advanced') || lowerDesc.includes('complex')) {
            difficulty = 'Hard';
        } else if (lowerDesc.includes('easy') || lowerDesc.includes('basic') || lowerDesc.includes('simple')) {
            difficulty = 'Easy';
        }

        res.status(201).json({
            success: true,
            data: {
                id: Date.now(),
                title,
                description,
                subject: detectedSubject,
                difficulty,
                status: 'pending'
            },
            aiAnalysis: {
                subject: detectedSubject,
                difficulty: difficulty,
                confidence: 0.85
            },
            suggestedMentor: {
                name: "Expert Mentor",
                rating: 4.8,
                stars: 500
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Answer a question
router.put('/:id/answer', protect, async (req, res) => {
    try {
        const { solution } = req.body;

        res.json({
            success: true,
            message: 'Question answered successfully',
            starsEarned: 10
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;