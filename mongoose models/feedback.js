const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        required: true
    },
    timestamp_short: {
        type: String
    },
    mood: {
        type: String,
        enum: ['happy', 'neutral', 'sad'],
        required: true
    },
    location: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    tabletId: {
        type: String,
        required: false
    },
    checkboxes: [{type: String}]
});

module.exports = mongoose.model('Feedback', feedbackSchema);