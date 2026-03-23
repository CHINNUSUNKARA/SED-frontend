const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'rejected', 'in-progress'],
        default: 'pending'
    },
    enrolledAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    amount: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

// Index for faster queries
enrollmentSchema.index({ student: 1, course: 1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ enrolledAt: -1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
