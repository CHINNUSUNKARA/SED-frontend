const express = require('express');
const Course = require('../models/Course');
const { protectAdmin } = require('../middleware/authMiddleware');
const { courseValidator } = require('../middleware/validators');
const setCache = require('../middleware/cacheMiddleware');

const router = express.Router();

// Helper function to broadcast course updates
const broadcastCourseUpdate = (eventType, courseData) => {
  if (global.broadcastEvent) {
    global.broadcastEvent(eventType, courseData);
  }
};

// @desc    Fetch all courses
// @route   GET /api/courses
// @access  Public
router.get('/', setCache(3600), async (req, res) => {
    try {
        const courses = await Course.find({});
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Fetch single course
// @route   GET /api/courses/:slug
// @access  Public
router.get('/:slug', async (req, res) => {
    try {
        const course = await Course.findOne({ slug: req.params.slug });
        if (course) {
            res.json(course);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Admin
router.post('/', protectAdmin, courseValidator, async (req, res) => {
    try {
        const existingCourse = await Course.findOne({ slug: req.body.slug });
        if (existingCourse) {
            return res.status(400).json({ message: 'Course with this slug already exists.' });
        }
        const newCourse = await Course.create(req.body);
        
        // Broadcast course creation event
        broadcastCourseUpdate('course-created', newCourse);
        
        res.status(201).json(newCourse);
    } catch (error) {
        res.status(400).json({ message: 'Invalid course data', error: error.message });
    }
});

// @desc    Update a course
// @route   PUT /api/courses/:slug
// @access  Private/Admin
router.put('/:slug', protectAdmin, courseValidator, async (req, res) => {
    try {
        const course = await Course.findOne({ slug: req.params.slug });

        if (course) {
            // Check if slug is being updated and if it already exists
            if (req.body.slug && req.body.slug !== course.slug) {
                const existing = await Course.findOne({ slug: req.body.slug });
                if (existing) {
                    return res.status(400).json({ message: 'Course with this slug already exists.' });
                }
            }

            const updatedCourse = await Course.findOneAndUpdate(
                { slug: req.params.slug },
                req.body,
                { new: true }
            );
            
            // Broadcast course update event
            broadcastCourseUpdate('course-updated', updatedCourse);
            
            res.json(updatedCourse);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Bulk delete courses
// @route   DELETE /api/courses/bulk
// @access  Private/Admin
router.delete('/bulk', protectAdmin, async (req, res) => {
    try {
        const { ids } = req.body; // Expecting array of course IDs or slugs
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ message: 'Invalid request. Provide ids array.' });
        }

        // Delete by ID if they look like ObjectIds, or Slug?
        // Let's assume frontend sends IDs usually for bulk actions.
        const result = await Course.deleteMany({
            $or: [
                { _id: { $in: ids } },
                { slug: { $in: ids } }
            ]
        });
        
        // Broadcast course deletion event
        broadcastCourseUpdate('course-deleted', { ids, deletedCount: result.deletedCount });

        res.json({ message: 'Courses removed', count: result.deletedCount });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Delete a course
// @route   DELETE /api/courses/:slug
// @access  Private/Admin
router.delete('/:slug', protectAdmin, async (req, res) => {
    try {
        const course = await Course.findOneAndDelete({ slug: req.params.slug });
        if (course) {
            // Broadcast single course deletion event
            broadcastCourseUpdate('course-deleted', { ids: [req.params.slug], deletedCount: 1 });
            
            res.json({ message: 'Course removed' });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;