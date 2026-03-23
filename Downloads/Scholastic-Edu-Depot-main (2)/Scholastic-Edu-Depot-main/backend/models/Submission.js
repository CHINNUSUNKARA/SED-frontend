const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  name: String,
  email: String,
  subject: String,
  message: String,
  submittedAt: String
}, { timestamps: true });

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;