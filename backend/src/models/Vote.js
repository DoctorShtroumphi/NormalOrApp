const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    vote: {
        type: String,
        enum: ['Normal', 'Other'],
        required: true
    },
    votedAt: {
        type: Date,
        default: Date.now
    }
});

VoteSchema.index({ userId: 1, questionId: 1 }, { unique: true }); // Ensure unique vote per user per question

module.exports = mongoose.model('Vote', VoteSchema);