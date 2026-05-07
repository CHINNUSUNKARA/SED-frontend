import { AxiosResponse } from 'axios';
import api, { get, prefetch } from '../lib/api';

// ─── Sub-types ────────────────────────────────────────────────────────────────

export interface InstructorInfo {
  userId?: string;
  name?: string;
  title?: string;
  imageUrl?: string;
  bio?: string;
  email?: string;
  website?: string;
  socialLinks?: { linkedin?: string; twitter?: string; github?: string; youtube?: string };
  rating?: number;
  totalStudents?: number;
  totalCourses?: number;
}

export interface CoursePricing {
  amount: number;
  currency: string;
  discountedAmount?: number;
  discountEndsAt?: string;
  note?: string;
  inclusions?: string[];
  isFree?: boolean;
}

export interface CourseStats {
  enrolledCount: number;
  completedCount: number;
  averageRating: number;
  totalRatings: number;
  totalReviews: number;
}

export interface LiveDetails {
  startDate?: string;
  endDate?: string;
  timezone?: string;
  maxStudents?: number;
  enrollmentDeadline?: string;
  batchName?: string;
  meetingPlatform?: 'zoom' | 'google_meet' | 'microsoft_teams' | 'custom';
  sessions?: LiveSession[];
}

export interface LiveSession {
  _id: string;
  title: string;
  scheduledAt: string;
  duration?: number;
  meetingUrl?: string;
  recordingUrl?: string;
  description?: string;
  isCompleted: boolean;
  materials?: { name: string; url: string }[];
}

export interface CertificationInfo {
  available: boolean;
  title?: string;
  description?: string;
  criteria?: string;
  validityMonths?: number;
  templateUrl?: string;
  issuedBy?: string;
}

export interface ContentItem {
  _id: string;
  title: string;
  type: 'video' | 'audio' | 'pdf' | 'text' | 'markdown' | 'slides' | 'link' | 'embed' | 'image' | 'notebook';
  url?: string;
  content?: string;
  duration?: number;
  isPreview: boolean;
  order: number;
  thumbnail?: string;
  captions?: { language: string; url: string }[];
}

export interface QuizQuestion {
  _id: string;
  question: string;
  type: 'mcq' | 'msq' | 'true_false' | 'short_answer';
  options: { text: string; isCorrect: boolean }[];
  explanation?: string;
  points: number;
}

export interface WeekQuiz {
  _id: string;
  title: string;
  description?: string;
  timeLimit?: number;
  passingScore: number;
  attemptsAllowed: number;
  shuffleQuestions: boolean;
  showResults: boolean;
  questions: QuizQuestion[];
  isPublished: boolean;
}

export interface WeekExam {
  _id: string;
  title: string;
  description?: string;
  instructions?: string;
  scheduledAt?: string;
  duration?: number;
  totalMarks?: number;
  passingMarks?: number;
  attemptsAllowed: number;
  isProctored: boolean;
  isPublished: boolean;
}

export interface WeekDiscussion {
  _id: string;
  title: string;
  prompt?: string;
  isGraded: boolean;
  maxScore?: number;
  dueDate?: string;
  isOpen: boolean;
}

export interface CurriculumWeek {
  _id: string;
  weekNumber: number;
  title: string;
  description?: string;
  isLocked: boolean;
  unlockAfterDays?: number;
  concepts: ContentItem[];
  assignments: { _id: string; title: string; deadline?: string; maxScore?: number }[];
  quizzes: WeekQuiz[];
  discussions: WeekDiscussion[];
  exams: WeekExam[];
}

export interface CourseProject {
  title: string;
  description?: string;
  imageUrl?: string;
  demoUrl?: string;
  techStack?: string[];
}

export interface CourseFAQ {
  question: string;
  answer?: string;
  order?: number;
}

export interface CourseAttachment {
  _id: string;
  name: string;
  url: string;
  fileType: string;
  size?: number;
  uploadedAt?: string;
}

// ─── Main Interfaces ──────────────────────────────────────────────────────────

