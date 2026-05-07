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
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'completed', 'rejected', 'in-progress'],
        default: 'in-progress'
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
    completedLessons: {
        type: [String],
        default: []
    },
    paymentStatus: {
        type: String,
        enum: ['free', 'paid', 'pending', 'failed'],
        default: 'pending'
    },
    amount: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    timestamps: true
});

// Unique compound index prevents duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ enrolledAt: -1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
