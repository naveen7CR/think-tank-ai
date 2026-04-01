const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Expanded mock tests database with more subjects
const mockTests = [
    // ============ MATHEMATICS ============
    { _id: 'math101', title: 'Calculus Fundamentals', subject: 'Mathematics', difficulty: 'Medium', totalMarks: 100, timeLimit: 60, questions: 20, description: 'Master derivatives, integrals, and limits' },
    { _id: 'math102', title: 'Linear Algebra', subject: 'Mathematics', difficulty: 'Medium', totalMarks: 80, timeLimit: 50, questions: 16, description: 'Matrices, vectors, and transformations' },
    { _id: 'math103', title: 'Probability & Statistics', subject: 'Mathematics', difficulty: 'Hard', totalMarks: 100, timeLimit: 70, questions: 20, description: 'Distributions, hypothesis testing, regression' },
    { _id: 'math104', title: 'Geometry & Trigonometry', subject: 'Mathematics', difficulty: 'Easy', totalMarks: 50, timeLimit: 40, questions: 15, description: 'Angles, circles, triangles, and formulas' },
    { _id: 'math105', title: 'Differential Equations', subject: 'Mathematics', difficulty: 'Hard', totalMarks: 100, timeLimit: 75, questions: 20, description: 'First and second order ODEs' },

    // ============ COMPUTER SCIENCE ============
    { _id: 'cs101', title: 'Python Programming Basics', subject: 'Computer Science', difficulty: 'Easy', totalMarks: 50, timeLimit: 30, questions: 15, description: 'Variables, loops, functions, and data types' },
    { _id: 'cs102', title: 'Data Structures', subject: 'Computer Science', difficulty: 'Medium', totalMarks: 100, timeLimit: 60, questions: 20, description: 'Arrays, linked lists, trees, graphs, stacks, queues' },
    { _id: 'cs103', title: 'Algorithms', subject: 'Computer Science', difficulty: 'Hard', totalMarks: 100, timeLimit: 75, questions: 20, description: 'Sorting, searching, dynamic programming, greedy algorithms' },
    { _id: 'cs104', title: 'Database Management', subject: 'Computer Science', difficulty: 'Medium', totalMarks: 80, timeLimit: 55, questions: 18, description: 'SQL, normalization, transactions, indexing' },
    { _id: 'cs105', title: 'Web Development', subject: 'Computer Science', difficulty: 'Medium', totalMarks: 70, timeLimit: 50, questions: 16, description: 'HTML, CSS, JavaScript, React basics' },
    { _id: 'cs106', title: 'Machine Learning Basics', subject: 'Computer Science', difficulty: 'Hard', totalMarks: 100, timeLimit: 70, questions: 20, description: 'Supervised, unsupervised learning, neural networks' },
    { _id: 'cs107', title: 'Operating Systems', subject: 'Computer Science', difficulty: 'Hard', totalMarks: 90, timeLimit: 65, questions: 18, description: 'Processes, memory management, file systems' },

    // ============ PHYSICS ============
    { _id: 'phy101', title: 'Classical Mechanics', subject: 'Physics', difficulty: 'Medium', totalMarks: 100, timeLimit: 60, questions: 20, description: 'Newton\'s laws, kinematics, dynamics, work and energy' },
    { _id: 'phy102', title: 'Electromagnetism', subject: 'Physics', difficulty: 'Hard', totalMarks: 100, timeLimit: 70, questions: 20, description: 'Electric fields, magnetic fields, Maxwell\'s equations' },
    { _id: 'phy103', title: 'Quantum Physics Basics', subject: 'Physics', difficulty: 'Hard', totalMarks: 80, timeLimit: 60, questions: 16, description: 'Wave-particle duality, Schrödinger equation, uncertainty principle' },
    { _id: 'phy104', title: 'Thermodynamics', subject: 'Physics', difficulty: 'Medium', totalMarks: 70, timeLimit: 50, questions: 18, description: 'Heat, work, entropy, laws of thermodynamics' },
    { _id: 'phy105', title: 'Optics', subject: 'Physics', difficulty: 'Medium', totalMarks: 75, timeLimit: 55, questions: 16, description: 'Reflection, refraction, lenses, interference' },
    { _id: 'phy106', title: 'Astrophysics', subject: 'Physics', difficulty: 'Hard', totalMarks: 90, timeLimit: 65, questions: 18, description: 'Stars, galaxies, black holes, cosmology' },

    // ============ CHEMISTRY ============
    { _id: 'chem101', title: 'Organic Chemistry', subject: 'Chemistry', difficulty: 'Hard', totalMarks: 100, timeLimit: 65, questions: 20, description: 'Hydrocarbons, functional groups, reactions, mechanisms' },
    { _id: 'chem102', title: 'Inorganic Chemistry', subject: 'Chemistry', difficulty: 'Medium', totalMarks: 80, timeLimit: 55, questions: 18, description: 'Periodic table, coordination compounds, bonding' },
    { _id: 'chem103', title: 'Physical Chemistry', subject: 'Chemistry', difficulty: 'Medium', totalMarks: 90, timeLimit: 60, questions: 20, description: 'Thermodynamics, kinetics, quantum chemistry' },
    { _id: 'chem104', title: 'Biochemistry', subject: 'Chemistry', difficulty: 'Hard', totalMarks: 85, timeLimit: 60, questions: 18, description: 'Proteins, enzymes, metabolism, DNA/RNA' },
    { _id: 'chem105', title: 'Environmental Chemistry', subject: 'Chemistry', difficulty: 'Easy', totalMarks: 60, timeLimit: 45, questions: 15, description: 'Pollution, green chemistry, sustainability' },

    // ============ BIOLOGY ============
    { _id: 'bio101', title: 'Cell Biology', subject: 'Biology', difficulty: 'Medium', totalMarks: 80, timeLimit: 50, questions: 18, description: 'Cell structure, organelles, cell division' },
    { _id: 'bio102', title: 'Genetics', subject: 'Biology', difficulty: 'Hard', totalMarks: 100, timeLimit: 65, questions: 20, description: 'DNA, genes, inheritance, mutations' },
    { _id: 'bio103', title: 'Human Anatomy', subject: 'Biology', difficulty: 'Medium', totalMarks: 90, timeLimit: 60, questions: 20, description: 'Body systems, organs, functions' },
    { _id: 'bio104', title: 'Ecology', subject: 'Biology', difficulty: 'Easy', totalMarks: 70, timeLimit: 45, questions: 16, description: 'Ecosystems, biodiversity, conservation' },
    { _id: 'bio105', title: 'Microbiology', subject: 'Biology', difficulty: 'Medium', totalMarks: 85, timeLimit: 55, questions: 18, description: 'Bacteria, viruses, fungi, pathogens' },

    // ============ ENGINEERING ============
    { _id: 'eng101', title: 'Engineering Mechanics', subject: 'Engineering', difficulty: 'Medium', totalMarks: 100, timeLimit: 60, questions: 20, description: 'Statics, dynamics, forces, equilibrium' },
    { _id: 'eng102', title: 'Fluid Mechanics', subject: 'Engineering', difficulty: 'Hard', totalMarks: 100, timeLimit: 70, questions: 20, description: 'Fluid properties, flow, Bernoulli equation' },
    { _id: 'eng103', title: 'Thermal Engineering', subject: 'Engineering', difficulty: 'Medium', totalMarks: 80, timeLimit: 55, questions: 18, description: 'Heat transfer, engines, refrigeration' },
    { _id: 'eng104', title: 'Circuit Analysis', subject: 'Engineering', difficulty: 'Medium', totalMarks: 85, timeLimit: 60, questions: 18, description: 'Ohm\'s law, Kirchhoff, AC/DC circuits' },

    // ============ BUSINESS ============
    { _id: 'bus101', title: 'Marketing Fundamentals', subject: 'Business', difficulty: 'Easy', totalMarks: 60, timeLimit: 40, questions: 15, description: '4Ps, market research, consumer behavior' },
    { _id: 'bus102', title: 'Financial Accounting', subject: 'Business', difficulty: 'Medium', totalMarks: 80, timeLimit: 55, questions: 18, description: 'Balance sheets, income statements, cash flow' },
    { _id: 'bus103', title: 'Business Strategy', subject: 'Business', difficulty: 'Hard', totalMarks: 100, timeLimit: 65, questions: 20, description: 'SWOT analysis, competitive advantage, strategic planning' },
    { _id: 'bus104', title: 'Economics', subject: 'Business', difficulty: 'Medium', totalMarks: 75, timeLimit: 50, questions: 16, description: 'Supply and demand, macroeconomics, microeconomics' },

    // ============ ARTS & HUMANITIES ============
    { _id: 'art101', title: 'Art History', subject: 'Arts', difficulty: 'Easy', totalMarks: 60, timeLimit: 45, questions: 15, description: 'Renaissance, modern art, famous artists' },
    { _id: 'art102', title: 'World Literature', subject: 'Arts', difficulty: 'Medium', totalMarks: 70, timeLimit: 50, questions: 16, description: 'Classic novels, poetry, literary analysis' },
    { _id: 'art103', title: 'Philosophy', subject: 'Arts', difficulty: 'Hard', totalMarks: 80, timeLimit: 55, questions: 18, description: 'Ethics, logic, metaphysics, famous philosophers' },

    // ============ NEW SUBJECTS ============
    { _id: 'data101', title: 'Data Science', subject: 'Computer Science', difficulty: 'Hard', totalMarks: 100, timeLimit: 70, questions: 20, description: 'Data analysis, visualization, statistics' },
    { _id: 'ai101', title: 'Artificial Intelligence', subject: 'Computer Science', difficulty: 'Hard', totalMarks: 100, timeLimit: 75, questions: 20, description: 'Neural networks, NLP, computer vision' },
    { _id: 'cyber101', title: 'Cybersecurity', subject: 'Computer Science', difficulty: 'Medium', totalMarks: 85, timeLimit: 60, questions: 18, description: 'Network security, cryptography, ethical hacking' },
    { _id: 'med101', title: 'Medical Terminology', subject: 'Biology', difficulty: 'Medium', totalMarks: 70, timeLimit: 50, questions: 16, description: 'Medical terms, body systems, diseases' },
    { _id: 'law101', title: 'Constitutional Law', subject: 'Business', difficulty: 'Hard', totalMarks: 90, timeLimit: 65, questions: 18, description: 'Constitution, rights, legal system' }
];

const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'Engineering', 'Business', 'Arts', 'Data Science', 'Cybersecurity'
];

router.get('/', protect, async (req, res) => {
    try {
        const { subject, difficulty } = req.query;
        let filteredTests = [...mockTests];

        if (subject && subject !== 'All') {
            filteredTests = filteredTests.filter(t => t.subject === subject);
        }
        if (difficulty && difficulty !== 'All') {
            filteredTests = filteredTests.filter(t => t.difficulty === difficulty);
        }

        res.json({
            success: true,
            count: filteredTests.length,
            data: filteredTests,
            subjects: subjects
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/subjects', protect, async (req, res) => {
    res.json({ success: true, data: subjects });
});

router.get('/:id', protect, async (req, res) => {
    try {
        const test = mockTests.find(t => t._id === req.params.id);
        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }
        res.json({ success: true, data: test });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;