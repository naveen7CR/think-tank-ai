// backend/models/KnowledgeGraph.js
const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
    id: String,
    name: String,
    type: String,
    difficulty: String,
    completed: {
        type: Boolean,
        default: false
    },
    score: Number,
    prerequisites: [String]
});

const knowledgeGraphSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    subject: String,
    nodes: [nodeSchema],
    learningPath: [String],
    completedNodes: [String],
    progress: {
        type: Number,
        default: 0
    },
    recommendedNext: [String]
}, {
    timestamps: true
});

module.exports = mongoose.model('KnowledgeGraph', knowledgeGraphSchema);