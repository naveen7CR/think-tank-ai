// backend/routes/ai.js - OpenAI GPT-4 Assistant
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

router.post('/ask', protect, async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a question'
            });
        }

        console.log('📝 Question:', question);

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",  // You can use "gpt-4" if you have access
            messages: [
                {
                    role: "system",
                    content: "You are ThinkTank AI, a helpful, enthusiastic study assistant for college students. Provide clear, detailed, and engaging explanations. Use examples and markdown formatting. Be encouraging!"
                },
                {
                    role: "user",
                    content: question
                }
            ],
            temperature: 0.7,
            max_tokens: 1000,
        });

        const answer = completion.choices[0].message.content;

        console.log('✅ Response generated');

        // Generate follow-up suggestions based on question type
        let suggestions = [
            "Tell me more about this topic",
            "Give me examples",
            "Explain it differently"
        ];

        const lowerQ = question.toLowerCase();
        if (lowerQ.includes('explain') || lowerQ.includes('what is')) {
            suggestions = [
                `Can you give me more examples of ${question.substring(0, 30)}?`,
                `What are the key points I should remember?`,
                "How is this used in real life?"
            ];
        } else if (lowerQ.includes('how to')) {
            suggestions = [
                "Show me step-by-step",
                "What are common mistakes?",
                "Give me practice problems"
            ];
        }

        res.json({
            success: true,
            answer: answer,
            suggestions: suggestions,
            model: "gpt-3.5-turbo"
        });

    } catch (error) {
        console.error('❌ OpenAI Error:', error.message);

        // Fallback response if API fails
        res.json({
            success: true,
            answer: `**🤖 I'm here to help!**

I understand you're asking about "${req.body.question}". 

Since I'm having trouble connecting, here's what I can help with:

📚 **Try asking:**
- "Explain quantum physics in simple terms"
- "What is Python programming?"
- "How do I study effectively?"
- "Explain Newton's laws of motion"

**Be specific with your question**, and I'll give you a detailed, helpful answer! What would you like to learn about? 🚀`,
            suggestions: [
                "Explain quantum physics",
                "What is Python?",
                "How to study better",
                "Help with calculus"
            ]
        });
    }
});

// Get learning resources
router.post('/resources', protect, async (req, res) => {
    try {
        const { topic } = req.body;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "Provide 5 high-quality learning resources for the given topic. Include websites, YouTube channels, books, and online courses. Format nicely with bullet points."
                },
                {
                    role: "user",
                    content: `Give me learning resources for: ${topic}`
                }
            ],
            temperature: 0.7,
            max_tokens: 500,
        });

        const resources = completion.choices[0].message.content;

        res.json({
            success: true,
            resources: resources
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching resources' });
    }
});

// Generate practice questions
router.post('/practice', protect, async (req, res) => {
    try {
        const { topic, difficulty = 'medium' } = req.body;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `Generate 3 ${difficulty} difficulty practice questions for the given topic. Include the question, a hint, and the answer with explanation. Format nicely.`
                },
                {
                    role: "user",
                    content: `Generate practice questions for: ${topic}`
                }
            ],
            temperature: 0.7,
            max_tokens: 800,
        });

        const questions = completion.choices[0].message.content;

        res.json({
            success: true,
            questions: questions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error generating questions' });
    }
});

module.exports = router;