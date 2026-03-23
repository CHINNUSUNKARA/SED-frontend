const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Assignment = require('../models/Assignment');
const { protectInstructor } = require('../middleware/authMiddleware');

// Middleware to ensure user is instructor (can reuse protectInstructor or add custom check)
// Assuming protectInstructor verifies role='Instructor' or 'Admin'

// @desc    Get instructor dashboard stats (Revenue, Students, Rating, Courses)
// @route   GET /api/instructor/stats
// @access  Private/Instructor
router.get('/stats', protectInstructor, async (req, res) => {
    try {
        const instructorId = req.user.id;

        // 1. Get Courses Count
        // Assuming courses have an 'instructor' field referencing User
        // Looking at Course.js might be needed, but assuming standard schema
        const courses = await Course.find({ instructor: instructorId });
        const courseCount = courses.length;
        const courseIds = courses.map(c => c._id);

        // 2. Get Students Count (unique enrollments)
        const totalStudents = await Enrollment.distinct('student', { course: { $in: courseIds } });
        const studentCount = totalStudents.length;

        // 3. Calculate Revenue (sum of enrollments * price, or if Enrollment has amount)
        // Check Enrollment model -> has 'amount' field
        const revenueAgg = await Enrollment.aggregate([
            { $match: { course: { $in: courseIds }, paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

        // 4. Calculate Average Rating
        // Assuming Course has 'rating' or we aggregate from Reviews
        // Using Course.rating for now
        const avgRatingAgg = await Course.aggregate([
            { $match: { instructor: instructorId } },
            { $group: { _id: null, avg: { $avg: '$rating' } } }
        ]);
        const avgRating = avgRatingAgg.length > 0 ? avgRatingAgg[0].avg.toFixed(1) : 0;

        res.json({
            revenue: totalRevenue,
            students: studentCount,
            courses: courseCount,
            rating: avgRating
        });
    } catch (error) {
        console.error('Error fetching instructor stats:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Get instructor courses with details
// @route   GET /api/instructor/courses
// @access  Private/Instructor
router.get('/courses', protectInstructor, async (req, res) => {
    try {
        const courses = await Course.find({ instructor: req.user.id });

        // Enrich with student count and revenue per course
        const result = await Promise.all(courses.map(async (course) => {
            const enrollments = await Enrollment.countDocuments({ course: course._id });
            const revenueAgg = await Enrollment.aggregate([
                { $match: { course: course._id, paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            return {
                id: course._id,
                title: course.title,
                description: course.description, // HTML?
                status: course.isPublished ? 'Published' : 'Draft',
                price: course.price,
                duration: course.duration || 'N/A',
                level: course.level,
                students: enrollments,
                rating: course.rating,
                revenue: revenueAgg.length > 0 ? revenueAgg[0].total : 0,
                image: course.thumbnail
            };
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Get enrolled students list for instructor
// @route   GET /api/instructor/students
// @access  Private/Instructor
router.get('/students', protectInstructor, async (req, res) => {
    try {
        const courses = await Course.find({ instructor: req.user.id }).select('_id title');
        const courseIds = courses.map(c => c._id);

        const enrollments = await Enrollment.find({ course: { $in: courseIds } })
            .populate('student', 'name email avatarUrl')
            .populate('course', 'title');

        // Allow filtering by search/course in frontend, send all for now
        const students = enrollments.map(e => ({
            id: e.student._id,
            name: e.student.name,
            email: e.student.email,
            avatar: e.student.avatarUrl,
            course: e.course.title,
            progress: e.progress,
            status: e.status === 'in-progress' ? 'Active' : e.status, // Map to frontend status
            joined: e.createdAt
        }));

        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Get instructor schedule
// @route   GET /api/instructor/schedule
// @access  Private/Instructor
router.get('/schedule', protectInstructor, async (req, res) => {
    try {
        // Can be extended to have a Schedule model
        // For now, return mock empty or simple logic
        res.json([]);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get recent submissions for instructor's courses
// @route   GET /api/instructor/assignments
// @access  Private/Instructor
router.get('/assignments', protectInstructor, async (req, res) => {
    try {
        const StudentSubmission = require('../models/StudentSubmission');
        const Assignment = require('../models/Assignment');

        // 1. Get instructor's courses
        const courses = await Course.find({ instructor: req.user.id }).select('_id');
        const courseIds = courses.map(c => c._id);

        // 2. Get assignments for these courses
        const assignments = await Assignment.find({ courseId: { $in: courseIds } }).select('_id');
        const assignmentIds = assignments.map(a => a._id);

        // 3. Get submissions
        const submissions = await StudentSubmission.find({ assignmentId: { $in: assignmentIds } })
            .populate('studentId', 'name email')
            .populate({
                path: 'assignmentId',
                select: 'title courseId maxScore',
                populate: { path: 'courseId', select: 'title' } // Deep populate course title
            })
            .sort({ submittedAt: -1 })
            .limit(20);

        // Format
        const formatted = submissions.map(s => ({
            id: s._id,
            student: s.studentId ? s.studentId.name : 'Unknown',
            course: s.assignmentId && s.assignmentId.courseId ? s.assignmentId.courseId.title : 'Unknown Course',
            task: s.assignmentId ? s.assignmentId.title : 'Unknown Task',
            submitted: s.submittedAt, // Frontend handles formatting "2 hours ago"
            status: s.grade ? 'Graded' : 'Pending', // Simplified status
            grade: s.grade ? `${s.grade}/${s.assignmentId.maxScore || 100}` : '-'
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching instructor assignments:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get public instructor profile by name
// @route   GET /api/instructor/public/:name
// @access  Public
router.get('/public/:name', async (req, res) => {
    try {
        const name = decodeURIComponent(req.params.name);
        const user = await User.findOne({ name: name, role: 'Instructor' }).select('-password -email -enrolledCourses');

        if (!user) {
            // Try case insensitive
            const userRegex = await User.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, role: 'Instructor' }).select('-password -email -enrolledCourses');
            if (!userRegex) {
                return res.status(404).json({ message: 'Instructor not found' });
            }
        }

        const instructor = user || userRegex;

        // Get courses
        const courses = await Course.find({ instructor: instructor._id });

        // Calculate stats
        const courseIds = courses.map(c => c._id);
        const totalStudents = await Enrollment.distinct('student', { course: { $in: courseIds } });

        // Calculate avg rating from courses
        const avgRatingAgg = await Course.aggregate([
            { $match: { instructor: instructor._id } },
            { $group: { _id: null, avg: { $avg: '$rating' } } }
        ]);
        const avgRating = avgRatingAgg.length > 0 ? avgRatingAgg[0].avg.toFixed(1) : (instructor.rating || 5.0);

        res.json({
            instructor: {
                ...instructor.toObject(),
                rating: avgRating,
                students: totalStudents.length,
                reviews: 0 // Placeholder or calculate
            },
            courses
        });
    } catch (error) {
        console.error('Error fetching instructor profile:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
