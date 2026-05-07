const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res) => {
    try {
        // Get total revenue (sum of all paid enrollments)
        const revenueResult = await Enrollment.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Get active students count
        const activeStudents = await User.countDocuments({ role: 'Student' });

        // Get total course enrollments
        const courseEnrollments = await Enrollment.countDocuments();

        // Get new instructors count (added in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newInstructors = await User.countDocuments({
            role: 'Instructor',
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Calculate changes (Simulated for Demo based on current values or mock)
        // Ideally these would be calculated by comparing with previous month's data
        const statsWithChanges = {
            totalRevenue: {
                value: totalRevenue,
                change: totalRevenue > 0 ? '+12.5%' : '0%' // Simulated growth if revenue exists
            },
            activeStudents: {
                value: activeStudents,
                change: activeStudents > 0 ? '+5.2%' : '0%'
            },
            courseEnrollments: {
                value: courseEnrollments,
                change: courseEnrollments > 0 ? '+8.1%' : '0%'
            },
            newInstructors: {
                value: newInstructors,
                change: newInstructors > 0 ? '+2.0%' : '0%'
            }
        };

        res.json({
            success: true,
            data: statsWithChanges
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics'
        });
    }
});

// @route   GET /api/admin/enrollments/recent
// @desc    Get recent enrollments
// @access  Private/Admin
router.get('/enrollments/recent', protect, authorize('admin'), async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const enrollments = await Enrollment.find()
            .populate('student', 'name email')
            .populate('course', 'name')
            .sort({ enrolledAt: -1 })
            .limit(limit);

        const formattedEnrollments = enrollments.map(enrollment => ({
            id: enrollment._id,
            studentName: enrollment.student?.name || 'Unknown',
            studentEmail: enrollment.student?.email,
            courseName: enrollment.course?.name || 'Unknown Course',
            date: enrollment.enrolledAt,
            status: enrollment.status,
            amount: enrollment.amount
        }));

        res.json({
            success: true,
            data: formattedEnrollments
        });
    } catch (error) {
        console.error('Error fetching recent enrollments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recent enrollments'
        });
    }
});

// @route   GET /api/admin/students
// @desc    Get all students
// @access  Private/Admin
router.get('/students', protect, authorize('admin'), async (req, res) => {
    try {
        const students = await User.find({ role: 'Student' })
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching students'
        });
    }
});

// @route   GET /api/admin/instructors
// @desc    Get all instructors
// @access  Private/Admin
router.get('/instructors', protect, authorize('admin'), async (req, res) => {
    try {
        const instructors = await User.find({ role: 'Instructor' })
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: instructors.length,
            data: instructors
        });
    } catch (error) {
        console.error('Error fetching instructors:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching instructors'
        });
    }
});

// @route   GET /api/admin/dashboard/courses
// @desc    Get all courses
// @access  Private/Admin
router.get('/courses', protect, authorize('admin'), async (req, res) => {
    try {
        console.log('[ADMIN COURSES] Fetching all courses...');
        console.log('[ADMIN COURSES] User:', req.user);

        const courses = await Course.find()
            .sort({ createdAt: -1 });

        console.log(`[ADMIN COURSES] Found ${courses.length} courses`);

        // Transform course data to match frontend expectations
        const transformedCourses = courses.map(course => ({
            id: course._id.toString(),
            title: course.name,  // Map 'name' to 'title'
            image: course.imageUrl,  // Map 'imageUrl' to 'image'
            instructor: course.instructor?.name || 'Unknown',
            category: course.category || 'Uncategorized',
            price: course.pricing?.amount || 0,
            duration: course.duration || 'N/A',
            students: 0,  // TODO: Calculate from enrollments
            rating: 0,  // TODO: Calculate from reviews
            slug: course.slug,
            tagline: course.tagline || '',
            description: course.description || '',
            level: 'Beginner',  // Default level
            lessons: course.curriculum?.length || 0
        }));

        console.log('[ADMIN COURSES] Sample transformed course:', transformedCourses[0]);

        res.json({
            success: true,
            count: transformedCourses.length,
            data: transformedCourses
        });
    } catch (error) {
        console.error('[ADMIN COURSES] Error fetching courses:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching courses'
        });
    }
});

// @route   GET /api/admin/analytics
// @desc    Get analytics data
// @access  Private/Admin
router.get('/analytics', protect, authorize('admin'), async (req, res) => {
    try {
        // Revenue trends (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const revenueTrends = await Enrollment.aggregate([
            {
                $match: {
                    paymentStatus: 'paid',
                    enrolledAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$enrolledAt' },
                        month: { $month: '$enrolledAt' }
                    },
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Student growth
        const studentGrowth = await User.aggregate([
            {
                $match: {
                    role: 'Student',
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Course performance
        const coursePerformance = await Enrollment.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: '$course',
                    completions: { $sum: 1 }
                }
            },
            { $sort: { completions: -1 } },
            { $limit: 10 }
        ]);

        const populatedCourses = await Course.populate(coursePerformance, {
            path: '_id',
            select: 'name'
        });

        // SIMULATED DATA FOR "Ap distices" (Andhra Pradesh Districts) & Traffic Sources
        // Since User model doesn't have location data yet
        const apDistricts = [
            'Visakhapatnam', 'Krishna', 'Guntur', 'East Godavari', 'Chittoor',
            'Nellore', 'Kurnool', 'Anantapur', 'West Godavari', 'Srikakulam'
        ];

        // Generate random distribution for Top Regions
        const topRegions = apDistricts
            .map(district => ({
                district: district,
                users: Math.floor(Math.random() * 5000) + 500 // Random users
            }))
            .sort((a, b) => b.users - a.users) // Sort by users desc
            .slice(0, 5) // Top 5
            .map(item => ({
                ...item,
                percent: Math.floor((item.users / 20000) * 100) + '%' // Dummy percent
            }));

        // Generate Traffic Sources
        const trafficSources = [
            { label: 'Google Search', percent: 45, color: 'bg-purple-600' },
            { label: 'Social Media', percent: 30, color: 'bg-blue-500' },
            { label: 'Direct', percent: 15, color: 'bg-green-500' },
            { label: 'Referral', percent: 10, color: 'bg-orange-500' }
        ];

        // Simulated Session Metrics
        const sessionMetrics = {
            avgSessionDuration: '12m 30s',
            sessionDurationChange: '+8.2%',
            bounceRate: '42.5%',
            bounceRateChange: '-2.1%'
        };

        res.json({
            success: true,
            data: {
                revenueTrends,
                studentGrowth,
                coursePerformance: populatedCourses,
                topRegions,
                trafficSources,
                sessionMetrics
            }
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics data'
        });
    }
});

module.exports = router;
