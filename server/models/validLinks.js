// models/validLinks.js
const mongoose = require('mongoose');

const validUrlSchema = new mongoose.Schema({
    telegramId: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 20,
        match: /^\d+$/
    },
    url: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 }
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ValidUrl = mongoose.model('ValidUrl', validUrlSchema);

module.exports = ValidUrl;