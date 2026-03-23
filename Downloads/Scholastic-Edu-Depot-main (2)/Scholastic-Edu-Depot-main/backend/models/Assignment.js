const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    deadline: Date,
    maxScore: { type: Number, default: 100 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Instructor who created it
}, { timestamps: true });

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
