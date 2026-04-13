const sampleQuestions = {
    'math101': {
        title: 'Calculus Fundamentals',
        questions: [
            {
                id: 1,
                text: 'What is the derivative of x²?',
                options: ['2x', 'x²', '2', 'x'],
                correct: 0,
                explanation: 'The derivative of x² is 2x using the power rule.'
            },
            {
                id: 2,
                text: 'What is the integral of 2x dx?',
                options: ['x² + C', '2x² + C', 'x²', '2x'],
                correct: 0,
                explanation: '∫2x dx = x² + C'
            }
        ]
    }
};

module.exports = sampleQuestions;
