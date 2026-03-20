// backend/models/Session.js (For paid sessions)
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['chat', 'video'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'completed', 'cancelled'],
        default: 'pending'
    },
    price: Number,
    platformFee: Number,
    mentorEarnings: Number,
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    stripePaymentId: String,
    startTime: Date,
    endTime: Date,
    rating: Number,
    review: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema);