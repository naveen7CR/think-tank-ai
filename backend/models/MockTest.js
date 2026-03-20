// backend/models/MockTest.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    text: String,
    options: [String],
    correctAnswer: Number,
    explanation: String,
    marks: {
        type: Number,
        default: 1
    },
    topic: String
});

const mockTestSchema = new mongoose.Schema({
    title: String,
    subject: String,
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard']
    },
    questions: [questionSchema],
    totalMarks: Number,
    timeLimit: Number,
    isActive: {
        type: Boolean,
        default: true
    }
});

const testResultSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MockTest'
    },
    answers: [{
        questionIndex: Number,
        selectedAnswer: Number,
        isCorrect: Boolean
    }],
    score: Number,
    percentage: Number,
    timeTaken: Number,
    completedAt: Date,
    weaknesses: [String],
    strengths: [String]
});

module.exports = {
    MockTest: mongoose.model('MockTest', mockTestSchema),
    TestResult: mongoose.model('TestResult', testResultSchema)
};