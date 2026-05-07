const express = require('express');
const mongoose = require('mongoose');
const Course = require('../models/Course');
const { protect, protectAdmin, authorize } = require('../middleware/authMiddleware');
const { courseCreateValidator, courseUpdateValidator } = require('../middleware/validators');
const { cacheMiddleware, clearCacheByPattern } = require('../middleware/cacheMiddleware');

const router = express.Router();

const COURSE_CACHE_TTL = 300;
const BULK_DELETE_LIMIT = 100;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isValidObjectId = (id) =>
    mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;

const invalidateCourseCache = () => clearCacheByPattern('/api/courses');

const broadcastCourseUpdate = (eventType, data) => {
    if (global.broadcastEvent) global.broadcastEvent(eventType, data);
};

const notFound = (res, entity = 'Course') =>
    res.status(404).json({ success: false, message: `${entity} not found` });

// Resolve a week by weekNumber inside req.course
const resolveWeek = (req, res) => {
    const weekNumber = parseInt(req.params.weekNumber, 10);
    const week = req.course.curriculum.find(w => w.weekNumber === weekNumber);
    if (!week) {
        res.status(404).json({ success: false, message: 'Week not found' });
        return null;
    }
    return week;
};

// ─── Route Middleware ─────────────────────────────────────────────────────────

// Attach course to req; 404 if missing
const loadCourse = async (req, res, next) => {
    try {
        const course = await Course.findOne({ slug: req.params.slug });
        if (!course) return notFound(res);
        req.course = course;
        next();
    } catch (err) {
        next(err);
    }
};

// Admin can manage any course; instructor can only manage their own
const canManageCourse = (req, res, next) => {
    const role = req.user?.role?.toLowerCase();
    if (role === 'admin') return next();
    if (role === 'instructor') {
        const ownerId = req.course.createdBy?.toString();
        const userId  = req.user.id || req.user._id?.toString();
        if (ownerId && ownerId === userId) return next();
        return res.status(403).json({ success: false, message: 'Forbidden: you do not own this course' });
    }
    return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
};

const adminOrInstructor = authorize('admin', 'instructor');

// ─── Public Routes ────────────────────────────────────────────────────────────

