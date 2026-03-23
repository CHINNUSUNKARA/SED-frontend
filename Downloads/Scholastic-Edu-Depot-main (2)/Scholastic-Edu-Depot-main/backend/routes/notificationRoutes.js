const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all notifications for logged in user
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 });
        res.json({ success: true, data: notifications });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-read
// @access  Private
router.put('/mark-read', protect, async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, read: false },
            { $set: { read: true } }
        );
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
