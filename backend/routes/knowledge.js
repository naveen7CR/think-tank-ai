// backend/routes/knowledge.js
const express = require('express');
const router = express.Router();
const KnowledgeGraph = require('../models/KnowledgeGraph');
const { protect } = require('../middleware/auth');

// Predefined learning paths
const learningPaths = {
    'Computer Science': [
        { id: 'cs1', name: 'Programming Basics', difficulty: 'Beginner', prerequisites: [] },
        { id: 'cs2', name: 'Data Structures', difficulty: 'Intermediate', prerequisites: ['cs1'] },
        { id: 'cs3', name: 'Algorithms', difficulty: 'Advanced', prerequisites: ['cs2'] },
        { id: 'cs4', name: 'Databases', difficulty: 'Intermediate', prerequisites: ['cs1'] },
        { id: 'cs5', name: 'Web Development', difficulty: 'Intermediate', prerequisites: ['cs1'] },
        { id: 'cs6', name: 'Machine Learning', difficulty: 'Expert', prerequisites: ['cs2', 'cs3'] }
    ],
    'Mathematics': [
        { id: 'math1', name: 'Algebra', difficulty: 'Beginner', prerequisites: [] },
        { id: 'math2', name: 'Geometry', difficulty: 'Beginner', prerequisites: [] },
        { id: 'math3', name: 'Calculus', difficulty: 'Advanced', prerequisites: ['math1'] },
        { id: 'math4', name: 'Linear Algebra', difficulty: 'Advanced', prerequisites: ['math1'] },
        { id: 'math5', name: 'Statistics', difficulty: 'Intermediate', prerequisites: ['math1'] }
    ],
    'Physics': [
        { id: 'phy1', name: 'Classical Mechanics', difficulty: 'Beginner', prerequisites: [] },
        { id: 'phy2', name: 'Thermodynamics', difficulty: 'Intermediate', prerequisites: ['phy1'] },
        { id: 'phy3', name: 'Electromagnetism', difficulty: 'Advanced', prerequisites: ['phy1'] },
        { id: 'phy4', name: 'Quantum Physics', difficulty: 'Expert', prerequisites: ['phy3'] }
    ]
};

// Build knowledge graph
router.post('/build', protect, async (req, res) => {
    try {
        const { subject } = req.body;

        const topics = learningPaths[subject];
        if (!topics) {
            return res.status(400).json({ success: false, message: 'Subject not found' });
        }

        const nodes = topics.map(topic => ({
            id: topic.id,
            name: topic.name,
            type: 'topic',
            difficulty: topic.difficulty,
            completed: false,
            prerequisites: topic.prerequisites,
            score: 0
        }));

        // Calculate learning path (topological order)
        const learningPath = [];
        const visited = new Set();

        const dfs = (nodeId) => {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);
            const node = nodes.find(n => n.id === nodeId);
            node.prerequisites.forEach(prereq => dfs(prereq));
            learningPath.push(nodeId);
        };

        nodes.forEach(node => dfs(node.id));

        let knowledgeGraph = await KnowledgeGraph.findOne({ user: req.user._id, subject });

        if (knowledgeGraph) {
            knowledgeGraph.nodes = nodes;
            knowledgeGraph.learningPath = learningPath;
            knowledgeGraph.progress = (knowledgeGraph.completedNodes.length / nodes.length) * 100;
        } else {
            knowledgeGraph = await KnowledgeGraph.create({
                user: req.user._id,
                subject,
                nodes,
                learningPath,
                completedNodes: [],
                progress: 0,
                recommendedNext: [learningPath[0]]
            });
        }

        await knowledgeGraph.save();

        res.json({ success: true, data: knowledgeGraph });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Complete a topic
router.put('/complete/:nodeId', protect, async (req, res) => {
    try {
        const { subject, score } = req.body;

        const knowledgeGraph = await KnowledgeGraph.findOne({
            user: req.user._id,
            subject
        });

        if (!knowledgeGraph) {
            return res.status(404).json({ success: false, message: 'Graph not found' });
        }

        const node = knowledgeGraph.nodes.find(n => n.id === req.params.nodeId);
        if (!node) {
            return res.status(404).json({ success: false, message: 'Node not found' });
        }

        if (!knowledgeGraph.completedNodes.includes(node.id)) {
            knowledgeGraph.completedNodes.push(node.id);
            node.completed = true;
            node.score = score || 100;

            // Update progress
            knowledgeGraph.progress = (knowledgeGraph.completedNodes.length / knowledgeGraph.nodes.length) * 100;

            // Update recommendations
            const completedIds = new Set(knowledgeGraph.completedNodes);
            knowledgeGraph.recommendedNext = knowledgeGraph.learningPath.filter(id =>
                !completedIds.has(id) &&
                knowledgeGraph.nodes.find(n => n.id === id).prerequisites.every(p => completedIds.has(p))
            );
        }

        await knowledgeGraph.save();

        res.json({
            success: true,
            data: knowledgeGraph,
            message: `✅ Completed ${node.name}! Progress: ${knowledgeGraph.progress.toFixed(0)}%`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get knowledge graph
router.get('/my-graph', protect, async (req, res) => {
    try {
        const { subject } = req.query;
        const knowledgeGraph = await KnowledgeGraph.findOne({
            user: req.user._id,
            subject
        });

        res.json({ success: true, data: knowledgeGraph || null });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;