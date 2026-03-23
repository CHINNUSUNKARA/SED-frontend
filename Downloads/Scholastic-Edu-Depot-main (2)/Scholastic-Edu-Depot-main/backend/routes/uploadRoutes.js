
const express = require('express');
const multer = require('multer');
const path = require('path');
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');

const router = express.Router();
const { protectAdmin, protectStudent } = require('../middleware/authMiddleware');

// A middleware to check if user is either student or admin
const protectAnyUser = (req, res, next) => {
    // We check for admin token first
    const adminToken = req.cookies.admin_session_token;
    if (adminToken) {
        return protectAdmin(req, res, next);
    }
    // If no admin token, check for student token
    const studentToken = req.cookies.student_session_token;
    if (studentToken) {
        return protectStudent(req, res, next);
    }
    // If neither, user is not authenticated
    return res.status(401).json({ message: 'Not authorized, no token' });
};

// Check for required AWS environment variables
const requiredEnvVars = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_BUCKET_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    // Only print a loud warning during local development to avoid noisy logs in other environments
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        console.warn(`WARNING: The following required AWS environment variables are missing: ${missingVars.join(', ')}`);
        console.warn('File uploads will be disabled. Please set these variables in your .env file to enable file uploads.');
    } else {
        console.info(`AWS S3 not configured (missing: ${missingVars.join(', ')}). File uploads disabled.`);
    }
}

// Initialize S3 Client only if all required variables are present
const s3 = missingVars.length === 0 ? new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
}) : null;

// Configure Multer based on whether S3 is available
let upload;
if (s3) {
    // Use S3 storage if configured
    upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: process.env.AWS_BUCKET_NAME,
            contentType: multerS3.AUTO_CONTENT_TYPE,
            metadata: function (req, file, cb) {
                cb(null, { fieldName: file.fieldname });
            },
            key: function (req, file, cb) {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, `uploads/${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
            }
        }),
        fileFilter: function (req, file, cb) {
            checkFileType(file, cb);
        },
        limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
    });
} else {
    // Fall back to memory storage if S3 is not configured
    upload = multer({
        storage: multer.memoryStorage(),
        fileFilter: function (req, file, cb) {
            checkFileType(file, cb);
        },
        limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
    });
}

// File Filter to allow only images
function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images only!'));
    }
}

// @desc    Upload an image to S3
// @route   POST /api/upload
// @access  Private (Admin or Student)
router.post('/', protectAnyUser, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded' });
    }
    
    // If S3 is not configured, we're using memory storage
    if (!s3) {
        return res.status(200).json({
            message: 'File uploads are not properly configured. Running in development mode.',
            url: null,
            warning: 'AWS S3 is not configured. File was not saved to persistent storage.'
        });
    }
    
    // req.file.location contains the public URL of the file in S3
    res.status(200).json({ 
        message: 'Image uploaded successfully',
        url: req.file.location 
    });
});

module.exports = router;