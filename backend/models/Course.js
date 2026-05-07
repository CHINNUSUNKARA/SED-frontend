const mongoose = require('mongoose');

// ─── Content Item (concept: video/audio/pdf/text/etc.) ────────────────────────
const contentItemSchema = new mongoose.Schema({
    title:     { type: String, required: true, trim: true },
    type:      { type: String, required: true, enum: ['video', 'audio', 'pdf', 'text', 'markdown', 'slides', 'link', 'embed', 'image', 'notebook'] },
    url:       String,
    content:   String,          // for text/markdown types
    duration:  { type: Number, min: 0 },   // seconds for video/audio
    isPreview: { type: Boolean, default: false },
    order:     { type: Number, default: 0 },
    thumbnail: String,
    captions:  [{ language: String, url: String }]
}, { timestamps: true });

// ─── Quiz / Exam Question ─────────────────────────────────────────────────────
const questionSchema = new mongoose.Schema({
    question:      { type: String, required: true, trim: true },
    type:          { type: String, required: true, enum: ['mcq', 'msq', 'true_false', 'short_answer'] },
    options:       [{ text: { type: String, trim: true }, isCorrect: { type: Boolean, default: false } }],
    correctAnswer: String,          // for short_answer
    explanation:   String,
    points:        { type: Number, default: 1, min: 0 }
}, { _id: true });

// ─── Quiz ─────────────────────────────────────────────────────────────────────
const quizSchema = new mongoose.Schema({
    title:            { type: String, required: true, trim: true },
    description:      String,
    timeLimit:        { type: Number, min: 0 },   // minutes, 0 = no limit
    passingScore:     { type: Number, min: 0, max: 100, default: 60 },   // %
    attemptsAllowed:  { type: Number, default: 3, min: 1 },
    shuffleQuestions: { type: Boolean, default: false },
    showResults:      { type: Boolean, default: true },
    questions:        [questionSchema],
    isPublished:      { type: Boolean, default: false }
}, { timestamps: true });

// ─── Exam ─────────────────────────────────────────────────────────────────────
const examSchema = new mongoose.Schema({
    title:           { type: String, required: true, trim: true },
    description:     String,
    instructions:    String,
    scheduledAt:     Date,
    duration:        { type: Number, min: 1 },    // minutes
    totalMarks:      { type: Number, min: 1 },
    passingMarks:    { type: Number, min: 0 },
    attemptsAllowed: { type: Number, default: 1, min: 1 },
    isProctored:     { type: Boolean, default: false },
    questions:       [questionSchema],
    isPublished:     { type: Boolean, default: false }
}, { timestamps: true });

// ─── Discussion Prompt ────────────────────────────────────────────────────────
const discussionSchema = new mongoose.Schema({
    title:    { type: String, required: true, trim: true },
    prompt:   String,
    isGraded: { type: Boolean, default: false },
    maxScore: { type: Number, min: 0 },
    dueDate:  Date,
    isOpen:   { type: Boolean, default: true }
}, { timestamps: true });

// ─── Week / Module ────────────────────────────────────────────────────────────
const weekSchema = new mongoose.Schema({
    weekNumber:       { type: Number, required: true, min: 1 },
    title:            { type: String, required: true, trim: true },
    description:      String,
    isLocked:         { type: Boolean, default: false },
    unlockAfterDays:  { type: Number, min: 0 },   // days after enrollment
    concepts:         [contentItemSchema],
    assignments:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }],
    quizzes:          [quizSchema],
    discussions:      [discussionSchema],
    exams:            [examSchema]
}, { timestamps: true });

// ─── Live Session ─────────────────────────────────────────────────────────────
const liveSessionSchema = new mongoose.Schema({
    title:       { type: String, required: true, trim: true },
    scheduledAt: { type: Date, required: true },
    duration:    { type: Number, min: 1 },    // minutes
    meetingUrl:  String,
    recordingUrl: String,
    description: String,
    isCompleted: { type: Boolean, default: false },
    materials:   [{ name: String, url: String }]
}, { timestamps: true });

// ─── Attachment ───────────────────────────────────────────────────────────────
const attachmentSchema = new mongoose.Schema({
    name:       { type: String, required: true, trim: true },
    url:        { type: String, required: true },
    fileType:   { type: String, enum: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'image', 'video', 'audio', 'other'], default: 'other' },
    size:       Number,   // bytes
    uploadedAt: { type: Date, default: Date.now }
}, { _id: true });

