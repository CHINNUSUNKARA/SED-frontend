const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'success', 'error'],
        default: 'info'
    },
    read: {
        type: Boolean,
        default: false
    },
    link: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '30d' // Auto-delete after 30 days
    }
});

module.exports = mongoose.model('Notification', notificationSchema);
