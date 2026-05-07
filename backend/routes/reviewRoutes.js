const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Course = require('../models/Course');
const { protect, protectStudent, protectAdmin } = require('../middleware/authMiddleware');

// @route   GET /api/reviews
// @access  Public
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const courseSlug = req.query.course;

        const query = courseSlug ? { courseSlug } : {};

        const reviews = await Review.find(query)
            .populate('student', 'name avatarUrl')
            .populate('course', 'name slug')
            .sort({ createdAt: -1 })
            .limit(limit);

        const data = reviews.map(r => ({
            id: r._id,
            courseTitle: r.course?.name || '',
            courseId: r.course?.slug || r.courseSlug || '',
            rating: r.rating,
            comment: r.comment,
            date: r.createdAt,
            studentName: r.student?.name || r.studentName || 'Anonymous'
        }));

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   POST /api/reviews
// @access  Private/Student
router.post('/', protect, async (req, res) => {
    try {
        const { courseId, courseSlug, rating, comment } = req.body;

        if (!courseId || !rating || !comment) {
            return res.status(400).json({ message: 'courseId, rating, and comment are required' });
        }

        // Prevent duplicate review from same student on same course
        const existing = await Review.findOne({ student: req.user.userId, course: courseId });
        if (existing) {
            return res.status(400).json({ message: 'You have already reviewed this course' });
        }

        const course = await Course.findById(courseId).select('name slug');
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const review = await Review.create({
            student: req.user.userId,
            course: courseId,
            courseSlug: courseSlug || course.slug,
            rating,
            comment,
            studentName: req.user.name
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(400).json({ message: 'Invalid review data', error: error.message });
    }
});

// @route   DELETE /api/reviews/:id
// @access  Private/Admin
router.delete('/:id', protectAdmin, async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });
        res.json({ success: true, message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
