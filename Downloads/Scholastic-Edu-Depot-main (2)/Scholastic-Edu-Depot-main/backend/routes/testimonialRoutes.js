const express = require('express');
const router = express.Router();

// Mock data for testimonials - in production this would come from a database
const mockTestimonials = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Full Stack Developer',
    quote: 'The SED platform transformed my career. The comprehensive curriculum and hands-on projects gave me the confidence to switch careers and land my dream job.',
    rating: 5,
    image: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=EBF4FF&color=2563EB&bold=true'
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Data Scientist',
    quote: 'I was skeptical about online courses, but SED exceeded all my expectations. The instructors are industry experts who genuinely care about student success.',
    rating: 5,
    image: 'https://ui-avatars.com/api/?name=Michael+Chen&background=EBF4FF&color=2563EB&bold=true'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'UX Designer',
    quote: 'The flexibility of learning at my own pace while having access to mentorship was perfect for me. I now work at a leading tech company thanks to SED.',
    rating: 5,
    image: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&background=EBF4FF&color=2563EB&bold=true'
  }
];

// @desc    Fetch all testimonials
// @route   GET /api/testimonials
// @access  Public
router.get('/', (req, res) => {
  try {
    res.json(mockTestimonials);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
