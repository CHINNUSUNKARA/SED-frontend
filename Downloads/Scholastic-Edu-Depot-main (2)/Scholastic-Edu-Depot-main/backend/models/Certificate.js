const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    issueDate: { type: Date, default: Date.now },
    uniqueId: { type: String, required: true, unique: true }, // For verification
    certificateUrl: String
}, { timestamps: true });

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;
