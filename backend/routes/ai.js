// backend/routes/ai.js - Simple Working Version
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

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

        const lowerQ = question.toLowerCase();
        let answer = "";

        if (lowerQ.includes('quantum') || lowerQ.includes('physics')) {
            answer = `**🔬 QUANTUM PHYSICS EXPLAINED**

Quantum physics is the study of matter and energy at the smallest scales.

**Key Concepts:**
- **Wave-Particle Duality:** Particles behave as both waves and particles
- **Superposition:** Particles can exist in multiple states at once
- **Entanglement:** Particles can be connected across space

**Why It's Important:**
- Powers transistors, lasers, and MRI machines
- Foundation for quantum computers

**Newton's 3 Laws of Motion:**
1. Objects stay still or keep moving unless force acts on them
2. Force = mass × acceleration (F = ma)
3. Every action has equal opposite reaction`;
        }
        else if (lowerQ.includes('python')) {
            answer = `**🐍 PYTHON PROGRAMMING**

Python is a beginner-friendly programming language.

**Basic Syntax:**
\`\`\`python
name = "Alice"
fruits = ["apple", "banana"]
for fruit in fruits:
    print(fruit)
def greet(name):
    return f"Hello, {name}!"
\`\`\`

**Common Uses:** Web dev, data science, AI, automation

**Learning Path:** Start with variables → loops → functions → classes`;
        }
        else if (lowerQ.includes('calculus')) {
            answer = `**📐 CALCULUS EXPLAINED**

Calculus studies continuous change.

**Two Main Types:**
- **Differential:** Rates of change (derivatives)
- **Integral:** Accumulation (areas under curves)

**Real Uses:** Physics, engineering, economics, medicine`;
        }
        else if (lowerQ.includes('study') || lowerQ.includes('learn')) {
            answer = `**📚 EFFECTIVE STUDY TIPS**

1. **Active Recall:** Test yourself, don't just read
2. **Spaced Repetition:** Review over increasing intervals
3. **Pomodoro:** 25 min study, 5 min break
4. **Teach Others:** Best way to learn is to explain

**Remember:** Consistency beats intensity!`;
        }
        else {
            answer = `**🤖 THINK TANK AI**

I can help you learn! Try asking about:

🔬 **Physics:** "Explain quantum physics"
💻 **Programming:** "What is Python?"
📐 **Math:** "Explain calculus"
📚 **Study Skills:** "How to study effectively"

What would you like to learn? 🚀`;
        }

        res.json({
            success: true,
            answer: answer,
            suggestions: ["Tell me more", "Give examples", "How to practice"]
        });

    } catch (error) {
        console.error('Error:', error);
        res.json({
            success: false,
            answer: "I'm here to help! Please ask your question again.",
            suggestions: ["Try a different question"]
        });
    }
});

module.exports = router;