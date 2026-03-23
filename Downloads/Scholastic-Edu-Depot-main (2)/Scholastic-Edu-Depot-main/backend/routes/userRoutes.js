
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const { protectStudent, protect } = require('../middleware/authMiddleware');
const { userProfileValidators } = require('../middleware/validators');

// --- User Progress Routes ---

// @desc    Get current user's progress
// @route   GET /api/user/progress
// @access  Private/Student
router.get('/progress', protectStudent, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.enrolledCourses || []);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Enroll user in a course
// @route   POST /api/user/progress/enroll
// @access  Private/Student
router.post('/progress/enroll', protectStudent, userProfileValidators.enroll, async (req, res) => {
    const { courseSlug } = req.body;

    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const alreadyEnrolled = user.enrolledCourses.some(c => c.courseSlug === courseSlug);
        if (alreadyEnrolled) {
            return res.status(400).json({ message: 'Already enrolled in this course.' });
        }

        user.enrolledCourses.push({ courseSlug, progress: 0, completedLessons: [] });
        await user.save();

        res.status(201).json(user.enrolledCourses);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Mark a lesson as complete
// @route   POST /api/user/progress/complete-lesson
// @access  Private/Student
router.post('/progress/complete-lesson', protectStudent, userProfileValidators.completeLesson, async (req, res) => {
    const { courseSlug, lessonId } = req.body;

    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const enrolledCourse = user.enrolledCourses.find(c => c.courseSlug === courseSlug);
        if (!enrolledCourse) return res.status(400).json({ message: 'Not enrolled in this course' });

        // Add lesson to completed list if not already there
        if (!enrolledCourse.completedLessons.includes(lessonId)) {
            enrolledCourse.completedLessons.push(lessonId);
        }

        // Calculate progress percentage
        const course = await Course.findOne({ slug: courseSlug });
        if (course) {
            let totalTopics = 0;
            course.curriculum.forEach(week => {
                totalTopics += week.topics.length;
            });

            const completedCount = enrolledCourse.completedLessons.length;
            const newProgress = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

            enrolledCourse.progress = Math.min(newProgress, 100);
        }

        await user.save();
        res.json(user.enrolledCourses);

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Update profile image
// @route   PUT /api/user/profile-image
// @access  Private/Student
router.put('/profile-image', protectStudent, userProfileValidators.avatar, async (req, res) => {
    const { avatarUrl } = req.body;
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.avatarUrl = avatarUrl;
        await user.save();

        res.json({ message: 'Profile image updated', avatarUrl: user.avatarUrl });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});


// --- Saved Courses Routes ---

// @desc    Get current user's saved courses
// @route   GET /api/user/saved-courses
// @access  Private/Student
router.get('/saved-courses', protectStudent, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.savedCourses || []);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Save/unsave a course for later
// @route   POST /api/user/saved-courses
// @access  Private/Student
router.post('/saved-courses', protectStudent, userProfileValidators.saveCourse, async (req, res) => {
    const { courseName } = req.body;

    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const courseIndex = user.savedCourses.indexOf(courseName);

        if (courseIndex > -1) {
            user.savedCourses.splice(courseIndex, 1);
        } else {
            user.savedCourses.push(courseName);
        }

        await user.save();

        res.status(200).json(user.savedCourses);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// --- Dashboard Data Routes ---

// @desc    Get current user profile with detailed stats
// @route   GET /api/user/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        console.log(`[PROFILE_DEBUG] Fetching profile for user: ${req.user.userId}`);
        const user = await User.findById(req.user.userId).select('-password -emailVerificationToken');
        if (!user) {
            console.error(`[PROFILE_DEBUG] User not found for ID: ${req.user.userId}`);
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Get enrolled courses with full details
// @route   GET /api/user/enrolled-courses
// @access  Private
router.get('/enrolled-courses', protect, async (req, res) => {
    try {
        const Enrollment = require('../models/Enrollment');
        // Fetch enrollments and populate course details
        const enrollments = await Enrollment.find({ student: req.user.userId })
            .populate('course', 'title slug thumbnail level lessons category rating duration description image');

        // Format for frontend
        const formatted = enrollments.map(e => {
            if (!e.course) return null; // Handle deleted courses
            return {
                id: e.course._id,
                title: e.course.title,
                slug: e.course.slug,
                progress: e.progress,
                lastAccessed: e.updatedAt,
                lessons: e.course.lessons || 0,
                image: e.course.thumbnail || e.course.image || '/placeholder.jpg',
                category: e.course.category || 'General',
                rating: e.course.rating || 5.0,
                description: e.course.description,
                nextLesson: e.progress === 100 ? 'Course Completed' : `Lesson ${Math.floor((e.progress / 100) * (e.course.lessons || 1)) + 1}`,
                status: e.status
            };
        }).filter(item => item !== null);

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Get user assignments
// @route   GET /api/user/assignments
// @access  Private
router.get('/assignments', protect, async (req, res) => {
    try {
        const Assignment = require('../models/Assignment');
        const StudentSubmission = require('../models/StudentSubmission');
        const Enrollment = require('../models/Enrollment');

        // 1. Find all courses the user is enrolled in
        // Using the Enrollment model is more reliable if you switched to it, 
        // but user.enrolledCourses is in the User model based on previous file view.
        // Let's assume we use the Enrollment model for robust querying or fallback to User.

        const enrollments = await Enrollment.find({ student: req.user.userId, status: 'in-progress' }).populate('course');
        const courseIds = enrollments.map(e => e.course._id);

        // 2. Find assignments for these courses
        const assignments = await Assignment.find({
            courseId: { $in: courseIds },
            deadline: { $gte: new Date() } // Filter pending/future assignments? Or all?
        }).populate('courseId', 'title slug');

        // 3. Find user submissions for these assignments
        const submissions = await StudentSubmission.find({
            student: req.user.userId,
            assignment: { $in: assignments.map(a => a._id) }
        });

        // 4. Map them together
        const result = assignments.map(assignment => {
            const submission = submissions.find(s => s.assignment.toString() === assignment._id.toString());
            return {
                id: assignment._id,
                title: assignment.title,
                course: assignment.courseId ? assignment.courseId.title : 'Unknown Course',
                dueDate: assignment.deadline,
                status: submission ? submission.status : (new Date(assignment.deadline) < new Date() ? 'Overdue' : 'Pending'),
                grade: submission ? submission.grade : '-'
            };
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Get user schedule/events
// @route   GET /api/user/schedule
// @access  Private
router.get('/schedule', protect, async (req, res) => {
    try {
        // Mocking some schedule data based on assignments and enrolled courses for now
        // In a real app, this would query a Schedule/Event model
        // For Phase 1, we generate from assignments + dummy live classes

        const Assignment = require('../models/Assignment');
        const Enrollment = require('../models/Enrollment');
        const Event = require('../models/Event'); // Import Event model

        // 1. Get Enrollments to find relevant courses
        const enrollments = await Enrollment.find({ student: req.user.userId }).populate('course');
        const courseIds = enrollments.map(e => e.course._id);

        // 2. Fetch Assignments (Deadlines)
        const assignments = await Assignment.find({
            courseId: { $in: courseIds },
            deadline: { $gte: new Date() } // Future deadlines
        }).populate('courseId', 'title');

        const assignmentEvents = assignments.map(a => ({
            id: a._id,
            title: `Assignment Due: ${a.title}`,
            type: 'Deadline',
            date: a.deadline,
            time: '11:59 PM', // Default deadline time
            link: `assignment://${a._id}`, // Special internal link for frontend handling if needed, or null
            courseName: a.courseId ? a.courseId.title : 'Course'
        }));

        // 3. Fetch Real Events (Live Classes, Webinars, etc.)
        // Filter by events meant for everyone OR specific courses the user is enrolled in
        const events = await Event.find({
            $or: [
                { courseId: { $in: courseIds } }, // Course-specific events
                { courseId: null } // General events (holidays, global webinars)
            ],
            date: { $gte: new Date() }
        }).sort({ date: 1 });

        const calendarEvents = events.map(e => ({
            id: e._id,
            title: e.title,
            type: e.type,
            date: e.date,
            time: e.time || 'All Day',
            link: e.link,
            courseName: e.courseId ? 'Course Event' : 'General' // You could populate courseId if needed for name
        }));

        // 4. Merge and Sort
        const fullSchedule = [...assignmentEvents, ...calendarEvents].sort((a, b) => new Date(a.date) - new Date(b.date));

        res.json(fullSchedule);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Get user certificates
// @route   GET /api/user/certificates
// @access  Private
router.get('/certificates', protect, async (req, res) => {
    try {
        const Certificate = require('../models/Certificate');
        const certificates = await Certificate.find({ userId: req.user.userId })
            .populate('courseId', 'title');

        const formatted = certificates.map(c => ({
            id: c._id,
            course: c.courseId ? c.courseId.title : 'Course',
            date: c.issueDate,
            id_code: c.uniqueId,
            url: c.certificateUrl
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Get user notifications
// @route   GET /api/user/notifications
// @access  Private
router.get('/notifications', protect, async (req, res) => {
    try {
        const Notification = require('../models/Notification');
        const notifications = await Notification.find({ userId: req.user.userId })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Mark notification as read
// @route   PUT /api/user/notifications/:id/read
// @access  Private
router.put('/notifications/:id/read', protect, async (req, res) => {
    try {
        const Notification = require('../models/Notification');
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            { read: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Delete notification
// @route   DELETE /api/user/notifications/:id
// @access  Private
router.delete('/notifications/:id', protect, async (req, res) => {
    try {
        const Notification = require('../models/Notification');
        const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.json({ message: 'Notification removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;