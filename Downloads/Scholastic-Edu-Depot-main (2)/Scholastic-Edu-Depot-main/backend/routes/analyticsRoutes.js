const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const Course = require('../models/Course');

const router = express.Router();

// -----------------------------------------------------------------------------
// GET /api/analytics/stats
// Returns generic dashboard statistics for admin view.
// -----------------------------------------------------------------------------
router.get('/stats', async (_req, res) => {
  try {
    // Total revenue (completed orders only)
    const revenueAgg = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueAgg.length ? revenueAgg[0].total : 0;

    // Active students (role === 'Student')
    const activeStudents = await User.countDocuments({ role: 'Student' });

    // Total enrollments (completed or pending orders)
    const totalEnrollments = await Order.countDocuments({});

    // New instructors in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newInstructors = await User.countDocuments({
      role: { $in: ['Instructor', 'MarketingAgent'] },
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        revenue: totalRevenue,
        activeStudents,
        enrollments: totalEnrollments,
        newInstructors
      }
    });
  } catch (error) {
    console.error('Analytics stats error:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

// -----------------------------------------------------------------------------
// GET /api/analytics/recent-enrollments
// ?limit=5 (optional)
// Returns recent course enrollments based on Order creation time.
// -----------------------------------------------------------------------------
router.get('/recent-enrollments', async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 5;
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'name email')
      .populate('course', 'name');

    const data = orders.map((o) => ({
      id: o._id,
      student: o.user?.name || 'Unknown',
      course: o.course?.name || 'Unknown',
      date: o.createdAt,
      status: o.status
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('Analytics recent-enrollments error:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

module.exports = router;
