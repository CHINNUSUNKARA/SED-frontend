

import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, BookOpen, Star, ChevronLeft, ChevronRight, ArrowUpDown, Quote, MessageSquare } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { CourseDetailModal } from './CourseDetailModal';
import { ViewState } from '../../App';

// Types
interface Course {
  id: number;
  title: string;
  description: string;
  price: string;
  image: string;
  level: string;
  rating: number;
  students: number;
  duration: string;
  lessons: number;
  instructor: string;
  category: string;
  icon: any; // Required icon property to match CourseDetailModal
}

interface Review {
  id: string;
  courseTitle: string;
  rating: number;
  comment: string;
  date: string;
  studentName: string;
}

interface TestimonialData {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  image: string;
}

import { fetchCourses, CourseSummary } from '../../services/courseService';
import { fetchCourseReviews, fetchTestimonials, CourseReview, Testimonial } from '../../services/reviewService';
import { realtimeService } from '../../services/realtimeService';
import { Course as FullCourse } from '../../constants';

// Loading and data states
const COURSE_CATEGORIES = ['All']; // Will expand after fetching

interface CoursesPageProps {
  onNavigate: (view: ViewState) => void;
  onViewInstructor?: (name: string) => void;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({ onNavigate, onViewInstructor }) => {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc'>('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState<CourseSummary | null>(null);
  const [courseReviews, setCourseReviews] = useState<CourseReview[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  const itemsPerPage = 6;

  /**
   * Convert CourseSummary into FullCourse format for the CourseDetailModal
   */
  const mapSummaryToCourse = (summary: CourseSummary): FullCourse => ({
    id: summary.id,
    title: summary.title,
    instructor: summary.instructor ?? 'SED Instructor',
    level: (summary.level ?? 'Beginner') as 'Beginner' | 'Intermediate' | 'Advanced',
    duration: summary.duration ?? '-',
    students: summary.students ?? 0,
    rating: summary.rating ?? 0,
    image: summary.image,
    description: summary.description ?? '',
    whatYouWillLearn: summary.whatYouWillLearn ?? [],
    requirements: summary.requirements ?? [],
    category: summary.category ?? 'General',
    price: parseInt(summary.price.replace(/[^0-9]/g, '')) || 0,
    lessons: summary.lessons ?? 0,
  });

  // Fetch courses once
  useEffect(() => {
    const fetchCoursesData = async () => {
      try {
        const data = await fetchCourses();
        setCourses(data);
        // derive categories
        const cats = Array.from(new Set(data.map(c => c.category).filter((c): c is string => !!c)));
        COURSE_CATEGORIES.splice(1, COURSE_CATEGORIES.length - 1, ...cats);
      } catch (e: any) {
        setError('Failed to load courses');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviewsAndTestimonials = async () => {
      try {
        const [reviewsData, testimonialsData] = await Promise.all([
          fetchCourseReviews(6),
          fetchTestimonials()
        ]);
        setCourseReviews(reviewsData);
        setTestimonials(testimonialsData);
      } catch (error) {
        console.error('Failed to fetch reviews and testimonials:', error);
      }
    };

    fetchCoursesData();
    fetchReviewsAndTestimonials();

    // Set up periodic refresh to get latest data from admin changes
    const interval = setInterval(fetchCoursesData, 30000); // Refresh every 30 seconds

    // Set up real-time listeners for immediate updates
    const unsubscribeCourseCreated = realtimeService.subscribe('course-created', () => {
      fetchCoursesData();
    });

    const unsubscribeCourseUpdated = realtimeService.subscribe('course-updated', () => {
      fetchCoursesData();
    });

    const unsubscribeCourseDeleted = realtimeService.subscribe('course-deleted', () => {
      fetchCoursesData();
    });

    return () => {
      clearInterval(interval);
      unsubscribeCourseCreated();
      unsubscribeCourseUpdated();
      unsubscribeCourseDeleted();
    };
  }, []);

  // Reset page when filters/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory, sortOrder]);

  // Filter Logic
  const filteredCourses = courses.filter(course => {
    const matchesCategory = activeCategory === 'All' || course.category === activeCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort Logic
  const sortedCourses = [...filteredCourses].sort((a: any, b: any) => {
    if (sortOrder === 'default') return 0;

    // Remove non-numeric characters to parse price (e.g. "$599" -> 599)
    const priceA = parseInt(a.price.replace(/[^0-9]/g, ''));
    const priceB = parseInt(b.price.replace(/[^0-9]/g, ''));

    return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
  });

  // Pagination Logic (using sortedCourses)
  const totalPages = Math.ceil(sortedCourses.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCourses = sortedCourses.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return <div className="pt-24 text-center">Loading courses...</div>;
  }
  if (error) {
    return <div className="pt-24 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="pt-24 min-h-screen bg-slate-50 flex flex-col">
      {/* Modal Integration */}
      {selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onEnroll={() => onNavigate('get-started')}
          onViewInstructor={onViewInstructor}
        />
      )}

      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
            All Courses
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Browse our comprehensive catalog of technology courses designed to take you from beginner to professional.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow pb-8 w-full">
        {/* Toolbar */}
        <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center mb-8 bg-white p-5 rounded-xl shadow-sm border border-slate-100">

          {/* Search */}
          <div className="relative w-full xl:max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-all"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto items-start md:items-center justify-between">
            {/* Filter Tags */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-slate-500 flex items-center mr-1">
                <Filter size={16} className="mr-1" /> Category:
              </span>
              {COURSE_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${activeCategory === category
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center min-w-[180px] md:ml-4">
              <div className="relative w-full">
                <select
                  value={sortOrder}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortOrder(e.target.value as 'default' | 'asc' | 'desc')}
                  className="appearance-none block w-full pl-3 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white text-slate-700 cursor-pointer"
                  aria-label="Sort courses by price"
                >
                  <option value="default">Recommended</option>
                  <option value="asc">Price: Low to High</option>
                  <option value="desc">Price: High to Low</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <ArrowUpDown size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-slate-500 text-sm font-medium">
          Showing {filteredCourses.length} results
        </div>

        {/* Course Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {currentCourses.map((course) => (
              <div
                key={course.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col cursor-pointer"
                onClick={() => setSelectedCourse(course)}
              >
                {/* Image Area */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-brand-700 text-xs font-bold rounded-full uppercase tracking-wide shadow-sm">
                      {course.level}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                </div>

                {/* Content */}
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex items-center gap-2 text-yellow-500 text-sm font-semibold mb-2">
                    <Star className="fill-current" size={16} />
                    <span>{course.rating}</span>
                    <span className="text-slate-400 font-normal">({(course.students ?? 0).toLocaleString()} students)</span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="text-slate-600 text-sm mb-6 line-clamp-2 flex-grow">
                    {course.description}
                  </p>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock size={16} className="text-brand-500" />
                      <span>{course.duration ?? '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <BookOpen size={16} className="text-brand-500" />
                      <span>{course.lessons ?? 0} Lessons</span>
                    </div>
                  </div>

                  {/* Instructor Section */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor ?? '')}&background=EBF4FF&color=2563EB&bold=true`}
                      alt={course.instructor ?? 'Instructor'}
                      className="w-10 h-10 rounded-full border-2 border-white shadow-md ring-2 ring-slate-50"
                    />
                    <div className="flex-grow">
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Instructor</p>
                      <p className="text-sm font-semibold text-slate-900 line-clamp-1">{course.instructor}</p>
                    </div>
                    <button
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors whitespace-nowrap"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewInstructor && course.instructor) onViewInstructor(course.instructor);
                      }}
                    >
                      View Profile
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-medium">Course Fee</p>
                      <p className="text-xl font-bold text-slate-900">{course.price}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600 transition-all"
                      onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                        e.stopPropagation(); // Prevent double trigger since card has onClick
                        setSelectedCourse(course);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-slate-400 mb-4">
              <Search size={48} className="mx-auto opacity-20" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No courses found</h3>
            <p className="text-slate-500">Try adjusting your search or filters.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => { setSearchQuery(''); setActiveCategory('All'); setSortOrder('default'); }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {filteredCourses.length > itemsPerPage && (
          <div className="flex justify-center items-center gap-2 mb-16">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft size={20} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === page
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                aria-label={`Go to page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Latest Course Reviews Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-brand-100 p-2 rounded-lg text-brand-600">
              <MessageSquare size={20} />
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-900">Latest Course Reviews</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courseReviews.length > 0 ? courseReviews.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-brand-600 mb-1 line-clamp-1">{review.courseTitle}</h4>
                    <div className="flex text-yellow-400 gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < review.rating ? "fill-current" : "text-slate-200"} />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">{review.date}</span>
                </div>

                <p className="text-slate-600 text-sm italic mb-4 line-clamp-3">"{review.comment}"</p>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                    {review.studentName.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-slate-900">{review.studentName}</span>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-8">
                <p className="text-slate-500">No reviews available yet. Be the first to review a course!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* General Testimonials Section */}
      <section className="bg-white py-20 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">
              What Our Students Say
            </h2>
            <p className="text-lg text-slate-600">
              Don't just take our word for it. Hear from the students who have transformed their careers with SED.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.length > 0 ? testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 relative group hover:shadow-lg transition-all duration-300">
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 text-brand-100 group-hover:text-brand-200 transition-colors">
                  <Quote size={48} className="fill-current" />
                </div>

                <div className="flex gap-1 text-yellow-400 mb-6 relative z-10">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < testimonial.rating ? "fill-current" : "text-slate-300"}
                    />
                  ))}
                </div>

                <p className="text-slate-700 italic mb-8 leading-relaxed relative z-10">
                  "{testimonial.quote}"
                </p>

                <div className="flex items-center gap-4 relative z-10">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div>
                    <p className="font-bold text-slate-900">{testimonial.name}</p>
                    <p className="text-xs font-medium text-brand-600 uppercase tracking-wide">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-12">
                <p className="text-slate-500">No testimonials available yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
