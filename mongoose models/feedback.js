const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        required: true
    },
    timestamp_local: {
        type: String
    },
    mood: {
        type: String,
        enum: ['happy', 'neutral', 'sad'],
        required: true
    }
});

module.exports = mongoose.model('Feedback', feedbackSchema);