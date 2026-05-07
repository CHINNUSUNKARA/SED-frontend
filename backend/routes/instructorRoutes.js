const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Assignment = require('../models/Assignment');
const StudentSubmission = require('../models/StudentSubmission');
const { protectInstructor } = require('../middleware/authMiddleware');

// Helper: get instructor's courses using embedded instructor.name match
async function getInstructorCourses(instructorName) {
    return Course.find({ 'instructor.name': { $regex: new RegExp(`^${instructorName}$`, 'i') } });
}

// @route   GET /api/instructor/stats
// @access  Private/Instructor
router.get('/stats', protectInstructor, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('name');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const courses = await getInstructorCourses(user.name);
        const courseIds = courses.map(c => c._id);

        const totalStudentsArr = await Enrollment.distinct('student', { course: { $in: courseIds } });

        const revenueAgg = await Enrollment.aggregate([
            { $match: { course: { $in: courseIds }, paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

        // No rating field on Course model — default to 0
        res.json({
            revenue: totalRevenue,
            students: totalStudentsArr.length,
            courses: courses.length,
            rating: 0
        });
    } catch (error) {
        console.error('Error fetching instructor stats:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   GET /api/instructor/courses
// @access  Private/Instructor
router.get('/courses', protectInstructor, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('name');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const courses = await getInstructorCourses(user.name);

        const result = await Promise.all(courses.map(async (course) => {
            const enrollmentCount = await Enrollment.countDocuments({ course: course._id });
            const revenueAgg = await Enrollment.aggregate([
                { $match: { course: course._id, paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            return {
                id: course._id,
                title: course.name,
                description: course.description,
                status: 'Published',
                price: course.pricing?.amount || 0,
                duration: course.duration || 'N/A',
                level: 'N/A',
                students: enrollmentCount,
                rating: 0,
                revenue: revenueAgg.length > 0 ? revenueAgg[0].total : 0,
                image: course.imageUrl,
                slug: course.slug
            };
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   GET /api/instructor/students
// @access  Private/Instructor
router.get('/students', protectInstructor, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('name');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const courses = await getInstructorCourses(user.name);
        const courseIds = courses.map(c => c._id);

        const enrollments = await Enrollment.find({ course: { $in: courseIds } })
            .populate('student', 'name email avatarUrl')
            .populate('course', 'name');

        const students = enrollments.map(e => ({
            id: e.student?._id,
            name: e.student?.name,
            email: e.student?.email,
            avatar: e.student?.avatarUrl,
            course: e.course?.name,
            progress: e.progress,
            status: e.status === 'in-progress' ? 'Active' : e.status,
            joined: e.enrolledAt
        }));

        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   GET /api/instructor/schedule
// @access  Private/Instructor
router.get('/schedule', protectInstructor, async (req, res) => {
    try {
        res.json([]);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/instructor/assignments
// @access  Private/Instructor
router.get('/assignments', protectInstructor, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('name');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const courses = await getInstructorCourses(user.name);
        const courseIds = courses.map(c => c._id);

        const assignments = await Assignment.find({ courseId: { $in: courseIds } }).select('_id title maxScore');
        const assignmentIds = assignments.map(a => a._id);

        const submissions = await StudentSubmission.find({ assignmentId: { $in: assignmentIds } })
            .populate('studentId', 'name email')
            .populate({
                path: 'assignmentId',
                select: 'title courseId maxScore',
                populate: { path: 'courseId', select: 'name' }
            })
            .sort({ submittedAt: -1 })
            .limit(20);

        const formatted = submissions.map(s => ({
            id: s._id,
            student: s.studentId?.name || 'Unknown',
            course: s.assignmentId?.courseId?.name || 'Unknown Course',
            task: s.assignmentId?.title || 'Unknown Task',
            submitted: s.submittedAt,
            status: s.grade ? 'Graded' : 'Pending',
            grade: s.grade ? `${s.grade}/${s.assignmentId?.maxScore || 100}` : '-'
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching instructor assignments:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/instructor/public/:name
// @access  Public
router.get('/public/:name', async (req, res) => {
    try {
        const name = decodeURIComponent(req.params.name);

        const instructor = await User.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            role: 'Instructor'
        }).select('-password -enrolledCourses');

        if (!instructor) {
            return res.status(404).json({ message: 'Instructor not found' });
        }

        const courses = await getInstructorCourses(instructor.name);
        const courseIds = courses.map(c => c._id);
        const totalStudents = await Enrollment.distinct('student', { course: { $in: courseIds } });

        res.json({
            instructor: {
                ...instructor.toObject(),
                rating: 0,
                students: totalStudents.length,
                reviews: 0
            },
            courses
        });
    } catch (error) {
        console.error('Error fetching instructor profile:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