export interface CourseSummary {
  _id: string;
  id: string;
  name: string;
  title: string;
  slug: string;
  courseType: 'live' | 'self-paced';
  tagline?: string;
  shortDescription?: string;
  description?: string;
  image: string;
  imageUrl?: string;
  bannerUrl?: string;
  promoVideoUrl?: string;
  /** Display-ready price string e.g. "₹12,999" or "Free" */
  price: string;
  pricing?: CoursePricing;
  category?: string;
  subCategory?: string;
  tags?: string[];
  level?: string;
  language?: string;
  duration?: string;
  totalHours?: number;
  /** Display-ready instructor name */
  instructor?: string;
  instructorObj?: InstructorInfo;
  coInstructors?: InstructorInfo[];
  rating?: number;
  students?: number;
  lessons?: number;
  whatYouWillLearn?: string[];
  requirements?: string[];
  highlights?: string[];
  points?: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
  isArchived?: boolean;
  isDraft?: boolean;
  allowFreePreview?: boolean;
  requiresEnrollment?: boolean;
  certificationAvailable?: boolean;
  certification?: CertificationInfo;
  stats?: CourseStats;
  liveDetails?: LiveDetails;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseDetail extends CourseSummary {
  learningObjectives?: string[];
  prerequisites?: string[];
  targetAudience?: string[];
  tools?: string[];
  curriculum?: CurriculumWeek[];
  projects?: CourseProject[];
  faqs?: CourseFAQ[];
  deadlines?: { date: string; task: string }[];
  attachments?: CourseAttachment[];
}

export interface CourseListResponse {
  success?: boolean;
  courses: any[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface EnrollmentOrder {
  orderId: string;
  currency: string;
  amount: number;
  keyId: string;
}

export interface PaymentVerificationPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  courseSlug: string;
  amount: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns a display-ready price string, accounting for discounts and free courses. */
export const formatCoursePrice = (pricing?: CoursePricing): string => {
  if (!pricing || pricing.isFree || (!pricing.amount && !pricing.discountedAmount)) return 'Free';
  const effective = pricing.discountedAmount ?? pricing.amount;
  return `₹${effective.toLocaleString('en-IN')}`;
};

/** Returns the original (pre-discount) price string, or null if no discount applies. */
export const formatOriginalPrice = (pricing?: CoursePricing): string | null => {
  if (!pricing?.discountedAmount || !pricing?.amount) return null;
  return `₹${pricing.amount.toLocaleString('en-IN')}`;
};

/** Capitalises a level string for display. */
export const formatLevel = (level?: string): string => {
  if (!level || level === 'all') return 'All Levels';
  return level.charAt(0).toUpperCase() + level.slice(1);
};

/** Extracts total concept count across all curriculum weeks. */
export const countLessons = (curriculum?: CurriculumWeek[]): number =>
  curriculum?.reduce((acc, w) => acc + (w.concepts?.length ?? 0), 0) ?? 0;

// ─── Transform ────────────────────────────────────────────────────────────────

const transformCourse = (doc: any): CourseSummary => {
  const pricing: CoursePricing | undefined = doc.pricing;
  const stats: CourseStats | undefined = doc.stats;

  return {
    _id: doc._id,
    id: doc.slug || doc._id,
    name: doc.name || doc.title || '',
    title: doc.name || doc.title || '',
    slug: doc.slug || '',
    courseType: doc.courseType || 'self-paced',
    tagline: doc.tagline,
    shortDescription: doc.shortDescription,
    description: doc.description,
    image: doc.imageUrl || doc.image || '/placeholder.jpg',
    imageUrl: doc.imageUrl || doc.image,
    bannerUrl: doc.bannerUrl,
    promoVideoUrl: doc.promoVideoUrl,
    price: formatCoursePrice(pricing),
    pricing,
    category: doc.category,
    subCategory: doc.subCategory,
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    level: doc.level || 'all',
    language: doc.language || 'English',
    duration: doc.duration,
    totalHours: doc.totalHours,
    instructor: doc.instructor?.name || (typeof doc.instructor === 'string' ? doc.instructor : undefined) || 'SED Instructor',
    instructorObj: typeof doc.instructor === 'object' && doc.instructor !== null ? doc.instructor : undefined,
    coInstructors: Array.isArray(doc.coInstructors) ? doc.coInstructors : [],
    rating: stats?.averageRating ?? doc.rating ?? 0,
    students: stats?.enrolledCount ?? doc.students ?? 0,
    lessons:
      doc.lessons ??
      countLessons(doc.curriculum) ??
      doc.curriculum?.reduce((acc: number, w: any) => acc + (w.topics?.length ?? 0), 0) ??
      0,
    whatYouWillLearn: doc.learningObjectives || doc.whatYouWillLearn || [],
    requirements: doc.prerequisites || doc.requirements || [],
    highlights: doc.highlights || [],
    points: doc.points || [],
    isPublished: doc.isPublished,
    isFeatured: doc.isFeatured,
    isArchived: doc.isArchived,
    isDraft: doc.isDraft,
    allowFreePreview: doc.allowFreePreview,
    requiresEnrollment: doc.requiresEnrollment,
    certificationAvailable: doc.certification?.available ?? false,
    certification: doc.certification,
    stats,
    liveDetails: doc.liveDetails,
    publishedAt: doc.publishedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

const transformCourseDetail = (doc: any): CourseDetail => ({
  ...transformCourse(doc),
  learningObjectives: doc.learningObjectives || doc.whatYouWillLearn || [],
  prerequisites: doc.prerequisites || doc.requirements || [],
  targetAudience: doc.targetAudience || [],
  tools: doc.tools || [],
  curriculum: doc.curriculum || [],
  projects: doc.projects || [],
  faqs: doc.faqs || [],
  deadlines: doc.deadlines || [],
  attachments: doc.attachments || [],
});

// Safely extract the courses array from any response shape.
const extractCourses = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.courses)) return data.courses;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

// ─── API Functions ────────────────────────────────────────────────────────────

export interface FetchCoursesParams {
  page?: number;
  limit?: number;
  category?: string;
  courseType?: 'live' | 'self-paced';
  level?: string;
  language?: string;
  isFeatured?: boolean;
  search?: string;
}

export const fetchCourses = async (
  skipCache = false,
  params: FetchCoursesParams = {}
): Promise<CourseSummary[]> => {
  try {
    const res: AxiosResponse<CourseListResponse | any[]> = await get('/courses', {
      params: { page: 1, limit: 100, ...params },
      skipCache,
      timeout: 8000,
    });
    return extractCourses(res.data).map(transformCourse);
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

export const fetchCourseDetail = async (
  slug: string,
  skipCache = false
): Promise<CourseDetail> => {
  try {
    const res = await get(`/courses/${slug}`, { skipCache, timeout: 8000 });
    const raw = (res.data as any)?.course ?? res.data;
    return transformCourseDetail(raw);
  } catch (error) {
    console.error('Error fetching course detail:', error);
    throw error;
  }
};

export const prefetchCourseDetail = async (slug: string): Promise<void> => {
  try {
    await prefetch(`/courses/${slug}`);
  } catch {
    // Silently fail prefetch
  }
};

export const fetchCoursesByCategory = async (
  category: string,
  skipCache = false
): Promise<CourseSummary[]> => fetchCourses(skipCache, { category });

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

export const searchCourses = async (
  query: string,
  debounceMs = 300
): Promise<CourseSummary[]> => {
  return new Promise((resolve, reject) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      try {
        resolve(await fetchCourses(true, { search: query }));
      } catch (error) {
        reject(error);
      }
    }, debounceMs);
  });
};

// ─── Enrollment / Payment ─────────────────────────────────────────────────────

export const initiateEnrollment = async (
  courseSlug: string,
  amount: number
): Promise<EnrollmentOrder> => {
  const response = await api.post<EnrollmentOrder>(
    '/orders/create-order',
    { courseSlug, amount },
    { timeout: 10000 }
  );
  const d = response.data as any;
  return { orderId: d.id ?? d.orderId, currency: d.currency, amount: d.amount, keyId: d.key_id ?? d.keyId };
};

export const verifyEnrollmentPayment = async (
  payload: PaymentVerificationPayload
): Promise<{ message: string; orderId: string }> => {
  const response = await api.post('/orders/verify-payment', payload, { timeout: 15000 });
  return response.data;
};

export const enrollFree = async (
  courseSlug: string
): Promise<{ message: string; enrollmentId: string }> => {
  const response = await api.post('/orders/enroll-free', { courseSlug }, { timeout: 10000 });
  return response.data;
};

export const getEnrolledCourses = async (skipCache = false): Promise<CourseSummary[]> => {
  try {
    const res: AxiosResponse<any> = await get('/user/enrolled-courses', { skipCache, timeout: 8000 });
    return extractCourses(res.data).map(transformCourse);
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    throw error;
  }
};

export interface EnrollmentStatus {
  isEnrolled: boolean;
  courseSlug: string;
  enrollmentId?: string;
  status?: string;
  progress?: number;
  paymentStatus?: string;
  enrolledAt?: string;
}

export const checkEnrollment = async (courseSlug: string): Promise<EnrollmentStatus> => {
  const res = await get(`/user/enrollment/check/${encodeURIComponent(courseSlug)}`, {
    skipCache: true,
    timeout: 8000,
  });
  return res.data as EnrollmentStatus;
};
