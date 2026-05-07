const express = require('express');
const router = express.Router();
const SuccessStory = require('../models/SuccessStory');
const { protectAdmin } = require('../middleware/authMiddleware');
const setCache = require('../middleware/cacheMiddleware');

// @route   GET /api/success-stories
// @access  Public
router.get('/', async (req, res) => {
    try {
        const stories = await SuccessStory.find({}).sort({ createdAt: -1 });
        res.json(stories);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   GET /api/success-stories/featured
// @access  Public
router.get('/featured', async (req, res) => {
    try {
        const stories = await SuccessStory.find({ featured: true }).limit(4);
        res.json(stories);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   POST /api/success-stories
// @access  Private/Admin
router.post('/', protectAdmin, async (req, res) => {
    try {
        const { name, role, company, previousRole, image, story, outcome, featured } = req.body;

        if (!name || !story) {
            return res.status(400).json({ message: 'name and story are required' });
        }

        const newStory = await SuccessStory.create({
            name, role, company, previousRole, image, story, outcome,
            featured: featured || false
        });

        res.status(201).json({ success: true, data: newStory });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   PUT /api/success-stories/:id
// @access  Private/Admin
router.put('/:id', protectAdmin, async (req, res) => {
    try {
        const story = await SuccessStory.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!story) return res.status(404).json({ message: 'Success story not found' });

        res.json({ success: true, data: story });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   DELETE /api/success-stories/:id
// @access  Private/Admin
router.delete('/:id', protectAdmin, async (req, res) => {
    try {
        const story = await SuccessStory.findByIdAndDelete(req.params.id);
        if (!story) return res.status(404).json({ message: 'Success story not found' });
        res.json({ success: true, message: 'Success story deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
