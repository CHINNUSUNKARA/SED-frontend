const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const StudentSubmission = require('../models/StudentSubmission');
const Course = require('../models/Course');
const { protect, protectInstructor, protectStudent } = require('../middleware/authMiddleware');
const { assignmentValidator, submissionValidator, gradeValidator } = require('../middleware/validators');

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Instructor/Admin
router.post('/', protectInstructor, assignmentValidator, async (req, res) => {
    try {
        const { title, description, courseId, deadline, maxScore } = req.body;

        const assignment = await Assignment.create({
            title,
            description,
            courseId,
            deadline,
            maxScore,
            createdBy: req.user.id
        });

        // Add assignment to course
        await Course.findByIdAndUpdate(courseId, {
            $push: { assignments: assignment._id }
        });

        res.status(201).json(assignment);
    } catch (error) {
        console.error('Create Assignment Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get assignments for a course
// @route   GET /api/assignments/course/:courseId
// @access  Private
router.get('/course/:courseId', protect, async (req, res) => {
    try {
        const assignments = await Assignment.find({ courseId: req.params.courseId });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Submit an assignment
// @route   POST /api/assignments/:id/submit
// @access  Student
router.post('/:id/submit', protectStudent, submissionValidator, async (req, res) => {
    try {
        const { fileUrl, textSubmission } = req.body;
        const assignmentId = req.params.id;
        const studentId = req.user.id;

        // Check if already submitted
        const existingSubmission = await StudentSubmission.findOne({ assignmentId, studentId });
        if (existingSubmission) {
            // Update existing submission
            existingSubmission.fileUrl = fileUrl || existingSubmission.fileUrl;
            existingSubmission.textSubmission = textSubmission || existingSubmission.textSubmission;
            existingSubmission.submittedAt = Date.now();
            await existingSubmission.save();
            return res.json(existingSubmission);
        }

        const submission = await StudentSubmission.create({
            assignmentId,
            studentId,
            fileUrl,
            textSubmission
        });

        res.status(201).json(submission);
    } catch (error) {
        console.error('Submit Assignment Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Grade a submission
// @route   PUT /api/assignments/submission/:id/grade
// @access  Instructor/Admin
router.put('/submission/:id/grade', protectInstructor, gradeValidator, async (req, res) => {
    try {
        const { grade, feedback } = req.body;

        const submission = await StudentSubmission.findByIdAndUpdate(
            req.params.id,
            { grade, feedback, gradedBy: req.user.id },
            { new: true }
        );

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        res.json(submission);
    } catch (error) {
        console.error('Grade Submission Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get submissions for an assignment
// @route   GET /api/assignments/:id/submissions
// @access  Instructor/Admin
router.get('/:id/submissions', protectInstructor, async (req, res) => {
    try {
        const submissions = await StudentSubmission.find({ assignmentId: req.params.id })
            .populate('studentId', 'name email')
            .populate('assignmentId', 'title maxScore')
            .sort({ submittedAt: -1 });

        res.json(submissions);
    } catch (error) {
        console.error('Get Submissions Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get my submissions (for students)
// @route   GET /api/assignments/my-submissions
// @access  Student
router.get('/my-submissions', protectStudent, async (req, res) => {
    try {
        const submissions = await StudentSubmission.find({ studentId: req.user.id })
            .populate('assignmentId', 'title description deadline maxScore courseId')
            .populate({
                path: 'assignmentId',
                populate: {
                    path: 'courseId',
                    select: 'name'
                }
            })
            .sort({ submittedAt: -1 });

        res.json(submissions);
    } catch (error) {
        console.error('Get My Submissions Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
