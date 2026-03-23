const mongoose = require('mongoose');

const studentSubmissionSchema = new mongoose.Schema({
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileUrl: String,
    textSubmission: String,
    grade: Number,
    feedback: String,
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure a student can only submit once per assignment (optional, depending on logic)
// studentSubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

const StudentSubmission = mongoose.model('StudentSubmission', studentSubmissionSchema);

module.exports = StudentSubmission;
