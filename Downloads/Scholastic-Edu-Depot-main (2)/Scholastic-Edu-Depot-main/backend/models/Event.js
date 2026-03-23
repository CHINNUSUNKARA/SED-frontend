const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    type: {
        type: String,
        required: true,
        enum: ['Live Class', 'Deadline', 'Meeting', 'Webinar', 'Holiday']
    },
    date: { type: Date, required: true },
    time: String, // e.g., "10:00 AM" - optional, can be derived from date if needed but kept for flexibility
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }, // Optional: link to a course
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional: who created it
    link: String, // Zoom link, etc.
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
