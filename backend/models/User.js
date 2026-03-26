// backend/models/User.js - Updated with all fields
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: ['student', 'mentor'],
        default: 'student'
    },
    avatar: {
        type: String,
        default: 'https://via.placeholder.com/150'
    },
    stars: {
        type: Number,
        default: 0
    },
    mentorRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalSessions: {
        type: Number,
        default: 0
    },
    skillTags: [{
        type: String,
        enum: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Engineering', 'Business', 'Arts']
    }],
    studyHours: {
        type: Number,
        default: 0
    },
    streak: {
        type: Number,
        default: 0
    },
    lastStudyDate: Date,
    bio: {
        type: String,
        maxlength: 500
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);


achievements: [{
    name: String,
    earnedAt: { type: Date, default: Date.now },
    icon: String,
    description: String
}]

