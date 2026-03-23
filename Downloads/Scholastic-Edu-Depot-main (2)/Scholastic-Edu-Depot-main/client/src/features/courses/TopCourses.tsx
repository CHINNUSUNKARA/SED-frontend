

import React, { useState, useEffect } from 'react';
import { Clock, BookOpen, Star, Users, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ViewState } from '../../App';
import { CourseDetailModal } from './CourseDetailModal';
import { fetchCourses, CourseSummary } from '../../services/courseService';

interface TopCoursesProps {
  onNavigate: (view: ViewState) => void;
  onViewInstructor?: (name: string) => void;
}

// Define COURSE_CATEGORIES constant
const COURSE_CATEGORIES = ['All', 'Development', 'Design', 'Business', 'Marketing'];

export const TopCourses: React.FC<TopCoursesProps> = ({ onNavigate, onViewInstructor }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState<CourseSummary | null>(null);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses from database on component mount
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCourses();
        setCourses(data);
      } catch (err) {
        console.error('Failed to load courses:', err);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  // Filter courses based on active category
  const filteredCourses = activeCategory === 'All'
    ? courses.slice(0, 3)
    : courses.filter(course => course.category === activeCategory).slice(0, 3);

  return (
    <section id="courses" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Modal Integration */}
        {selectedCourse && (
          <CourseDetailModal
            course={selectedCourse}
            onClose={() => setSelectedCourse(null)}
            onEnroll={() => onNavigate('get-started')}
            onViewInstructor={onViewInstructor}
          />
        )}

        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
              Explore Our Premium Courses
            </h2>
            <p className="text-lg text-slate-600">
              Industry-designed curriculum to help you master the skills that matter most.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="inline-flex p-1 bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
              {COURSE_CATEGORIES.slice(0, 5).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap ${activeCategory === category
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-brand-600 animate-spin mb-4" />
            <p className="text-slate-600 text-lg">Loading courses...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <p className="text-red-600 font-medium mb-2">⚠️ {error}</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Course Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col cursor-pointer"
                onClick={() => setSelectedCourse(course)}
              >
                {/* Image Area */}
                <div className="relative h-56 overflow-hidden">
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
                    <span className="text-slate-400 font-normal">({course.students?.toLocaleString() || 0} students)</span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="text-slate-600 text-sm mb-6 line-clamp-2 flex-grow">
                    {course.description}
                  </p>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock size={16} className="text-brand-500" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <BookOpen size={16} className="text-brand-500" />
                      <span>{course.lessons} Lessons</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-medium">Course Fee</p>
                      <p className="text-xl font-bold text-slate-900">{course.price}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600 transition-all"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        if (onViewInstructor && course.instructor) onViewInstructor(course.instructor);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Action */}
        <div className="mt-16 text-center">
          <Button
            variant="secondary"
            size="lg"
            className="shadow-lg shadow-brand-500/20"
            onClick={() => onNavigate('courses')}
          >
            View Full Catalog
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};