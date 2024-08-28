const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },
    leadingQuestion: {
        type: String,
        default: null
    },
    caption: {
        type: String,
        default: null
    },
    dateAsked: {
        type: Date,
        default: null
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    votesNormal: {
        type: Number,
        default: 0
    },
    votesOther: {
        type: Number,
        default: 0
    },
    totalVotes: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Question', QuestionSchema);