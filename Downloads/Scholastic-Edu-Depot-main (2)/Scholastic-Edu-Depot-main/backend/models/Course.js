const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  tagline: String,
  description: String,
  points: [String],
  category: String,
  imageUrl: String,
  duration: String,
  highlights: [String],
  learningObjectives: [String],
  instructor: {
    name: String,
    title: String,
    imageUrl: String,
    bio: String
  },
  pricing: {
    amount: Number,
    currency: String,
    note: String,
    inclusions: [String]
  },
  curriculum: [{
    week: Number,
    title: String,
    topics: [{
      title: String,
      videoUrl: String,
      content: String
    }]
  }],
  projects: [{
    title: String,
    description: String,
    imageUrl: String
  }],
  faqs: [{
    question: String,
    answer: String
  }],
  deadlines: [{
    date: String,
    task: String
  }],
  assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }]
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
