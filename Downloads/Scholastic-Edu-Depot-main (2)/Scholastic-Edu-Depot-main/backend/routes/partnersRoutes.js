
const express = require('express');
const Partner = require('../models/Partner');
const { protectAdmin } = require('../middleware/authMiddleware');
const { partnerValidator } = require('../middleware/validators');
const setCache = require('../middleware/cacheMiddleware');

const router = express.Router();

// GET /api/partners
router.get('/', setCache(3600), async (req, res) => {
    try {
        const partners = await Partner.find({});
        res.json(partners);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET /api/partners/:slug
router.get('/:slug', async (req, res) => {
    try {
        const partner = await Partner.findOne({ slug: req.params.slug });
        if (partner) {
            res.json(partner);
        } else {
            res.status(404).json({ message: 'Partner not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /api/partners
router.post('/', protectAdmin, partnerValidator, async (req, res) => {
    try {
        const existing = await Partner.findOne({ slug: req.body.slug });
        if (existing) {
            return res.status(400).json({ message: 'Partner with this slug already exists.' });
        }
        const newPartner = await Partner.create(req.body);
        res.status(201).json(newPartner);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error: error.message });
    }
});

// PUT /api/partners/:slug
router.put('/:slug', protectAdmin, partnerValidator, async (req, res) => {
    try {
        const partner = await Partner.findOne({ slug: req.params.slug });
        if (partner) {
            const updatedPartner = await Partner.findOneAndUpdate(
                { slug: req.params.slug },
                req.body,
                { new: true }
            );
            res.json(updatedPartner);
        } else {
            res.status(404).json({ message: 'Partner not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// DELETE /api/partners/:slug
router.delete('/:slug', protectAdmin, async (req, res) => {
    try {
        const partner = await Partner.findOneAndDelete({ slug: req.params.slug });
        if (partner) {
            res.json({ message: 'Partner removed' });
        } else {
            res.status(404).json({ message: 'Partner not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;