// ─── Instructor ───────────────────────────────────────────────────────────────
const instructorSchema = new mongoose.Schema({
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name:          { type: String, trim: true },
    title:         { type: String, trim: true },
    imageUrl:      String,
    bio:           String,
    email:         String,
    website:       String,
    socialLinks: {
        linkedin:  String,
        twitter:   String,
        github:    String,
        youtube:   String
    },
    rating:        { type: Number, min: 0, max: 5 },
    totalStudents: { type: Number, default: 0, min: 0 },
    totalCourses:  { type: Number, default: 0, min: 0 }
}, { _id: false });

// ─── Course ───────────────────────────────────────────────────────────────────
const courseSchema = new mongoose.Schema({
    name:  { type: String, required: [true, 'Course name is required'], trim: true },
    slug: {
        type: String,
        required: [true, 'Slug is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens']
    },
    courseType: {
        type: String,
        required: [true, 'Course type is required'],
        enum: ['live', 'self-paced'],
        default: 'self-paced'
    },

    // Basic info
    tagline:          { type: String, trim: true },
    shortDescription: { type: String, trim: true, maxlength: 300 },
    description:      String,
    points:           [String],
    category:         { type: String, required: [true, 'Category is required'], trim: true },
    subCategory:      { type: String, trim: true },
    tags:             [String],
    level: {
        type: String,
        default: 'all'
    },
    language:     { type: String, default: 'English', trim: true },
    imageUrl:     String,
    bannerUrl:    String,
    promoVideoUrl: String,
    duration:     String,
    totalHours:   { type: Number, min: 0 },

    // Learning info
    highlights:         [String],
    learningObjectives: [String],
    prerequisites:      [String],
    targetAudience:     [String],
    tools:              [String],

    // Instructors
    instructor:    instructorSchema,
    coInstructors: [instructorSchema],

    // Pricing
    pricing: {
        amount:           { type: Number, min: [0, 'Price cannot be negative'] },
        currency:         { type: String, default: 'INR', uppercase: true, trim: true, match: [/^[A-Z]{3}$/, 'Currency must be a 3-letter ISO 4217 code'] },
        discountedAmount: { type: Number, min: 0 },
        discountEndsAt:   Date,
        note:             String,
        inclusions:       [String],
        isFree:           { type: Boolean, default: false }
    },

    // Live course details
    liveDetails: {
        startDate:          Date,
        endDate:            Date,
        timezone:           { type: String, default: 'Asia/Kolkata' },
        maxStudents:        { type: Number, min: 1 },
        enrollmentDeadline: Date,
        batchName:          String,
        meetingPlatform:    { type: String, enum: ['zoom', 'google_meet', 'microsoft_teams', 'custom'] },
        sessions:           [liveSessionSchema]
    },

    // Curriculum
    curriculum: [weekSchema],

    // Certification
    certification: {
        available:      { type: Boolean, default: false },
        title:          String,
        description:    String,
        criteria:       String,
        validityMonths: Number,   // null = lifetime
        templateUrl:    String,
        issuedBy:       String
    },

    // Extra content
    projects: [{
        title:       String,
        description: String,
        imageUrl:    String,
        demoUrl:     String,
        techStack:   [String]
    }],
    faqs: [{
        question: String,
        answer:   String,
        order:    { type: Number, default: 0 }
    }],
    deadlines: [{ date: String, task: String }],

    // Attachments
    attachments: [attachmentSchema],

    // Denormalized stats
    stats: {
        enrolledCount:  { type: Number, default: 0, min: 0 },
        completedCount: { type: Number, default: 0, min: 0 },
        averageRating:  { type: Number, default: 0, min: 0, max: 5 },
        totalRatings:   { type: Number, default: 0, min: 0 },
        totalReviews:   { type: Number, default: 0, min: 0 }
    },

    // Flags
    isPublished:        { type: Boolean, default: false },
    isFeatured:         { type: Boolean, default: false },
    isArchived:         { type: Boolean, default: false },
    isDraft:            { type: Boolean, default: true },
    requiresEnrollment: { type: Boolean, default: true },
    allowFreePreview:   { type: Boolean, default: false },

    // Ownership
    publishedAt:   Date,
    createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

courseSchema.index({ category: 1, isPublished: 1 });
courseSchema.index({ courseType: 1, isPublished: 1 });
courseSchema.index({ isFeatured: 1, isPublished: 1 });
courseSchema.index({ 'instructor.userId': 1 });
courseSchema.index({ createdBy: 1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ name: 'text', tagline: 'text', description: 'text', tags: 'text' });

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
