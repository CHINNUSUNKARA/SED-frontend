const express = require('express');
const router = express.Router();

// Mock data for reviews - in production this would come from a database
const mockReviews = [
  {
    id: '1',
    courseTitle: 'Full Stack Development',
    courseId: 'full-stack-dev',
    rating: 5,
    comment: 'Excellent course! The hands-on projects really helped me understand React and Node.js. Landed a job within 2 months of completion.',
    date: '2 days ago',
    studentName: 'Rajesh Kumar'
  },
  {
    id: '2',
    courseTitle: 'Data Science & AI',
    courseId: 'data-science-ai',
    rating: 5,
    comment: 'Best investment in my career. The instructors are industry experts and the curriculum is very practical and up-to-date.',
    date: '5 days ago',
    studentName: 'Priya Sharma'
  },
  {
    id: '3',
    courseTitle: 'Python Programming',
    courseId: 'python-prog',
    rating: 4,
    comment: 'Great course for beginners. Covered everything from basics to advanced concepts. Would recommend to anyone starting with Python.',
    date: '1 week ago',
    studentName: 'Amit Patel'
  }
];

// @desc    Fetch all course reviews
// @route   GET /api/reviews
// @access  Public
router.get('/', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || mockReviews.length;
    const reviews = mockReviews.slice(0, limit);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Submit a new course review
// @route   POST /api/reviews
// @access  Private (would need authentication)
router.post('/', (req, res) => {
  try {
    const newReview = {
      id: Date.now().toString(),
      date: 'Just now',
      ...req.body
    };
    mockReviews.unshift(newReview);
    res.status(201).json(newReview);
  } catch (error) {
    res.status(400).json({ message: 'Invalid review data', error: error.message });
  }
});

module.exports = router;