// GET /api/courses
router.get('/',  async (req, res) => {
    try {
        const {
            page = 1, limit = 20,
            category, subCategory, courseType, level, language,
            isFeatured, search,
            sort = 'createdAt', order = 'desc'
        } = req.query;

        const pageNum  = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
        const skip     = (pageNum - 1) * limitNum;

        const filter = { };
        if (category)    filter.category    = category;
        if (subCategory) filter.subCategory  = subCategory;
        if (courseType)  filter.courseType   = courseType;
        if (level)       filter.level        = level;
        if (language)    filter.language     = language;
        if (search) {
            filter.$text = { $search: search };
        }

        const allowedSorts = ['createdAt', 'name', 'stats.averageRating', 'stats.enrolledCount'];
        const sortField = allowedSorts.includes(sort) ? sort : 'createdAt';
        const sortDir   = order === 'asc' ? 1 : -1;

        const projection = '-curriculum -faqs -projects -attachments -liveDetails.sessions';

        const [courses, total] = await Promise.all([
            Course.find(filter)
                .select(projection)
                .lean()
                .skip(skip)
                .limit(limitNum)
                .sort({ [sortField]: sortDir }),
            Course.countDocuments(filter)
        ]);

        res.json({
            success: true,
            courses,
            pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
        });
    } catch (err) {
        console.error('[GET /courses]', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// GET /api/courses/:slug
router.get('/:slug', async (req, res) => {
    try {
        const course = await Course.findOne({ slug: req.params.slug})
            .populate('curriculum.assignments', 'title deadline maxScore')
            .lean();
        console.log('Fetched course:', course ? course.name : 'Not found');
        if (!course) return notFound(res);


        res.json({ success: true, course });
    } catch (err) {
        console.error('[GET /courses/:slug]', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ─── Course CRUD (Admin / Instructor) ────────────────────────────────────────

// POST /api/courses
router.post('/', protect, adminOrInstructor, async (req, res) => {
    try {
        const {
            name, slug, courseType, tagline, shortDescription, description,
            category, subCategory, tags, level, language,
            imageUrl, bannerUrl, promoVideoUrl, duration, totalHours,
            points, highlights, learningObjectives, prerequisites, targetAudience, tools,
            instructor, coInstructors, pricing, liveDetails,
            curriculum, certification, projects, faqs, deadlines,
            requiresEnrollment, allowFreePreview
        } = req.body;

        const course = await Course.create({
            name, slug, courseType, tagline, shortDescription, description,
            category, subCategory, tags, level, language,
            imageUrl, bannerUrl, promoVideoUrl, duration, totalHours,
            points, highlights, learningObjectives, prerequisites, targetAudience, tools,
            instructor, coInstructors, pricing, liveDetails,
            curriculum, certification, projects, faqs, deadlines,
            requiresEnrollment, allowFreePreview,
            isDraft: true,
            isPublished: false,
            createdBy: req.user.id || req.user._id
        });

        invalidateCourseCache();
        broadcastCourseUpdate('course-created', { _id: course._id, slug: course.slug });
        res.status(201).json({ success: true, course });
    } catch (err) {
        console.error('[POST /courses]', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: 'Validation Error', errors: Object.values(err.errors).map(e => e.message) });
        }
        if (err.code === 11000) {
            return res.status(409).json({ success: false, message: 'A course with this slug already exists' });
        }
        res.status(500).json({ success: false, message: 'Server Error', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
    }
});

// PUT /api/courses/:slug  – full update
router.put('/:slug', protect, adminOrInstructor, loadCourse, canManageCourse, courseUpdateValidator, async (req, res) => {
    try {
        const {
            name, slug, courseType, tagline, shortDescription, description,
            category, subCategory, tags, level, language,
            imageUrl, bannerUrl, promoVideoUrl, duration, totalHours,
            points, highlights, learningObjectives, prerequisites, targetAudience, tools,
            instructor, coInstructors, pricing, liveDetails,
            curriculum, certification, projects, faqs, deadlines,
            requiresEnrollment, allowFreePreview
        } = req.body;

        // Slug uniqueness check on change
        if (slug && slug !== req.params.slug) {
            const exists = await Course.findOne({ slug }).lean();
            if (exists) return res.status(409).json({ success: false, message: 'Slug already taken' });
        }

        const updatePayload = {
            name, slug, courseType, tagline, shortDescription, description,
            category, subCategory, tags, level, language,
            imageUrl, bannerUrl, promoVideoUrl, duration, totalHours,
            points, highlights, learningObjectives, prerequisites, targetAudience, tools,
            instructor, coInstructors, pricing, liveDetails,
            curriculum, certification, projects, faqs, deadlines,
            requiresEnrollment, allowFreePreview,
            lastUpdatedBy: req.user.id || req.user._id
        };

        // Remove undefined keys so existing data isn't overwritten with undefined
        Object.keys(updatePayload).forEach(k => updatePayload[k] === undefined && delete updatePayload[k]);

        const updated = await Course.findOneAndUpdate(
            { slug: req.params.slug },
            { $set: updatePayload },
            { new: true, runValidators: true }
        );

        broadcastCourseUpdate('course-updated', { _id: updated._id, slug: updated.slug });
        res.json({ success: true, course: updated });
    } catch (err) {
        console.error('[PUT /courses/:slug]', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: 'Validation Error', errors: Object.values(err.errors).map(e => e.message) });
        }
        if (err.code === 11000) {
            return res.status(409).json({ success: false, message: 'A course with this slug already exists' });
        }
        res.status(500).json({ success: false, message: 'Server Error', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
    }
});

// DELETE /api/courses/bulk
router.delete('/bulk', protectAdmin, async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'Provide a non-empty ids array' });
        }
        if (ids.length > BULK_DELETE_LIMIT) {
            return res.status(400).json({ success: false, message: `Cannot delete more than ${BULK_DELETE_LIMIT} at once` });
        }

        const objectIds = ids.filter(isValidObjectId).map(id => new mongoose.Types.ObjectId(id));
        const slugs     = ids.filter(id => !isValidObjectId(id));

        let query = {};
        if (objectIds.length && slugs.length) query = { $or: [{ _id: { $in: objectIds } }, { slug: { $in: slugs } }] };
        else if (objectIds.length) query = { _id: { $in: objectIds } };
        else query = { slug: { $in: slugs } };

        const result = await Course.deleteMany(query);

        invalidateCourseCache();
        broadcastCourseUpdate('course-deleted', { ids, deletedCount: result.deletedCount });
        res.json({ success: true, message: 'Courses removed', count: result.deletedCount });
    } catch (err) {
        console.error('[DELETE /courses/bulk]', err);
        res.status(500).json({ success: false, message: 'Server Error', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
    }
});

// DELETE /api/courses/:slug
router.delete('/:slug', protectAdmin, async (req, res) => {
    try {
        const course = await Course.findOneAndDelete({ slug: req.params.slug });
        if (!course) return notFound(res);
        invalidateCourseCache();
        broadcastCourseUpdate('course-deleted', { ids: [req.params.slug], deletedCount: 1 });
        res.json({ success: true, message: 'Course removed' });
    } catch (err) {
        console.error('[DELETE /courses/:slug]', err);
        res.status(500).json({ success: false, message: 'Server Error', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
    }
});

// ─── Flag Toggles (Admin only) ────────────────────────────────────────────────

// PATCH /api/courses/:slug/publish
router.patch('/:slug/publish', protectAdmin, async (req, res) => {
    try {
        const course = await Course.findOne({ slug: req.params.slug });
        if (!course) return notFound(res);

        course.isPublished = !course.isPublished;
        course.isDraft     = !course.isPublished;
        if (course.isPublished && !course.publishedAt) course.publishedAt = new Date();
        course.lastUpdatedBy = req.user.id || req.user._id;
        await course.save();

        invalidateCourseCache();
        broadcastCourseUpdate('course-updated', { _id: course._id, slug: course.slug, isPublished: course.isPublished });
        res.json({ success: true, isPublished: course.isPublished, message: `Course ${course.isPublished ? 'published' : 'unpublished'}` });
    } catch (err) {
        console.error('[PATCH /courses/:slug/publish]', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// PATCH /api/courses/:slug/archive
router.patch('/:slug/archive', protectAdmin, async (req, res) => {
    try {
        const course = await Course.findOne({ slug: req.params.slug });
        if (!course) return notFound(res);

        course.isArchived = !course.isArchived;
        if (course.isArchived) course.isPublished = false;
        course.lastUpdatedBy = req.user.id || req.user._id;
        await course.save();

        invalidateCourseCache();
        res.json({ success: true, isArchived: course.isArchived, message: `Course ${course.isArchived ? 'archived' : 'unarchived'}` });
    } catch (err) {
        console.error('[PATCH /courses/:slug/archive]', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// PATCH /api/courses/:slug/feature
router.patch('/:slug/feature', protectAdmin, async (req, res) => {
    try {
        const course = await Course.findOne({ slug: req.params.slug });
        if (!course) return notFound(res);

        course.isFeatured    = !course.isFeatured;
        course.lastUpdatedBy = req.user.id || req.user._id;
        await course.save();

        invalidateCourseCache();
        res.json({ success: true, isFeatured: course.isFeatured });
    } catch (err) {
        console.error('[PATCH /courses/:slug/feature]', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// PATCH /api/courses/:slug/flags  – set multiple flags at once
router.patch('/:slug/flags', protectAdmin, async (req, res) => {
    try {
        const allowed = ['isPublished', 'isFeatured', 'isArchived', 'isDraft', 'requiresEnrollment', 'allowFreePreview'];
        const updates = {};
        for (const flag of allowed) {
            if (typeof req.body[flag] === 'boolean') updates[flag] = req.body[flag];
        }
        if (!Object.keys(updates).length) {
            return res.status(400).json({ success: false, message: 'No valid flags provided' });
        }
        updates.lastUpdatedBy = req.user.id || req.user._id;

        const course = await Course.findOneAndUpdate(
            { slug: req.params.slug },
            { $set: updates },
            { new: true, runValidators: true }
        );
        if (!course) return notFound(res);

        invalidateCourseCache();
        res.json({ success: true, flags: updates });
    } catch (err) {
        console.error('[PATCH /courses/:slug/flags]', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ─── Curriculum / Weeks ───────────────────────────────────────────────────────

// POST /api/courses/:slug/weeks
router.post('/:slug/weeks', protect, adminOrInstructor, loadCourse, canManageCourse, async (req, res) => {
    try {
        const { weekNumber, title, description, isLocked, unlockAfterDays } = req.body;
        if (!weekNumber || !title) {
            return res.status(400).json({ success: false, message: 'weekNumber and title are required' });
        }
        const duplicate = req.course.curriculum.find(w => w.weekNumber === weekNumber);
        if (duplicate) {
            return res.status(409).json({ success: false, message: `Week ${weekNumber} already exists` });
        }

        req.course.curriculum.push({ weekNumber, title, description, isLocked, unlockAfterDays, concepts: [], quizzes: [], discussions: [], exams: [] });
        req.course.curriculum.sort((a, b) => a.weekNumber - b.weekNumber);
        req.course.lastUpdatedBy = req.user.id || req.user._id;
        await req.course.save();

        invalidateCourseCache();
        const week = req.course.curriculum.find(w => w.weekNumber === weekNumber);
        res.status(201).json({ success: true, week });
    } catch (err) {
        console.error('[POST /courses/:slug/weeks]', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// PUT /api/courses/:slug/weeks/:weekNumber
router.put('/:slug/weeks/:weekNumber', protect, adminOrInstructor, loadCourse, canManageCourse, async (req, res) => {
    try {
        const week = resolveWeek(req, res);
        if (!week) return;

        const { title, description, isLocked, unlockAfterDays } = req.body;
        if (title !== undefined)            week.title            = title;
        if (description !== undefined)      week.description      = description;
        if (isLocked !== undefined)         week.isLocked         = isLocked;
        if (unlockAfterDays !== undefined)  week.unlockAfterDays  = unlockAfterDays;

        req.course.lastUpdatedBy = req.user.id || req.user._id;
        await req.course.save();

        invalidateCourseCache();
        res.json({ success: true, week });
    } catch (err) {
        console.error('[PUT /courses/:slug/weeks/:weekNumber]', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// DELETE /api/courses/:slug/weeks/:weekNumber
router.delete('/:slug/weeks/:weekNumber', protect, adminOrInstructor, loadCourse, canManageCourse, async (req, res) => {
    try {
        const weekNumber = parseInt(req.params.weekNumber, 10);
        const idx = req.course.curriculum.findIndex(w => w.weekNumber === weekNumber);
        if (idx === -1) return notFound(res, 'Week');

        req.course.curriculum.splice(idx, 1);
        req.course.lastUpdatedBy = req.user.id || req.user._id;
        await req.course.save();

        invalidateCourseCache();
        res.json({ success: true, message: `Week ${weekNumber} removed` });
    } catch (err) {
        console.error('[DELETE /courses/:slug/weeks/:weekNumber]', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// PATCH /api/courses/:slug/weeks/reorder
router.patch('/:slug/weeks/reorder', protect, adminOrInstructor, loadCourse, canManageCourse, async (req, res) => {
    try {
        const { order } = req.body; // [{ weekNumber: 1, newWeekNumber: 2 }, ...]
        if (!Array.isArray(order)) {
            return res.status(400).json({ success: false, message: 'order must be an array' });
        }
        for (const { weekNumber, newWeekNumber } of order) {
            const week = req.course.curriculum.find(w => w.weekNumber === weekNumber);
            if (week) week.weekNumber = newWeekNumber;
        }
        req.course.curriculum.sort((a, b) => a.weekNumber - b.weekNumber);
        req.course.lastUpdatedBy = req.user.id || req.user._id;
        await req.course.save();

        invalidateCourseCache();
        res.json({ success: true, curriculum: req.course.curriculum.map(w => ({ weekNumber: w.weekNumber, title: w.title })) });
    } catch (err) {
        console.error('[PATCH /courses/:slug/weeks/reorder]', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ─── Week Content: Concepts ───────────────────────────────────────────────────

// POST /api/courses/:slug/weeks/:weekNumber/concepts
router.post('/:slug/weeks/:weekNumber/concepts', protect, adminOrInstructor, loadCourse, canManageCourse, async (req, res) => {
    try {
        const week = resolveWeek(req, res);
        if (!week) return;

        const { title, type, url, content, duration, isPreview, order, thumbnail, captions } = req.body;
        if (!title || !type) {
            return res.status(400).json({ success: false, message: 'title and type are required' });
        }
        week.concepts.push({ title, type, url, content, duration, isPreview, order, thumbnail, captions });
        req.course.lastUpdatedBy = req.user.id || req.user._id;
        await req.course.save();

        invalidateCourseCache();
        const concept = week.concepts[week.concepts.length - 1];
        res.status(201).json({ success: true, concept });
    } catch (err) {
        console.error('[POST /concepts]', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// PUT /api/courses/:slug/weeks/:weekNumber/concepts/:conceptId
router.put('/:slug/weeks/:weekNumber/concepts/:conceptId', protect, adminOrInstructor, loadCourse, canManageCourse, async (req, res) => {
    try {
        const week = resolveWeek(req, res);
        if (!week) return;

        const concept = week.concepts.id(req.params.conceptId);
        if (!concept) return notFound(res, 'Concept');

        const fields = ['title', 'type', 'url', 'content', 'duration', 'isPreview', 'order', 'thumbnail', 'captions'];
        fields.forEach(f => { if (req.body[f] !== undefined) concept[f] = req.body[f]; });

        req.course.lastUpdatedBy = req.user.id || req.user._id;
        await req.course.save();

        invalidateCourseCache();
        res.json({ success: true, concept });
    } catch (err) {
        console.error('[PUT /concepts/:conceptId]', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// DELETE /api/courses/:slug/weeks/:weekNumber/concepts/:conceptId
router.delete('/:slug/weeks/:weekNumber/concepts/:conceptId', protect, adminOrInstructor, loadCourse, canManageCourse, async (req, res) => {
    try {
        const week = resolveWeek(req, res);
        if (!week) return;

        const concept = week.concepts.id(req.params.conceptId);
        if (!concept) return notFound(res, 'Concept');

        concept.deleteOne();
        req.course.lastUpdatedBy = req.user.id || req.user._id;
        await req.course.save();

        invalidateCourseCache();
        res.json({ success: true, message: 'Concept removed' });
    } catch (err) {
        console.error('[DELETE /concepts/:conceptId]', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ─── Week Content: Quizzes ────────────────────────────────────────────────────

// POST /api/courses/:slug/weeks/:weekNumber/quizzes
router.post('/:slug/weeks/:weekNumber/quizzes', protect, adminOrInstructor, loadCourse, canManageCourse, async (req, res) => {
    try {
        const week = resolveWeek(req, res);
        if (!week) return;

        const { title, description, timeLimit, passingScore, attemptsAllowed, shuffleQuestions, showResults, questions } = req.body;
        if (!title) return res.status(400).json({ success: false, message: 'title is required' });

        week.quizzes.push({ title, description, timeLimit, passingScore, attemptsAllowed, shuffleQuestions, showResults, questions: questions || [] });
        req.course.lastUpdatedBy = req.user.id || req.user._id;
        await req.course.save();

        invalidateCourseCache();
        res.status(201).json({ success: true, quiz: week.quizzes[week.quizzes.length - 1] });
    } catch (err) {
        console.error('[POST /quizzes]', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// PUT /api/courses/:slug/weeks/:weekNumber/quizzes/:quizId
router.put('/:slug/weeks/:weekNumber/quizzes/:quizId', protect, adminOrInstructor, loadCourse, canManageCourse, async (req, res) => {
    try {
        const week = resolveWeek(req, res);
        if (!week) return;

        const quiz = week.quizzes.id(req.params.quizId);
        if (!quiz) return notFound(res, 'Quiz');

        const fields = ['title', 'description', 'timeLimit', 'passingScore', 'attemptsAllowed', 'shuffleQuestions', 'showResults', 'questions', 'isPublished'];
        fields.forEach(f => { if (req.body[f] !== undefined) quiz[f] = req.body[f]; });

        req.course.lastUpdatedBy = req.user.id || req.user._id;
        await req.course.save();

        invalidateCourseCache();
        res.json({ success: true, quiz });
    } catch (err) {
        console.error('[PUT /quizzes/:quizId]', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// DELETE /api/courses/:slug/weeks/:weekNumber/quizzes/:quizId
router.delete('/:slug/weeks/:weekNumber/quizzes/:quizId', protect, adminOrInstructor, loadCourse, canManageCourse, async (req, res) => {
    try {
        const week = resolveWeek(req, res);
        if (!week) return;

        const quiz = week.quizzes.id(req.params.quizId);
        if (!quiz) return notFound(res, 'Quiz');

        quiz.deleteOne();
        req.course.lastUpdatedBy = req.user.id || req.user._id;
        await req.course.save();

        invalidateCourseCache();
        res.json({ success: true, message: 'Quiz removed' });
    } catch (err) {
        console.error('[DELETE /quizzes/:quizId]', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ─── Week Content: Discussions ────────────────────────────────────────────────

// POST /api/courses/:slug/weeks/:weekNumber/discussions
router.post('/:slug/weeks/:weekNumber/discussions', protect, adminOrInstructor, loadCourse, canManageCourse, async (req, res) => {
    try {
        const week = resolveWeek(req, res);
        if (!week) return;

        const { title, prompt, isGraded, maxScore, dueDate } = req.body;
        if (!title) return res.status(400).json({ success: false, message: 'title is required' });

        week.discussions.push({ title, prompt, isGraded, maxScore, dueDate });
        req.course.lastUpdatedBy = req.user.id || req.user._id;
        await req.course.save();

        invalidateCourseCache();
        res.status(201).json({ success: true, discussion: week.discussions[week.discussions.length - 1] });
    } catch (err) {
        console.error('[POST /discussions]', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// PUT /api/courses/:slug/weeks/:weekNumber/discussions/:discussionId
router.put('/:slug/weeks/:weekNumber/discussions/:discussionId', protect, adminOrInstructor, loadCourse, canManageCourse, async (req, res) => {
    try {
        const week = resolveWeek(req, res);
        if (!week) return;

        const discussion = week.discussions.id(req.params.discussionId);
        if (!discussion) return notFound(res, 'Discussion');

        ['title', 'prompt', 'isGraded', 'maxScore', 'dueDate', 'isOpen'].forEach(f => {
            if (req.body[f] !== undefined) discussion[f] = req.body[f];
        });

        req.course.lastUpdatedBy = req.user.id || req.user._id;
        await req.course.save();

        invalidateCourseCache();
        res.json({ success: true, discussion });
    } catch (err) {
        console.error('[PUT /discussions/:discussionId]', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// DELETE /api/courses/:slug/weeks/:weekNumber/discussions/:discussionId
router.delete('/:slug/weeks/:weekNumber/discussions/:discussionId', protect, adminOrInstructor, loadCourse, canManageCourse, async (req, res) => {
    try {
        const week = resolveWeek(req, res);
        if (!week) return;

        const discussion = week.discussions.id(req.params.discussionId);
        if (!discussion) return notFound(res, 'Discussion');

        discussion.deleteOne();
        req.course.lastUpdatedBy = req.user.id || req.user._id;
        await req.course.save();

        invalidateCourseCache();
        res.json({ success: true, message: 'Discussion removed' });
    } catch (err) {
        console.error('[DELETE /discussions/:discussionId]', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ─── Week Content: Exams ──────────────────────────────────────────────────────

// POST /api/courses/:slug/weeks/:weekNumber/exams
router.post('/:slug/weeks/:weekNumber/exams', protect, adminOrInstructor, loadCourse, canManageCourse, async (req, res) => {
    try {
        const week = resolveWeek(req, res);
        if (!week) return;

        const { title, description, instructions, scheduledAt, duration, totalMarks, passingMarks, attemptsAllowed, isProctored, questions } = req.body;
        if (!title) return res.status(400).json({ success: false, message: 'title is required' });

        week.exams.push({ title, description, instructions, scheduledAt, duration, totalMarks, passingMarks, attemptsAllowed, isProctored, questions: questions || [] });
        req.course.lastUpdatedBy = req.user.id || req.user._id;
        await req.course.save();

        invalidateCourseCache();
        res.status(201).json({ success: true, exam: week.exams[week.exams.length - 1] });
    } catch (err) {
        console.error('[POST /exams]', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// PUT /api/courses/:slug/weeks/:weekNumber/exams/:examId
router.put('/:slug/weeks/:weekNumber/exams/:examId', protect, adminOrInstructor, loadCourse, canManageCourse, async (req, res) => {
    try {
        const week = resolveWeek(req, res);
        if (!week) return;

        const exam = week.exams.id(req.params.examId);
        if (!exam) return notFound(res, 'Exam');

        const fields = ['title', 'description', 'instructions', 'scheduledAt', 'duration', 'totalMarks', 'passingMarks', 'attemptsAllowed', 'isProctored', 'questions', 'isPublished'];
        fields.forEach(f => { if (req.body[f] !== undefined) exam[f] = req.body[f]; });

        req.course.lastUpdatedBy = req.user.id || req.user._id;
        await req.course.save();

        invalidateCourseCache();
        res.json({ success: true, exam });
    } catch (err) {
        console.error('[PUT /exams/:examId]', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// DELETE /api/courses/:slug/weeks/:weekNumber/exams/:examId
router.delete('/:slug/weeks/:weekNumber/exams/:examId', protect, adminOrInstructor, loadCourse, canManageCourse, async (req, res) => {
    try {
        const week = resolveWeek(req, res);
        if (!week) return;

        const exam = week.exams.id(req.params.examId);
        if (!exam) return notFound(res, 'Exam');

        exam.deleteOne();
        req.course.lastUpdatedBy = req.user.id || req.user._id;
        await req.course.save();

        invalidateCourseCache();
        res.json({ success: true, message: 'Exam removed' });
    } catch (err) {
        console.error('[DELETE /exams/:examId]', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ─── Live Sessions ────────────────────────────────────────────────────────────

// POST /api/courses/:slug/sessions
router.post('/:slug/sessions', protect, adminOrInstructor, loadCourse, canManageCourse, async (req, res) => {
    try {
        if (req.course.courseType !== 'live') {
            return res.status(400).json({ success: false, message: 'Sessions only apply to live courses' });
        }
        const { title, scheduledAt, duration, meetingUrl, recordingUrl, description, materials } = req.body;
        if (!title || !scheduledAt) {
            return res.status(400).json({ success: false, message: 'title and scheduledAt are required' });
        }

        if (!req.course.liveDetails) req.course.liveDetails = {};
        if (!req.course.liveDetails.sessions) req.course.liveDetails.sessions = [];
        req.course.liveDetails.sessions.push({ title, scheduledAt, duration, meetingUrl, recordingUrl, description, materials });
        req.course.lastUpdatedBy = req.user.id || req.user._id;
        await req.course.save();

        invalidateCourseCache();
        const sessions = req.course.liveDetails.sessions;
        res.status(201).json({ success: true, session: sessions[sessions.length - 1] });
    } catch (err) {
        console.error('[POST /sessions]', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// PUT /api/courses/:slug/sessions/:sessionId
router.put('/:slug/sessions/:sessionId', protect, adminOrInstructor, loadCourse, canManageCourse, async (req, res) => {
    try {
        const session = req.course.liveDetails?.sessions?.id(req.params.sessionId);
        if (!session) return notFound(res, 'Session');

        ['title', 'scheduledAt', 'duration', 'meetingUrl', 'recordingUrl', 'description', 'materials', 'isCompleted'].forEach(f => {
            if (req.body[f] !== undefined) session[f] = req.body[f];
        });

        req.course.lastUpdatedBy = req.user.id || req.user._id;
        await req.course.save();

        invalidateCourseCache();
        res.json({ success: true, session });
    } catch (err) {
        console.error('[PUT /sessions/:sessionId]', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// PATCH /api/courses/:slug/sessions/:sessionId/complete
router.patch('/:slug/sessions/:sessionId/complete', protect, adminOrInstructor, loadCourse, canManageCourse, async (req, res) => {
    try {
        const session = req.course.liveDetails?.sessions?.id(req.params.sessionId);
        if (!session) return notFound(res, 'Session');

        session.isCompleted  = true;
        if (req.body.recordingUrl) session.recordingUrl = req.body.recordingUrl;
        req.course.lastUpdatedBy = req.user.id || req.user._id;
        await req.course.save();

        invalidateCourseCache();
        res.json({ success: true, session });
    } catch (err) {
        console.error('[PATCH /sessions/:sessionId/complete]', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// DELETE /api/courses/:slug/sessions/:sessionId
router.delete('/:slug/sessions/:sessionId', protect, adminOrInstructor, loadCourse, canManageCourse, async (req, res) => {
    try {
        const session = req.course.liveDetails?.sessions?.id(req.params.sessionId);
        if (!session) return notFound(res, 'Session');

        session.deleteOne();
        req.course.lastUpdatedBy = req.user.id || req.user._id;
        await req.course.save();

        invalidateCourseCache();
        res.json({ success: true, message: 'Session removed' });
    } catch (err) {
        console.error('[DELETE /sessions/:sessionId]', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ─── Attachments ──────────────────────────────────────────────────────────────

// POST /api/courses/:slug/attachments
router.post('/:slug/attachments', protect, adminOrInstructor, loadCourse, canManageCourse, async (req, res) => {
    try {
        const { name, url, fileType, size } = req.body;
        if (!name || !url) {
            return res.status(400).json({ success: false, message: 'name and url are required' });
        }

        req.course.attachments.push({ name, url, fileType, size });
        req.course.lastUpdatedBy = req.user.id || req.user._id;
        await req.course.save();

        invalidateCourseCache();
        const attachment = req.course.attachments[req.course.attachments.length - 1];
        res.status(201).json({ success: true, attachment });
    } catch (err) {
        console.error('[POST /attachments]', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// DELETE /api/courses/:slug/attachments/:attachmentId
router.delete('/:slug/attachments/:attachmentId', protect, adminOrInstructor, loadCourse, canManageCourse, async (req, res) => {
    try {
        const attachment = req.course.attachments.id(req.params.attachmentId);
        if (!attachment) return notFound(res, 'Attachment');

        attachment.deleteOne();
        req.course.lastUpdatedBy = req.user.id || req.user._id;
        await req.course.save();

        invalidateCourseCache();
        res.json({ success: true, message: 'Attachment removed' });
    } catch (err) {
        console.error('[DELETE /attachments/:attachmentId]', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
