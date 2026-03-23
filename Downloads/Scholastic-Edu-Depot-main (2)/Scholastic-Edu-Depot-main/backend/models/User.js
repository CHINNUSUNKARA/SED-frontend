const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["Admin", "MarketingAgent", "Student", "Instructor"],
    default: "Student"
  },
  avatarUrl: String,
  bio: String,
  title: String,
  skills: [String],
  socials: {
    linkedin: String,
    twitter: String,
    website: String,
    youtube: String
  },
  isVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  oauthProvider: { type: String, enum: ['google', 'github', null], default: null },
  oauthId: String,
  enrolledCourses: [{
    courseSlug: String,
    progress: { type: Number, default: 0 },
    completedLessons: [String] // Array of topic strings or IDs that are completed
  }],
  certificates: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    issueDate: Date,
    certificateUrl: String
  }],
  savedCourses: [String],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: { type: Date },
  permissions: {
    type: [String],
    default: []
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


// Method to generate and hash email verification token
userSchema.methods.getEmailVerificationToken = function () {
  // Generate token
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to emailVerificationToken field
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Set expire time (e.g., 15 minutes)
  this.emailVerificationExpire = Date.now() + 15 * 60 * 1000;

  return verificationToken;
};


const User = mongoose.model('User', userSchema);

module.exports = User;