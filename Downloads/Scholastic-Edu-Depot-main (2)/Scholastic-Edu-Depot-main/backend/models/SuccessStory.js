const mongoose = require('mongoose');

const successStorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  company: { type: String, required: true },
  previousRole: { type: String, required: true },
  image: { type: String, required: true },
  story: { type: String, required: true },
  outcome: { type: String, required: true },
  featured: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('SuccessStory', successStorySchema);
