const { body, validationResult } = require('express-validator');

// Helper middleware to check validation result
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation Error',
            errors: errors.array().map(err => err.msg)
        });
    }
    next();
};

// --- AUTH VALIDATORS ---
const registerValidator = [
    body('name').trim().notEmpty().escape().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Please include a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('confirmpassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    }),
    body('acceptTerms').isBoolean().withMessage('You must accept the terms and conditions'),
    validate
];

const loginValidator = [
    body('email').isEmail().normalizeEmail().withMessage('Please include a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
];

const updatePasswordValidator = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
    validate
];

const deleteUserValidator = [
    body('password').notEmpty().withMessage('Password is required to confirm account deletion'),
    validate
];


// --- MODEL VALIDATORS ---

// Shared course field rules (reused across create / update validators)
const _courseFieldRules = [
    body('slug')
        .optional({ checkFalsy: true })
        .trim().toLowerCase()
        .matches(/^[a-z0-9-]+$/).withMessage('Slug must be lowercase alphanumeric with hyphens'),
    body('courseType')
        .optional()
        .isIn(['live', 'self-paced']).withMessage('courseType must be "live" or "self-paced"'),
    body('level')
        .optional()
        .isIn(['beginner', 'intermediate', 'advanced', 'all']).withMessage('Invalid level value'),
    body('pricing.amount')
        .optional()
        .isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('pricing.currency')
        .optional({ checkFalsy: true })
        .trim().toUpperCase()
        .matches(/^[A-Z]{3}$/).withMessage('Currency must be a valid 3-letter ISO 4217 code (e.g. INR, USD)'),
    body('pricing.discountedAmount')
        .optional()
        .isFloat({ min: 0 }).withMessage('Discounted price must be a non-negative number'),
    body('pricing.inclusions').optional().isArray().withMessage('Pricing inclusions must be an array'),
    body('pricing.isFree').optional().isBoolean().withMessage('pricing.isFree must be boolean'),
    body('imageUrl').optional({ checkFalsy: true }).isURL().withMessage('Image URL must be a valid URL'),
    body('bannerUrl').optional({ checkFalsy: true }).isURL().withMessage('Banner URL must be a valid URL'),
    body('promoVideoUrl').optional({ checkFalsy: true }).isURL().withMessage('Promo video URL must be a valid URL'),
    body('totalHours').optional().isFloat({ min: 0 }).withMessage('totalHours must be a non-negative number'),
    body('instructor.email').optional({ checkFalsy: true }).isEmail().normalizeEmail().withMessage('Instructor email is invalid'),
    body('curriculum').optional().isArray().withMessage('Curriculum must be an array'),
    body('highlights').optional().isArray().withMessage('Highlights must be an array'),
    body('learningObjectives').optional().isArray().withMessage('learningObjectives must be an array'),
    body('prerequisites').optional().isArray().withMessage('prerequisites must be an array'),
    body('targetAudience').optional().isArray().withMessage('targetAudience must be an array'),
    body('tags').optional().isArray().withMessage('tags must be an array'),
    body('faqs').optional().isArray().withMessage('FAQs must be an array'),
    body('projects').optional().isArray().withMessage('Projects must be an array'),
    body('certification.available').optional().isBoolean().withMessage('certification.available must be boolean'),
    body('liveDetails.maxStudents').optional().isInt({ min: 1 }).withMessage('maxStudents must be a positive integer'),
    body('requiresEnrollment').optional().isBoolean().withMessage('requiresEnrollment must be boolean'),
    body('allowFreePreview').optional().isBoolean().withMessage('allowFreePreview must be boolean'),
];

// POST – required fields enforced
const courseCreateValidator = [
    body('name').trim().notEmpty().withMessage('Course name is required'),
    body('slug')
        .trim().notEmpty().withMessage('Slug is required')
        .toLowerCase()
        .matches(/^[a-z0-9-]+$/).withMessage('Slug must be lowercase alphanumeric with hyphens'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('courseType')
        .notEmpty().withMessage('courseType is required')
        .isIn(['live', 'self-paced']).withMessage('courseType must be "live" or "self-paced"'),
    ..._courseFieldRules,
    validate
];

// PUT – all fields optional (partial or full update)
const courseUpdateValidator = [
    body('name').optional().trim().notEmpty().withMessage('Course name cannot be empty'),
    body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
    ..._courseFieldRules,
    validate
];

// Legacy alias kept for backward compatibility with any code that still imports it
const courseValidator = courseCreateValidator;

const partnerValidator = [
    body('name').trim().notEmpty().escape().withMessage('Partner name is required'),
    body('slug').trim().notEmpty().matches(/^[a-z0-9-]+$/).withMessage('Slug is invalid'),
    body('websiteUrl').isURL().withMessage('Website URL must be a valid URL'),
    body('logoUrl').isURL().withMessage('Logo URL must be a valid URL'),
    body('bannerImageUrl').isURL().withMessage('Banner Image URL must be a valid URL'),
    body('description').trim().notEmpty().escape().withMessage('Description is required'),
    body('contact.email').isEmail().normalizeEmail().withMessage('Contact email is invalid'),
    validate
];

const serviceValidator = [
    body('title').trim().notEmpty().escape().withMessage('Service title is required'),
    body('slug').trim().notEmpty().matches(/^[a-z0-9-]+$/).withMessage('Slug is invalid'),
    body('tagline').trim().notEmpty().escape().withMessage('Tagline is required'),
    body('description').trim().notEmpty().escape().withMessage('Description is required'),
    body('features').isArray({ min: 1 }).withMessage('At least one feature is required'),
    validate
];

const blogPostValidator = [
    body('title').trim().notEmpty().withMessage('Blog title is required'),
    body('slug').trim().notEmpty().matches(/^[a-z0-9-]+$/).withMessage('Slug is invalid'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('imageUrl').optional({ checkFalsy: true }).isURL().withMessage('Image URL is invalid'),
    body('category').trim().notEmpty().escape().withMessage('Category is required'),
    body('author.name').trim().notEmpty().escape().withMessage('Author name is required'),
    validate
];


// --- OTHER VALIDATORS ---
const contactValidator = [
    body('name').trim().notEmpty().escape().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Please include a valid email'),
    body('message').trim().notEmpty().escape().withMessage('Message is required'),
    body('subject').optional().trim().escape(),
    validate
];

const userProfileValidators = {
    avatar: [body('avatarUrl').isURL().withMessage('A valid URL for the avatar is required'), validate],
    saveCourse: [body('courseName').trim().notEmpty().escape().withMessage('Course name is required'), validate],
    enroll: [body('courseSlug').trim().notEmpty().matches(/^[a-z0-9-]+$/).withMessage('A valid course slug is required'), validate],
    completeLesson: [
        body('courseSlug').trim().notEmpty().matches(/^[a-z0-9-]+$/).withMessage('A valid course slug is required'),
        body('lessonId').trim().notEmpty().escape().withMessage('A lesson ID is required'),
        validate
    ]
};


const assignmentValidator = [
    body('title').trim().notEmpty().escape().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('courseId').isMongoId().withMessage('Valid Course ID is required'),
    body('deadline').isISO8601().toDate().withMessage('Valid deadline date is required'),
    body('maxScore').isInt({ min: 1 }).withMessage('Max score must be a positive integer'),
    validate
];

const submissionValidator = [
    body('fileUrl').optional().isURL().withMessage('File URL must be valid'),
    body('textSubmission').optional().trim().escape(),
    body().custom((value, { req }) => {
        if (!req.body.fileUrl && !req.body.textSubmission) {
            throw new Error('Either file URL or text submission is required');
        }
        return true;
    }),
    validate
];

const gradeValidator = [
    body('grade').isFloat({ min: 0 }).withMessage('Grade must be a positive number'),
    body('feedback').optional().trim().escape(),
    validate
];

const certificateValidator = [
    body('userId').isMongoId().withMessage('Valid User ID is required'),
    body('courseId').isMongoId().withMessage('Valid Course ID is required'),
    body('certificateUrl').isURL().withMessage('Certificate URL must be valid'),
    validate
];

module.exports = {
    registerValidator,
    loginValidator,
    updatePasswordValidator,
    deleteUserValidator,
    courseCreateValidator,
    courseUpdateValidator,
    courseValidator,
    partnerValidator,
    serviceValidator,
    blogPostValidator,
    contactValidator,
    userProfileValidators,
    assignmentValidator,
    submissionValidator,
    gradeValidator,
    certificateValidator
};