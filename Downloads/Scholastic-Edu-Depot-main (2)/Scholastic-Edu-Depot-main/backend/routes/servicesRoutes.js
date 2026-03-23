
const express = require('express');
const Service = require('../models/Service');
const { protectAdmin } = require('../middleware/authMiddleware');
const { serviceValidator } = require('../middleware/validators');
const setCache = require('../middleware/cacheMiddleware');

const router = express.Router();

// GET /api/services
router.get('/', setCache(3600), async (req, res) => {
    try {
        const services = await Service.find({});
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET /api/services/:slug
router.get('/:slug', async (req, res) => {
    try {
        const service = await Service.findOne({ slug: req.params.slug });
        if (service) {
            res.json(service);
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /api/services
router.post('/', protectAdmin, serviceValidator, async (req, res) => {
    try {
        const existing = await Service.findOne({ slug: req.body.slug });
        if (existing) {
            return res.status(400).json({ message: 'Service with this slug already exists.' });
        }
        const newService = await Service.create(req.body);
        res.status(201).json(newService);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error: error.message });
    }
});

// PUT /api/services/:slug
router.put('/:slug', protectAdmin, serviceValidator, async (req, res) => {
    try {
        const service = await Service.findOne({ slug: req.params.slug });
        if (service) {
            const updatedService = await Service.findOneAndUpdate(
                { slug: req.params.slug },
                req.body,
                { new: true }
            );
            res.json(updatedService);
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// DELETE /api/services/:slug
router.delete('/:slug', protectAdmin, async (req, res) => {
    try {
        const service = await Service.findOneAndDelete({ slug: req.params.slug });
        if (service) {
            res.json({ message: 'Service removed' });
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;