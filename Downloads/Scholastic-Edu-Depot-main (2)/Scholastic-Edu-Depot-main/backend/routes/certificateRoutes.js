const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const Course = require('../models/Course');
const { protect, protectInstructor } = require('../middleware/authMiddleware');
const { certificateValidator } = require('../middleware/validators');
const crypto = require('crypto');

// @desc    Issue a certificate
// @route   POST /api/certificates
// @access  Instructor/Admin
router.post('/', protectInstructor, certificateValidator, async (req, res) => {
    try {
        const { userId, courseId, certificateUrl } = req.body;

        // Check if already issued
        const existingCert = await Certificate.findOne({ userId, courseId });
        if (existingCert) {
            return res.status(400).json({ message: 'Certificate already issued for this user and course' });
        }

        const uniqueId = crypto.randomBytes(8).toString('hex').toUpperCase();

        const certificate = await Certificate.create({
            userId,
            courseId,
            uniqueId,
            certificateUrl
        });

        // Add to user profile
        await User.findByIdAndUpdate(userId, {
            $push: { certificates: { courseId, issueDate: Date.now(), certificateUrl } }
        });

        res.status(201).json(certificate);
    } catch (error) {
        console.error('Issue Certificate Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get my certificates
// @route   GET /api/certificates/my
// @access  Private
router.get('/my', protect, async (req, res) => {
    try {
        const certificates = await Certificate.find({ userId: req.user.id })
            .populate('courseId', 'name')
            .sort({ issueDate: -1 });
        res.json(certificates);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Verify a certificate
// @route   GET /api/certificates/verify/:uniqueId
// @access  Public
router.get('/verify/:uniqueId', async (req, res) => {
    try {
        const certificate = await Certificate.findOne({ uniqueId: req.params.uniqueId })
            .populate('userId', 'name')
            .populate('courseId', 'name');

        if (!certificate) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        res.json(certificate);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
