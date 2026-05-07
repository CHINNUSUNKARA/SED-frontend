const express = require('express');
const router = express.Router();
const SuccessStory = require('../models/SuccessStory');

// @route   GET /api/testimonials
// @access  Public
// Returns featured success stories as testimonials
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const stories = await SuccessStory.find({ featured: true })
            .sort({ createdAt: -1 })
            .limit(limit);

        const testimonials = stories.map(s => ({
            id: s._id,
            name: s.name,
            role: s.role,
            company: s.company,
            quote: s.story,
            outcome: s.outcome,
            image: s.image,
            rating: 5
        }));

        res.json(testimonials);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
