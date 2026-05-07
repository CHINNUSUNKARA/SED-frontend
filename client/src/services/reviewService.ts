import api, { get, clearCache } from '../lib/api';

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

// Fetch course reviews with caching
export const fetchCourseReviews = async (limit = 10, skipCache = false): Promise<CourseReview[]> => {
  try {
    const response = await get(`/reviews`, {
      params: { limit },
      skipCache,
      timeout: 8000
    });
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

// Fetch testimonials with caching
export const fetchTestimonials = async (skipCache = false): Promise<Testimonial[]> => {
  try {
    const response = await get('/testimonials', {
      skipCache,
      timeout: 8000
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
};

// Submit a course review
export const submitCourseReview = async (reviewData: Omit<CourseReview, 'id' | 'date'>): Promise<CourseReview> => {
  try {
    const response = await api.post('/reviews', reviewData, { timeout: 10000 });
    
    // Clear reviews cache
    clearCache('reviews');
    
    return response.data;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
};

// Update a review
export const updateCourseReview = async (id: string, reviewData: Partial<CourseReview>): Promise<CourseReview> => {
  try {
    const response = await api.put(`/reviews/${id}`, reviewData, { timeout: 10000 });
    
    // Clear reviews cache
    clearCache('reviews');
    
    return response.data;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

// Delete a review
export const deleteCourseReview = async (id: string): Promise<void> => {
  try {
    await api.delete(`/reviews/${id}`, { timeout: 5000 });
    
    // Clear reviews cache
    clearCache('reviews');
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

// Get reviews for a specific course
export const getCourseReviews = async (courseId: string, skipCache = false): Promise<CourseReview[]> => {
  try {
    const response = await get(`/courses/${courseId}/reviews`, {
      skipCache,
      timeout: 8000
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching course reviews:', error);
    return [];
  }
};
