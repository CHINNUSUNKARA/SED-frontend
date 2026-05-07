import React, { useState, useEffect } from 'react';
import { Clock, BookOpen, Star, Users, ArrowRight, Loader2, Award, Wifi, PlayCircle, Tag } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ViewState } from '../../App';
import { CourseDetailModal } from './CourseDetailModal';
import {
  fetchCourses, CourseSummary,
  formatCoursePrice, formatOriginalPrice, formatLevel,
} from '../../services/courseService';

interface TopCoursesProps {
  onNavigate: (view: ViewState) => void;
  onViewInstructor?: (name: string) => void;
}

export const TopCourses: React.FC<TopCoursesProps> = ({ onNavigate, onViewInstructor }) => {
  const [courses, setCourses]             = useState<CourseSummary[]>([]);
  const [categories, setCategories]       = useState<string[]>(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState<CourseSummary | null>(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCourses();
        // Only show published, non-archived courses
        const visible = data.filter(c => !c.isArchived);
        setCourses(visible);
        const cats = Array.from(new Set(visible.map(c => c.category).filter((c): c is string => !!c)));
        setCategories(['All', ...cats.slice(0, 4)]);
      } catch {
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Featured first, then by enrolledCount — show top 3
  const filtered = (activeCategory === 'All' ? courses : courses.filter(c => c.category === activeCategory))
    .sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return (b.stats?.enrolledCount ?? b.students ?? 0) - (a.stats?.enrolledCount ?? a.students ?? 0);
    })
    .slice(0, 3);

  return (
    <section id="courses" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {selectedCourse && (
          <CourseDetailModal
            course={selectedCourse}
            onClose={() => setSelectedCourse(null)}
            onEnroll={() => onNavigate('get-started')}
            onViewInstructor={onViewInstructor}
          />
        )}

        {/* Header + Category Filter */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-3">
              Explore Our Premium Courses
            </h2>
            <p className="text-lg text-slate-600">
              Industry-designed curriculum to help you master the skills that matter most.
            </p>
          </div>

          {!loading && categories.length > 1 && (
            <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto flex-shrink-0">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
            <p className="text-slate-500">Loading courses…</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <p className="text-red-600 font-medium mb-4">⚠ {error}</p>
            <Button type="button" variant="outline" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        )}

        {/* Cards */}
        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                <p>No courses available in this category yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map(course => {
                  const isLive        = course.courseType === 'live';
                  const certAvailable = course.certificationAvailable ?? false;
                  const price         = formatCoursePrice(course.pricing);
                  const origPrice     = formatOriginalPrice(course.pricing);
                  const rating        = course.stats?.averageRating ?? course.rating ?? 0;
                  const students      = course.stats?.enrolledCount ?? course.students ?? 0;
                  const instructorImg = course.instructorObj?.imageUrl
                    || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor ?? 'I')}&background=EBF4FF&color=2563EB&bold=true`;

                  return (
                    <div
                      key={course._id}
                      role="article"
                      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col cursor-pointer"
                      onClick={() => setSelectedCourse(course)}
                    >
                      {/* Image */}
                      <div className="relative h-52 overflow-hidden flex-shrink-0">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70 group-hover:opacity-50 transition-opacity" />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          {isLive ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-accent-500 text-white text-xs font-bold rounded-full uppercase">
                              <Wifi size={9} /> Live
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-brand-600/90 text-white text-xs font-bold rounded-full uppercase backdrop-blur-sm">
                              <PlayCircle size={9} /> Self-Paced
                            </span>
                          )}
                          {course.isFeatured && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full uppercase">
                              <Star size={9} className="fill-current" /> Featured
                            </span>
                          )}
                        </div>

                        {certAvailable && (
                          <div className="absolute bottom-3 right-3">
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                              <Award size={9} /> Certificate
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-grow flex flex-col">
                        {/* Rating */}
                        <div className="flex items-center gap-1.5 text-yellow-500 text-sm font-semibold mb-2">
                          <Star className="fill-current" size={14} />
                          <span>{rating > 0 ? rating.toFixed(1) : '—'}</span>
                          <span className="text-slate-400 font-normal text-xs">({students.toLocaleString()} students)</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-slate-900 mb-1.5 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
                          {course.title}
                        </h3>

                        {/* Tagline */}
                        {(course.tagline || course.description) && (
                          <p className="text-slate-500 text-sm mb-3 line-clamp-2 flex-grow">
                            {course.tagline || course.description}
                          </p>
                        )}

                        {/* Tags */}
                        {(course.tags ?? []).length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {(course.tags ?? []).slice(0, 3).map((tag, i) => (
                              <span key={i} className="flex items-center gap-0.5 px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs">
                                <Tag size={9} /> {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="flex items-center gap-3 py-3 border-t border-slate-100 text-xs text-slate-500">
                          {(course.duration || course.totalHours) && (
                            <span className="flex items-center gap-1">
                              <Clock size={13} className="text-brand-500" />
                              {course.duration ?? `${course.totalHours}h`}
                            </span>
                          )}
                          {(course.lessons ?? 0) > 0 && (
                            <span className="flex items-center gap-1">
                              <BookOpen size={13} className="text-brand-500" />
                              {course.lessons} lessons
                            </span>
                          )}
                          <span className="ml-auto flex items-center gap-1">
                            <Users size={13} className="text-brand-500" />
                            {formatLevel(course.level)}
                          </span>
                        </div>

                        {/* Instructor */}
                        <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-slate-100">
                          <img
                            src={instructorImg}
                            alt={course.instructor ?? 'Instructor'}
                            className="w-8 h-8 rounded-full border-2 border-white shadow ring-1 ring-slate-100 flex-shrink-0"
                          />
                          <div className="flex-grow min-w-0">
                            <p className="text-xs text-slate-400 leading-none">Instructor</p>
                            <p className="text-xs font-semibold text-slate-800 line-clamp-1">{course.instructor ?? 'SED Instructor'}</p>
                          </div>
                          {onViewInstructor && (
                            <button
                              type="button"
                              className="text-xs font-semibold text-brand-600 hover:text-brand-700 whitespace-nowrap flex-shrink-0"
                              onClick={e => { e.stopPropagation(); onViewInstructor(course.instructor ?? ''); }}
                            >
                              Profile
                            </button>
                          )}
                        </div>

                        {/* Price + CTA */}
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-xs text-slate-400 uppercase font-medium">Fee</p>
                            <div className="flex items-end gap-1.5">
                              <p className={`text-lg font-bold ${price === 'Free' ? 'text-green-600' : 'text-slate-900'}`}>{price}</p>
                              {origPrice && <p className="text-xs text-slate-400 line-through mb-0.5">{origPrice}</p>}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600 transition-all flex-shrink-0"
                            onClick={e => { e.stopPropagation(); setSelectedCourse(course); }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* View all CTA */}
            <div className="mt-14 text-center">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="shadow-lg shadow-brand-500/20"
                onClick={() => onNavigate('courses')}
              >
                View Full Catalog
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
