const express = require('express');
const router = express.Router();
const SuccessStory = require('../models/SuccessStory');
const setCache = require('../middleware/cacheMiddleware');

// @desc    Get all success stories
// @route   GET /api/success-stories
// @access  Public
router.get('/', setCache(3600), async (req, res) => {
    try {
        const stories = await SuccessStory.find({}).sort({ createdAt: -1 });
        res.json(stories);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Get featured success stories
// @route   GET /api/success-stories/featured
// @access  Public
router.get('/featured', setCache(3600), async (req, res) => {
    try {
        const stories = await SuccessStory.find({ featured: true }).limit(4);
        res.json(stories);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
