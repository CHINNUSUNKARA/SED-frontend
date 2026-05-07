import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, Clock, BookOpen, Star, ChevronLeft, ChevronRight,
  ArrowUpDown, Quote, MessageSquare, Users, Award, Wifi, PlayCircle,
  X, SlidersHorizontal, Tag, Loader2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { CourseDetailModal } from './CourseDetailModal';
import { ViewState } from '../../App';
import {
  fetchCourses, CourseSummary,
  formatCoursePrice, formatOriginalPrice, formatLevel,
} from '../../services/courseService';
import { fetchCourseReviews, fetchTestimonials, CourseReview, Testimonial } from '../../services/reviewService';
import { realtimeService } from '../../services/realtimeService';

interface CoursesPageProps {
  onNavigate: (view: ViewState) => void;
  onViewInstructor?: (name: string) => void;
}

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'rating' | 'popular';

const ITEMS_PER_PAGE = 6;

const LEVEL_OPTIONS = [
  { value: '', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'default',    label: 'Recommended' },
  { value: 'popular',    label: 'Most Popular' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

// ─── Course Card ──────────────────────────────────────────────────────────────
const CourseCard: React.FC<{
  course: CourseSummary;
  onSelect: (c: CourseSummary) => void;
  onViewInstructor?: (name: string) => void;
}> = ({ course, onSelect, onViewInstructor }) => {
  const isLive         = course.courseType === 'live';
  const certAvailable  = course.certificationAvailable ?? false;
  const effectivePrice = formatCoursePrice(course.pricing);
  const originalPrice  = formatOriginalPrice(course.pricing);
  const rating         = course.stats?.averageRating ?? course.rating ?? 0;
  const students       = course.stats?.enrolledCount ?? course.students ?? 0;
  const instructorImg  = course.instructorObj?.imageUrl
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor ?? 'I')}&background=EBF4FF&color=2563EB&bold=true`;

  return (
    <div
      role="article"
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col cursor-pointer focus-within:ring-2 focus-within:ring-brand-500"
      onClick={() => onSelect(course)}
    >
      {/* Image */}
      <div className="relative h-48 sm:h-52 overflow-hidden flex-shrink-0">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70 group-hover:opacity-50 transition-opacity" />

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {isLive ? (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-accent-500 text-white text-xs font-bold rounded-full uppercase tracking-wide">
              <Wifi size={9} /> Live
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-brand-600/90 text-white text-xs font-bold rounded-full uppercase tracking-wide backdrop-blur-sm">
              <PlayCircle size={9} /> Self-Paced
            </span>
          )}
          {course.isFeatured && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full uppercase tracking-wide">
              <Star size={9} className="fill-current" /> Featured
            </span>
          )}
        </div>

        {/* Bottom-right: cert badge */}
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
          <span className="text-slate-400 font-normal text-xs">
            ({students.toLocaleString()} {students === 1 ? 'student' : 'students'})
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
          {course.title}
        </h3>

        {/* Tagline / description */}
        {(course.tagline || course.description) && (
          <p className="text-slate-500 text-xs mb-3 line-clamp-2 flex-grow">
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

        {/* Metadata row */}
        <div className="flex items-center gap-3 py-3 border-t border-slate-100 text-xs text-slate-500">
          {(course.duration || course.totalHours) && (
            <span className="flex items-center gap-1">
              <Clock size={13} className="text-brand-500" />
              {course.duration ?? `${course.totalHours}h`}
            </span>
          )}
          {course.lessons !== undefined && course.lessons > 0 && (
            <span className="flex items-center gap-1">
              <BookOpen size={13} className="text-brand-500" />
              {course.lessons} lessons
            </span>
          )}
          <span className="flex items-center gap-1 ml-auto">
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
              <p className={`text-lg font-bold ${effectivePrice === 'Free' ? 'text-green-600' : 'text-slate-900'}`}>
                {effectivePrice}
              </p>
              {originalPrice && (
                <p className="text-xs text-slate-400 line-through mb-0.5">{originalPrice}</p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600 transition-all flex-shrink-0"
            onClick={e => { e.stopPropagation(); onSelect(course); }}
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Active Filter Chip ───────────────────────────────────────────────────────
const FilterChip: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
  <span className="flex items-center gap-1 px-2.5 py-1 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-medium rounded-full">
    {label}
    <button type="button" onClick={onRemove} className="hover:text-brand-900 ml-0.5" aria-label={`Remove ${label} filter`}>
      <X size={11} />
    </button>
  </span>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export const CoursesPage: React.FC<CoursesPageProps> = ({ onNavigate, onViewInstructor }) => {
  const [courses, setCourses]           = useState<CourseSummary[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [selectedCourse, setSelectedCourse] = useState<CourseSummary | null>(null);

  // Filters
  const [searchQuery, setSearchQuery]   = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [courseType, setCourseType]     = useState<'' | 'live' | 'self-paced'>('');
  const [level, setLevel]               = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortOrder, setSortOrder]       = useState<SortKey>('default');
  const [currentPage, setCurrentPage]   = useState(1);
  const [categories, setCategories]     = useState<string[]>(['All']);

  // Reviews / testimonials
  const [courseReviews, setCourseReviews]   = useState<CourseReview[]>([]);
  const [testimonials, setTestimonials]     = useState<Testimonial[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const loadCourses = useCallback(async () => {
    try {
      const data = await fetchCourses(true);
      setCourses(data);
      const cats = Array.from(new Set(data.map(c => c.category).filter((c): c is string => !!c)));
      setCategories(['All', ...cats]);
    } catch {
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();

    const loadSocial = async () => {
      try {
        const [reviews, testimonialData] = await Promise.all([fetchCourseReviews(6), fetchTestimonials()]);
        setCourseReviews(reviews);
        setTestimonials(testimonialData);
      } catch { /* non-critical */ }
    };
    loadSocial();

    const interval = setInterval(loadCourses, 60_000);
    const unsubs = [
      realtimeService.subscribe('course-created', loadCourses),
      realtimeService.subscribe('course-updated', loadCourses),
      realtimeService.subscribe('course-deleted', loadCourses),
    ];
    return () => { clearInterval(interval); unsubs.forEach(fn => fn()); };
  }, [loadCourses]);

  // Reset to page 1 on any filter/sort change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, activeCategory, courseType, level, featuredOnly, sortOrder]);

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = courses.filter(c => {
    if (c.isArchived) return false;
    if (activeCategory !== 'All' && c.category !== activeCategory) return false;
    if (courseType && c.courseType !== courseType) return false;
    if (level && c.level !== level) return false;
    if (featuredOnly && !c.isFeatured) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        (c.tagline?.toLowerCase().includes(q) ?? false) ||
        (c.description?.toLowerCase().includes(q) ?? false) ||
        (c.tags ?? []).some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // ── Sort ────────────────────────────────────────────────────────────────────
  const sorted = [...filtered].sort((a, b) => {
    switch (sortOrder) {
      case 'popular':
        return (b.stats?.enrolledCount ?? b.students ?? 0) - (a.stats?.enrolledCount ?? a.students ?? 0);
      case 'rating':
        return (b.stats?.averageRating ?? b.rating ?? 0) - (a.stats?.averageRating ?? a.rating ?? 0);
      case 'price-asc': {
        const pa = a.pricing?.discountedAmount ?? a.pricing?.amount ?? 0;
        const pb = b.pricing?.discountedAmount ?? b.pricing?.amount ?? 0;
        return pa - pb;
      }
      case 'price-desc': {
        const pa = a.pricing?.discountedAmount ?? a.pricing?.amount ?? 0;
        const pb = b.pricing?.discountedAmount ?? b.pricing?.amount ?? 0;
        return pb - pa;
      }
      default:
        return 0;
    }
  });
  console.log(courses)
  // ── Paginate ────────────────────────────────────────────────────────────────
  const totalPages  = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const pageCourses = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const hasActiveFilters = activeCategory !== 'All' || courseType !== '' || level !== '' || featuredOnly;

  const clearAllFilters = () => {
    setActiveCategory('All');
    setCourseType('');
    setLevel('');
    setFeaturedOnly(false);
    setSearchQuery('');
    setSortOrder('default');
  };

  // ── Loading / Error ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="pt-24 min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="text-brand-600 animate-spin" />
        <p className="text-slate-500 text-lg">Loading courses…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="pt-24 min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <p className="text-red-600 font-medium">{error}</p>
        <Button onClick={loadCourses}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-slate-50 flex flex-col">
      {selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onEnroll={() => onNavigate('get-started')}
          onViewInstructor={onViewInstructor}
        />
      )}

      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">All Courses</h1>
          <p className="text-slate-500 max-w-2xl">
            Browse our full catalog — live cohorts and self-paced programs designed to take you from beginner to professional.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow pb-12">

        {/* ── Toolbar ── */}
        <div className="mt-8 mb-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5 space-y-4">

          {/* Row 1: Search + Mobile filter toggle + Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-grow">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Search courses, tags, topics…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
            </div>

            {/* Mobile filter toggle */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(v => !v)}
              className="sm:hidden flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 transition-colors"
            >
              <SlidersHorizontal size={15} />
              Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />}
            </button>

            {/* Sort */}
            <div className="relative min-w-[190px]">
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value as SortKey)}
                className="w-full appearance-none pl-3 pr-8 py-2.5 border border-slate-300 rounded-xl text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                aria-label="Sort courses"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ArrowUpDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Row 2: Filter controls (hidden on mobile unless toggled) */}
          <div className={`flex flex-wrap gap-3 items-center ${showMobileFilters ? 'flex' : 'hidden sm:flex'}`}>
            {/* Category tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-400 flex items-center gap-1 mr-1"><Filter size={12} /> Category:</span>
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                    activeCategory === cat
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Separator */}
            <span className="hidden sm:block w-px h-5 bg-slate-200" />

            {/* Course type */}
            <div className="flex items-center gap-1.5">
              {(['', 'live', 'self-paced'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setCourseType(type)}
                  className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                    courseType === type
                      ? type === 'live' ? 'bg-accent-500 text-white border-accent-500' : 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-600'
                  }`}
                >
                  {type === '' && 'All Types'}
                  {type === 'live' && <><Wifi size={9} /> Live</>}
                  {type === 'self-paced' && <><PlayCircle size={9} /> Self-Paced</>}
                </button>
              ))}
            </div>

            {/* Separator */}
            <span className="hidden sm:block w-px h-5 bg-slate-200" />

            {/* Level */}
            <div className="relative">
              <select
                value={level}
                onChange={e => setLevel(e.target.value)}
                className="appearance-none pl-3 pr-7 py-1.5 border border-slate-200 rounded-full text-xs bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                aria-label="Filter by level"
              >
                {LEVEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ArrowUpDown size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Featured toggle */}
            <button
              type="button"
              onClick={() => setFeaturedOnly(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                featuredOnly
                  ? 'bg-yellow-400 text-yellow-900 border-yellow-400'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-yellow-300'
              }`}
            >
              <Star size={10} className={featuredOnly ? 'fill-current' : ''} /> Featured
            </button>

            {/* Clear all */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-full border border-red-200 transition-colors ml-auto"
              >
                <X size={11} /> Clear all
              </button>
            )}
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
              {activeCategory !== 'All' && <FilterChip label={activeCategory} onRemove={() => setActiveCategory('All')} />}
              {courseType === 'live'       && <FilterChip label="Live"       onRemove={() => setCourseType('')} />}
              {courseType === 'self-paced' && <FilterChip label="Self-Paced" onRemove={() => setCourseType('')} />}
              {level && <FilterChip label={formatLevel(level)} onRemove={() => setLevel('')} />}
              {featuredOnly && <FilterChip label="Featured" onRemove={() => setFeaturedOnly(false)} />}
            </div>
          )}
        </div>

        {/* Results count */}
        <p className="text-sm text-slate-500 font-medium mb-5">
          {sorted.length === 0 ? 'No courses found' : `${sorted.length} course${sorted.length !== 1 ? 's' : ''} found`}
          {searchQuery && <span className="text-slate-400"> for "<em>{searchQuery}</em>"</span>}
        </p>

        {/* ── Course Grid ── */}
        {sorted.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {pageCourses.map(course => (
                <CourseCard
                  key={course._id}
                  course={course}
                  onSelect={setSelectedCourse}
                  onViewInstructor={onViewInstructor}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav aria-label="Course pagination" className="flex justify-center items-center gap-2 mb-12">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    aria-label={`Go to page ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight size={18} />
                </button>
              </nav>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Search size={44} className="mx-auto mb-4 text-slate-200" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No courses found</h3>
            <p className="text-slate-500 text-sm mb-5">Try adjusting your search or clearing filters.</p>
            <Button type="button" variant="outline" onClick={clearAllFilters}>Clear Filters</Button>
          </div>
        )}

        {/* ── Latest Reviews ── */}
        {courseReviews.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-brand-100 p-2 rounded-lg"><MessageSquare size={18} className="text-brand-600" /></div>
              <h2 className="text-2xl font-display font-bold text-slate-900">Latest Reviews</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courseReviews.map(review => (
                <div key={review.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-bold text-brand-600 line-clamp-1 mb-1">{review.courseTitle}</p>
                      <div className="flex gap-0.5 text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className={i < review.rating ? 'fill-current' : 'text-slate-200'} />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap ml-2">{review.date}</span>
                  </div>
                  <p className="text-slate-600 text-sm italic line-clamp-3 my-3">"{review.comment}"</p>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700">
                      {review.studentName.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-slate-800">{review.studentName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Testimonials ── */}
      {testimonials.length > 0 && (
        <section className="bg-white py-20 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl font-display font-bold text-slate-900 mb-3">What Our Students Say</h2>
              <p className="text-slate-500">Hear from the people who've transformed their careers with SED.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map(t => (
                <div key={t.id} className="bg-slate-50 p-7 rounded-2xl border border-slate-100 relative group hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-5 right-5 text-brand-100 group-hover:text-brand-200 transition-colors">
                    <Quote size={44} className="fill-current" />
                  </div>
                  <div className="flex gap-1 text-yellow-400 mb-5 relative z-10">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < t.rating ? 'fill-current' : 'text-slate-300'} />
                    ))}
                  </div>
                  <p className="text-slate-700 italic mb-7 leading-relaxed relative z-10">"{t.quote}"</p>
                  <div className="flex items-center gap-3 relative z-10">
                    <img src={t.image} alt={t.name} className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm" />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                      <p className="text-xs font-medium text-brand-600 uppercase tracking-wide">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
