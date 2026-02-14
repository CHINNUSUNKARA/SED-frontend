import api from '../lib/api';

export interface CourseReview {
  id: string;
  courseTitle: string;
  courseId: string;
  rating: number;
  comment: string;
  date: string;
  studentName: string;
  studentEmail?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  image: string;
  courseName?: string;
}

// Fetch course reviews
export const fetchCourseReviews = async (limit = 10): Promise<CourseReview[]> => {
  try {
    const response = await api.get(`/reviews?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course reviews:', error);
    // Return fallback hardcoded reviews if API fails
    return [
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
      }
    ];
  }
};

// Fetch testimonials
export const fetchTestimonials = async (): Promise<Testimonial[]> => {
  try {
    const response = await api.get('/testimonials');
    return response.data;
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    // Return empty array if API fails - better than hardcoded data
    return [];
  }
};

// Submit a course review
export const submitCourseReview = async (reviewData: Omit<CourseReview, 'id' | 'date'>): Promise<CourseReview> => {
  try {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
};
