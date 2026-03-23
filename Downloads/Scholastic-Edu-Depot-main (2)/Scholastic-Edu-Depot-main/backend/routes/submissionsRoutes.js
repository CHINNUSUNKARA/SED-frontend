const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const { protectAdmin } = require('../middleware/authMiddleware');
const { contactValidator } = require('../middleware/validators');
// AI responses will be handled by the main AI service if needed

// @desc    Get all contact submissions
// @route   GET /api/submissions
// @access  Private/Admin
router.get('/', protectAdmin, async (req, res) => {
    try {
        const submissions = await Submission.find({}).sort({ submittedAt: -1 });
        res.json(submissions.map(sub => ({
            ...sub.toObject(),
            id: sub._id // Map _id to id for frontend compatibility
        })));
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Create a new contact submission and get an AI reply
// @route   POST /api/submissions
// @access  Public
router.post('/', contactValidator, async (req, res) => {
    const { name, email, subject, message } = req.body;

    try {
        const newSubmission = await Submission.create({
            submittedAt: new Date().toISOString(),
            name,
            email,
            subject: subject || 'No Subject',
            message,
        });

        // Default response message
        const replyText = `Thank you for contacting us, ${name}! We have received your message and a member of our team will get back to you shortly.`;
                const prompt = `
                    You are a friendly and helpful support agent for a tech training academy called "SCHOLASTIC A EDU. DEPOT".
                    A user named "${name}" has sent a message through the contact form.
                    The subject of their message is: "${subject || 'No Subject'}"
                    Their message is: "${message}"
        
                    Please provide a warm, reassuring, and helpful response. Acknowledge their message, thank them for reaching out, and let them know that a member of the support team will get back to them at their email address shortly regarding their specific query. Keep the tone professional yet approachable. Address them by their name.
                `;
        
                // In the future, we could integrate with our main AI service here if needed

        res.status(201).json({ 
            message: 'Submission received. Thank you!', 
            replyText: replyText 
        });

    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({ message: 'Server Error: Could not save submission.' });
    }
});

module.exports = router;