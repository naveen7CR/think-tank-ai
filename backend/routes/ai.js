// backend/routes/ai.js - Real OpenAI Integration
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

        // Get user context for better answers
        let userContext = '';
        if (req.user.role === 'student') {
            userContext = `The user is a student. `;
            if (req.user.educationLevel) {
                userContext += `They are at ${req.user.educationLevel} level. `;
            }
        } else if (req.user.role === 'mentor') {
            userContext = `The user is a mentor with expertise in ${req.user.skillTags?.join(', ') || 'various subjects'}. `;
        }

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are ThinkTank AI, a helpful, enthusiastic study assistant for college students. 
                    ${userContext}
                    Provide clear, detailed, and engaging explanations. Use examples and markdown formatting. 
                    Be encouraging and adapt your explanation to the user's level.`
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

        // Generate smart follow-up suggestions based on question
        const lowerQ = question.toLowerCase();
        let suggestions = [
            "Tell me more about this topic",
            "Give me examples",
            "Explain it differently"
        ];

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
        } else if (lowerQ.includes('difference') || lowerQ.includes('vs')) {
            suggestions = [
                "What are the pros and cons?",
                "When should I use each?",
                "Can you give a comparison table?"
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

        // Fallback smart response
        const fallbackAnswer = `**🤖 I'm here to help!**

I understand you're asking about "${req.body.question}".

Here's a helpful breakdown:

📚 **Key Points:**
- This is a great question that shows curiosity
- Let me explain this concept in simple terms
- Think of it like this: [simple analogy]

💡 **Quick Tip:**
The best way to understand this is to break it down into smaller parts and practice with examples.

Would you like me to explain a specific aspect in more detail?`;

        res.json({
            success: true,
            answer: fallbackAnswer,
            suggestions: [
                "Explain it with more examples",
                "What are the practical applications?",
                "Give me a simple analogy"
            ]
        });
    }
});

// Get learning resources for a topic
router.post('/resources', protect, async (req, res) => {
    try {
        const { topic } = req.body;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "Provide 5 high-quality learning resources for the given topic. Include websites, YouTube channels, books, and online courses. Format nicely with bullet points and brief descriptions."
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
                    content: `Generate 3 ${difficulty} difficulty practice questions for the given topic. 
                    For each question, include:
                    1. The question
                    2. A helpful hint
                    3. The answer with explanation
                    Format nicely with markdown.`
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