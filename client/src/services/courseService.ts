import { AxiosResponse } from 'axios';
import api from '../lib/api';

export interface CourseSummary {
  _id: string;
  id: string; // alias for UI
  title: string;
  description?: string;
  image: string;
  price: string; // formatted with currency symbol
  name: string;
  slug: string;
  category?: string;
  imageUrl?: string; // original field
  duration?: string;
  instructor?: string;
  rating?: number;
  students?: number;
  pricing?: { amount: number; currency: string };
  lessons?: number;
  level?: string;
  whatYouWillLearn?: string[];
  requirements?: string[];
}

export interface CourseDetail extends CourseSummary {
  tagline?: string;
  description?: string;
  points?: string[];
  highlights?: string[];
  learningObjectives?: string[];
  curriculum?: any[];
  projects?: any[];
  faqs?: any[];
}

export const fetchCourses = async (): Promise<CourseSummary[]> => {
  const res: AxiosResponse<any[]> = await api.get('/courses');
  const mapped: CourseSummary[] = res.data.map((doc) => {
    const amount = doc.pricing?.amount || 0;
    return {
      _id: doc._id,
      id: doc.slug || doc._id,
      title: doc.name,
      description: doc.description,
      image: doc.imageUrl || '/placeholder.jpg',
      price: amount ? `₹${amount.toLocaleString('en-IN')}` : 'Free',
      category: doc.category,
      duration: doc.duration,
      instructor: doc.instructor?.name || 'SED Instructor',
      rating: doc.rating || 0,
      students: doc.students || 0,
      lessons: doc.lessons || doc.curriculum?.reduce((acc: number, w: any) => acc + (w.topics?.length || 0), 0) || 0,
      level: doc.level || 'Beginner',
      imageUrl: doc.imageUrl,
      slug: doc.slug,
      pricing: doc.pricing,
    } as CourseSummary;
  });
  return mapped;
};

export const fetchCourseDetail = async (slug: string): Promise<CourseDetail> => {
  const res: AxiosResponse<CourseDetail> = await api.get(`/courses/${slug}`);
  return res.data;
};
