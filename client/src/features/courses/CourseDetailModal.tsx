import React, { useEffect, useState } from 'react';
import {
  X, Clock, BookOpen, Star, Users, Shield, Award, CheckCircle, PlayCircle,
  Download, ChevronDown, ChevronUp, Lock, FileText, Video, Headphones,
  Link as LinkIcon, Image, Loader2, Globe, BarChart2, Calendar, Wifi,
  AlertCircle, Tag, Layers,
  MessageSquare, ClipboardList, GraduationCap, Paperclip,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import {
  CourseSummary, CourseDetail, ContentItem, CurriculumWeek,
  fetchCourseDetail, formatCoursePrice, formatOriginalPrice, formatLevel,
  InstructorInfo,
} from '../../services/courseService';

interface CourseDetailModalProps {
  course: CourseSummary;
  onClose: () => void;
  onEnroll?: () => void;
  onViewInstructor?: (name: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CONTENT_TYPE_ICON: Record<string, React.ReactNode> = {
  video:    <Video    size={14} className="text-brand-500" />,
  audio:    <Headphones size={14} className="text-purple-500" />,
  pdf:      <FileText  size={14} className="text-red-500" />,
  text:     <FileText  size={14} className="text-slate-500" />,
  markdown: <FileText  size={14} className="text-slate-500" />,
  slides:   <Layers    size={14} className="text-orange-500" />,
  link:     <LinkIcon  size={14} className="text-blue-500" />,
  embed:    <PlayCircle size={14} className="text-green-500" />,
  image:    <Image     size={14} className="text-pink-500" />,
  notebook: <Layers    size={14} className="text-yellow-600" />,
};

const fmtDuration = (secs?: number): string => {
  if (!secs) return '';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s > 0 ? `${s}s` : ''}`.trim() : `${s}s`;
};

const fmtDate = (iso?: string): string => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const FILE_TYPE_ICON: Record<string, React.ReactNode> = {
  pdf:   <FileText size={16} className="text-red-500" />,
  video: <Video    size={16} className="text-brand-500" />,
  audio: <Headphones size={16} className="text-purple-500" />,
  image: <Image    size={16} className="text-pink-500" />,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SocialLink: React.FC<{ href: string; label: string; abbr: string; hoverClass: string }> = ({ href, label, abbr, hoverClass }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    aria-label={label}
    title={label}
    className={`flex items-center justify-center w-6 h-6 rounded text-xs font-bold text-slate-500 bg-slate-100 hover:text-white transition-colors ${hoverClass}`}
  >
    {abbr}
  </a>
);

const InstructorCard: React.FC<{ info: InstructorInfo; isPrimary?: boolean }> = ({ info, isPrimary }) => (
  <div className={`flex gap-4 p-4 rounded-xl border ${isPrimary ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100'}`}>
    <img
      src={info.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(info.name || 'I')}&background=EBF4FF&color=2563EB&bold=true`}
      alt={info.name || 'Instructor'}
      className="w-14 h-14 rounded-full object-cover border-2 border-white shadow ring-2 ring-slate-100 flex-shrink-0"
    />
    <div className="flex-grow min-w-0">
      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-0.5">
        {isPrimary ? 'Lead Instructor' : 'Co-Instructor'}
      </p>
      <p className="text-base font-bold text-slate-900 leading-tight">{info.name || 'SED Instructor'}</p>
      {info.title && <p className="text-sm text-brand-600 font-medium">{info.title}</p>}
      {info.bio && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{info.bio}</p>}
      <div className="flex flex-wrap gap-3 mt-2">
        {info.totalStudents !== undefined && (
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Users size={12} /> {info.totalStudents.toLocaleString()} students
          </span>
        )}
        {info.totalCourses !== undefined && (
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <BookOpen size={12} /> {info.totalCourses} courses
          </span>
        )}
        {info.rating !== undefined && (
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Star size={12} className="fill-yellow-400 text-yellow-400" /> {info.rating.toFixed(1)} rating
          </span>
        )}
      </div>
      {info.socialLinks && (
        <div className="flex gap-2 mt-2">
          {info.socialLinks.linkedin && <SocialLink href={info.socialLinks.linkedin} label="LinkedIn profile" abbr="in" hoverClass="hover:bg-blue-600" />}
          {info.socialLinks.twitter  && <SocialLink href={info.socialLinks.twitter}  label="Twitter / X profile" abbr="𝕏" hoverClass="hover:bg-slate-800" />}
          {info.socialLinks.github   && <SocialLink href={info.socialLinks.github}   label="GitHub profile" abbr="gh" hoverClass="hover:bg-slate-700" />}
          {info.socialLinks.youtube  && <SocialLink href={info.socialLinks.youtube}  label="YouTube channel" abbr="yt" hoverClass="hover:bg-red-600" />}
        </div>
      )}
    </div>
  </div>
);

const WeekAccordion: React.FC<{ week: CurriculumWeek; defaultOpen?: boolean }> = ({ week, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const conceptCount    = week.concepts.length;
  const quizCount       = week.quizzes.length;
  const examCount       = week.exams.length;
  const discussionCount = week.discussions.length;
  const assignmentCount = week.assignments.length;
  const totalItems      = conceptCount + quizCount + examCount + discussionCount + assignmentCount;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open ? 'true' : 'false'}
        className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex-shrink-0">
          {week.weekNumber}
        </div>
        <div className="flex-grow min-w-0">
          <p className="font-semibold text-slate-800 text-sm leading-tight truncate">{week.title}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {totalItems} item{totalItems !== 1 ? 's' : ''}
            {conceptCount > 0    && ` · ${conceptCount} lesson${conceptCount !== 1 ? 's' : ''}`}
            {quizCount > 0       && ` · ${quizCount} quiz${quizCount !== 1 ? 'zes' : ''}`}
            {examCount > 0       && ` · ${examCount} exam${examCount !== 1 ? 's' : ''}`}
            {discussionCount > 0 && ` · ${discussionCount} discussion${discussionCount !== 1 ? 's' : ''}`}
            {assignmentCount > 0 && ` · ${assignmentCount} assignment${assignmentCount !== 1 ? 's' : ''}`}
          </p>
        </div>
        {week.isLocked && <Lock size={14} className="text-slate-400 flex-shrink-0" />}
        {open ? <ChevronUp size={16} className="text-slate-500 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-500 flex-shrink-0" />}
      </button>

      {open && (
        <div className="divide-y divide-slate-100">
          {week.description && (
            <p className="px-4 py-2 text-xs text-slate-500 italic bg-white">{week.description}</p>
          )}
          {week.concepts.map((c: ContentItem) => (
            <div key={c._id} className="flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50/50 transition-colors">
              <span className="flex-shrink-0">{CONTENT_TYPE_ICON[c.type] ?? <PlayCircle size={14} />}</span>
              <span className="flex-grow text-sm text-slate-700 line-clamp-1">{c.title}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                {c.isPreview && (
                  <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">Preview</span>
                )}
                {c.duration && <span className="text-xs text-slate-400">{fmtDuration(c.duration)}</span>}
              </div>
            </div>
          ))}
          {week.quizzes.map(q => (
            <div key={q._id} className="flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50/50 transition-colors">
              <ClipboardList size={14} className="text-blue-500 flex-shrink-0" />
              <span className="flex-grow text-sm text-slate-700">{q.title}</span>
              <span className="text-xs text-slate-400">{q.questions.length} questions</span>
            </div>
          ))}
          {week.discussions.map(d => (
            <div key={d._id} className="flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50/50 transition-colors">
              <MessageSquare size={14} className="text-teal-500 flex-shrink-0" />
              <span className="flex-grow text-sm text-slate-700">{d.title}</span>
              {d.isGraded && <span className="text-xs text-slate-400">Graded</span>}
            </div>
          ))}
          {week.exams.map(e => (
            <div key={e._id} className="flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50/50 transition-colors">
              <GraduationCap size={14} className="text-orange-500 flex-shrink-0" />
              <span className="flex-grow text-sm text-slate-700">{e.title}</span>
              {e.totalMarks && <span className="text-xs text-slate-400">{e.totalMarks} marks</span>}
            </div>
          ))}
          {week.assignments.map(a => (
            <div key={a._id} className="flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50/50 transition-colors">
              <Paperclip size={14} className="text-pink-500 flex-shrink-0" />
              <span className="flex-grow text-sm text-slate-700">{a.title}</span>
              {a.deadline && <span className="text-xs text-slate-400">Due {fmtDate(a.deadline)}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Modal ───────────────────────────────────────────────────────────────

type Tab = 'overview' | 'curriculum' | 'instructor' | 'details';

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course, onClose, onEnroll, onViewInstructor,
}) => {
  const [activeTab, setActiveTab]     = useState<Tab>('overview');
  const [detail, setDetail]           = useState<CourseDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [detailError, setDetailError]     = useState(false);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // Fetch full detail
  useEffect(() => {
    let cancelled = false;
    setDetailLoading(true);
    setDetailError(false);
    fetchCourseDetail(course.slug, true)
      .then(d => { if (!cancelled) { setDetail(d); setDetailLoading(false); } })
      .catch(() => { if (!cancelled) { setDetailError(true); setDetailLoading(false); } });
    return () => { cancelled = true; };
  }, [course.slug]);

  // Use detail if loaded, else fall back to summary
  const c: CourseSummary | CourseDetail = detail ?? course;
  const cd = detail as CourseDetail | null;

  const isLive               = c.courseType === 'live';
  const certAvailable        = c.certificationAvailable ?? c.certification?.available ?? false;
  const effectivePrice       = formatCoursePrice(c.pricing);
  const originalPrice        = formatOriginalPrice(c.pricing);
  const instructorObj        = c.instructorObj;
  const coInstructors        = c.coInstructors ?? [];
  const totalConcepts        = cd?.curriculum ? cd.curriculum.reduce((a, w) => a + w.concepts.length, 0) : (c.lessons ?? 0);
  const totalWeeks           = cd?.curriculum?.length ?? 0;
  const totalAttachments     = cd?.attachments?.length ?? 0;
  const sessions             = c.liveDetails?.sessions ?? [];

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview',    label: 'Overview' },
    { id: 'curriculum',  label: `Curriculum${totalWeeks > 0 ? ` (${totalWeeks})` : ''}` },
    { id: 'instructor',  label: 'Instructor' },
    { id: 'details',     label: 'Details' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[92vh] animate-fade-in-up overflow-hidden">

        {/* Close */}
        <button
          type="button"
          aria-label="Close course details"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 bg-white/90 hover:bg-white text-slate-600 rounded-full backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
        >
          <X size={20} />
        </button>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-grow overscroll-contain">

          {/* Hero */}
          <div className="relative h-56 sm:h-72">
            <img
              src={c.bannerUrl || c.imageUrl || c.image}
              alt={c.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {isLive ? (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-accent-500 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                  <Wifi size={10} /> Live
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-brand-600 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                  <PlayCircle size={10} /> Self-Paced
                </span>
              )}
              {c.isFeatured && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full uppercase tracking-wide">
                  <Star size={10} className="fill-current" /> Featured
                </span>
              )}
              {c.allowFreePreview && (
                <span className="px-2.5 py-1 bg-green-500 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                  Free Preview
                </span>
              )}
            </div>

            {/* Title area */}
            <div className="absolute bottom-0 left-0 w-full p-5 sm:p-7 text-white">
              <div className="flex flex-wrap gap-2 mb-2">
                {c.category && (
                  <span className="px-3 py-0.5 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/30 uppercase tracking-wide">
                    {c.category}
                  </span>
                )}
                <span className="px-3 py-0.5 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/30 uppercase tracking-wide">
                  {formatLevel(c.level)}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold leading-tight pr-10">{c.title}</h2>
              {c.tagline && <p className="text-slate-200 text-sm mt-1">{c.tagline}</p>}

              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-200">
                <div className="flex items-center gap-1.5 text-yellow-400">
                  <Star className="fill-current" size={15} />
                  <span className="font-semibold">{(c.stats?.averageRating ?? c.rating ?? 0).toFixed(1)}</span>
                  <span className="text-slate-300 text-xs">({(c.stats?.totalRatings ?? 0).toLocaleString()} ratings)</span>
                </div>
                <span className="flex items-center gap-1">
                  <Users size={15} />
                  {(c.stats?.enrolledCount ?? c.students ?? 0).toLocaleString()} enrolled
                </span>
                {c.language && (
                  <span className="flex items-center gap-1">
                    <Globe size={15} /> {c.language}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
            <div className="flex overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-brand-600 text-brand-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading overlay */}
          {detailLoading && (
            <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
              <Loader2 size={22} className="animate-spin text-brand-600" />
              <span className="text-sm">Loading full course details…</span>
            </div>
          )}

          {/* Error notice */}
          {detailError && !detailLoading && (
            <div className="mx-6 mt-4 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
              <AlertCircle size={16} className="flex-shrink-0" />
              Could not load full details — showing summary information.
            </div>
          )}

          {/* Main + Sidebar layout */}
          <div className="flex flex-col lg:flex-row">

            {/* ── Tab Content ── */}
            <div className="flex-1 p-5 sm:p-7 min-w-0">

              {/* ── OVERVIEW ── */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">About This Course</h3>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                      {c.description || 'No description available.'}
                    </p>
                  </div>

                  {/* What You'll Learn */}
                  {((cd?.learningObjectives ?? c.whatYouWillLearn ?? []).length > 0) && (
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-3">What You'll Learn</h3>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(cd?.learningObjectives ?? c.whatYouWillLearn ?? []).map((obj, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-slate-700 text-sm">{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Prerequisites */}
                  {((cd?.prerequisites ?? c.requirements ?? []).length > 0) && (
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-3">Prerequisites</h3>
                      <ul className="space-y-1.5">
                        {(cd?.prerequisites ?? c.requirements ?? []).map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Target Audience */}
                  {(cd?.targetAudience ?? []).length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-3">Who This Course Is For</h3>
                      <ul className="space-y-1.5">
                        {(cd?.targetAudience ?? []).map((a, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <Users size={14} className="text-brand-500 mt-0.5 flex-shrink-0" />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tools */}
                  {(cd?.tools ?? []).length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-3">Tools & Technologies</h3>
                      <div className="flex flex-wrap gap-2">
                        {(cd?.tools ?? []).map((t, i) => (
                          <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium border border-slate-200">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Highlights grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(c.duration || c.totalHours) && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                        <Clock className="text-brand-500 mt-0.5" size={18} />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">Duration</p>
                          <p className="text-slate-500 text-xs">{c.duration ?? `${c.totalHours}h total`}</p>
                        </div>
                      </div>
                    )}
                    {totalConcepts > 0 && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                        <BookOpen className="text-brand-500 mt-0.5" size={18} />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">Lessons</p>
                          <p className="text-slate-500 text-xs">{totalConcepts} lessons{totalWeeks > 0 ? ` across ${totalWeeks} weeks` : ''}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                      <Award className="text-brand-500 mt-0.5" size={18} />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">Certification</p>
                        <p className="text-slate-500 text-xs">
                          {certAvailable
                            ? (c.certification?.title ?? 'Industry-recognized certificate')
                            : 'No certificate for this course'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                      {isLive ? <Calendar className="text-accent-500 mt-0.5" size={18} /> : <PlayCircle className="text-brand-500 mt-0.5" size={18} />}
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{isLive ? 'Format' : 'Access'}</p>
                        <p className="text-slate-500 text-xs">
                          {isLive
                            ? `Live sessions${c.liveDetails?.batchName ? ` · ${c.liveDetails.batchName}` : ''}`
                            : 'Lifetime access to all materials'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Projects */}
                  {(cd?.projects ?? []).length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-3">Projects You'll Build</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(cd?.projects ?? []).map((p, i) => (
                          <div key={i} className="p-4 border border-slate-100 rounded-xl bg-white shadow-sm">
                            {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="w-full h-28 object-cover rounded-lg mb-3" />}
                            <p className="font-semibold text-slate-900 text-sm">{p.title}</p>
                            {p.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>}
                            {(p.techStack ?? []).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {p.techStack!.map((t, j) => (
                                  <span key={j} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{t}</span>
                                ))}
                              </div>
                            )}
                            {p.demoUrl && (
                              <a href={p.demoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-brand-600 font-medium hover:underline">
                                <LinkIcon size={12} /> Live Demo
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FAQs */}
                  {(cd?.faqs ?? []).length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-3">FAQs</h3>
                      <div className="space-y-3">
                        {(cd?.faqs ?? []).map((faq, i) => (
                          <details key={i} className="group border border-slate-200 rounded-xl overflow-hidden">
                            <summary className="flex items-center justify-between px-4 py-3 cursor-pointer bg-slate-50 hover:bg-slate-100 font-medium text-slate-800 text-sm list-none">
                              {faq.question}
                              <ChevronDown size={16} className="text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" />
                            </summary>
                            {faq.answer && <p className="px-4 py-3 text-sm text-slate-600 bg-white">{faq.answer}</p>}
                          </details>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── CURRICULUM ── */}
              {activeTab === 'curriculum' && (
                <div className="space-y-3">
                  {detailLoading && (
                    <div className="flex items-center gap-2 text-slate-400 text-sm py-8 justify-center">
                      <Loader2 size={18} className="animate-spin" /> Loading curriculum…
                    </div>
                  )}
                  {!detailLoading && (cd?.curriculum ?? []).length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                      <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Curriculum details coming soon.</p>
                    </div>
                  )}
                  {(cd?.curriculum ?? []).map((week, i) => (
                    <WeekAccordion key={week._id ?? i} week={week} defaultOpen={i === 0} />
                  ))}
                </div>
              )}

              {/* ── INSTRUCTOR ── */}
              {activeTab === 'instructor' && (
                <div className="space-y-4">
                  {instructorObj ? (
                    <InstructorCard info={instructorObj} isPrimary />
                  ) : (
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.instructor || 'I')}&background=EBF4FF&color=2563EB&bold=true`}
                        alt={c.instructor}
                        className="w-12 h-12 rounded-full border-2 border-white shadow ring-2 ring-slate-100"
                      />
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Lead Instructor</p>
                        <p className="text-base font-bold text-slate-900">{c.instructor || 'SED Instructor'}</p>
                        <button
                          type="button"
                          className="mt-1 text-xs font-semibold text-brand-600 hover:underline"
                          onClick={() => { onClose(); if (onViewInstructor && c.instructor) onViewInstructor(c.instructor); }}
                        >
                          View full profile →
                        </button>
                      </div>
                    </div>
                  )}
                  {coInstructors.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Co-Instructors</h3>
                      {coInstructors.map((ci, i) => (
                        <InstructorCard key={i} info={ci} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── DETAILS ── */}
              {activeTab === 'details' && (
                <div className="space-y-8">
                  {/* Certification */}
                  {certAvailable && c.certification && (
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-3">Certification</h3>
                      <div className="p-5 bg-gradient-to-br from-brand-50 to-white border border-brand-200 rounded-xl">
                        <div className="flex items-start gap-3">
                          <Award size={22} className="text-brand-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-slate-900">{c.certification.title ?? 'Course Certificate'}</p>
                            {c.certification.description && <p className="text-sm text-slate-600 mt-1">{c.certification.description}</p>}
                            {c.certification.criteria && (
                              <div className="mt-3 p-3 bg-white rounded-lg border border-brand-100">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Completion Criteria</p>
                                <p className="text-sm text-slate-700">{c.certification.criteria}</p>
                              </div>
                            )}
                            <div className="flex flex-wrap gap-4 mt-3">
                              {c.certification.issuedBy && (
                                <span className="text-sm text-slate-600 flex items-center gap-1">
                                  <Shield size={14} className="text-brand-500" /> Issued by {c.certification.issuedBy}
                                </span>
                              )}
                              <span className="text-sm text-slate-600 flex items-center gap-1">
                                <Clock size={14} className="text-brand-500" />
                                {c.certification.validityMonths
                                  ? `Valid for ${c.certification.validityMonths} months`
                                  : 'Lifetime validity'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Live course schedule */}
                  {isLive && c.liveDetails && (
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-3">Live Course Schedule</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {c.liveDetails.startDate && (
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="text-xs text-slate-400 uppercase font-bold">Start Date</p>
                            <p className="text-sm font-semibold text-slate-800 mt-0.5">{fmtDate(c.liveDetails.startDate)}</p>
                          </div>
                        )}
                        {c.liveDetails.endDate && (
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="text-xs text-slate-400 uppercase font-bold">End Date</p>
                            <p className="text-sm font-semibold text-slate-800 mt-0.5">{fmtDate(c.liveDetails.endDate)}</p>
                          </div>
                        )}
                        {c.liveDetails.enrollmentDeadline && (
                          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <p className="text-xs text-amber-600 uppercase font-bold">Enrollment Deadline</p>
                            <p className="text-sm font-semibold text-slate-800 mt-0.5">{fmtDate(c.liveDetails.enrollmentDeadline)}</p>
                          </div>
                        )}
                        {c.liveDetails.maxStudents && (
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="text-xs text-slate-400 uppercase font-bold">Batch Size</p>
                            <p className="text-sm font-semibold text-slate-800 mt-0.5">Max {c.liveDetails.maxStudents} students</p>
                          </div>
                        )}
                      </div>

                      {sessions.length > 0 && (
                        <>
                          <h4 className="text-sm font-bold text-slate-700 mb-2">Sessions ({sessions.length})</h4>
                          <div className="space-y-2">
                            {sessions.map(s => (
                              <div key={s._id} className={`flex gap-3 p-3 rounded-lg border ${s.isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'}`}>
                                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${s.isCompleted ? 'bg-green-500' : 'bg-brand-500'}`} />
                                <div className="flex-grow min-w-0">
                                  <p className="text-sm font-semibold text-slate-800 line-clamp-1">{s.title}</p>
                                  <p className="text-xs text-slate-400 mt-0.5">{fmtDate(s.scheduledAt)}{s.duration ? ` · ${s.duration}min` : ''}</p>
                                </div>
                                {s.recordingUrl && (
                                  <a href={s.recordingUrl} target="_blank" rel="noreferrer" aria-label={`Watch recording: ${s.title}`} title={`Watch recording: ${s.title}`} className="text-brand-600 hover:text-brand-700 flex-shrink-0">
                                    <PlayCircle size={16} />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Attachments */}
                  {totalAttachments > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-3">
                        Course Attachments ({totalAttachments})
                      </h3>
                      <div className="space-y-2">
                        {cd!.attachments!.map(att => (
                          <a
                            key={att._id}
                            href={att.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-brand-300 hover:bg-brand-50 transition-all group"
                          >
                            {FILE_TYPE_ICON[att.fileType] ?? <Paperclip size={16} className="text-slate-400" />}
                            <span className="flex-grow text-sm text-slate-700 group-hover:text-brand-700 font-medium line-clamp-1">{att.name}</span>
                            {att.size && <span className="text-xs text-slate-400 flex-shrink-0">{(att.size / 1024).toFixed(0)} KB</span>}
                            <Download size={14} className="text-slate-300 group-hover:text-brand-500 flex-shrink-0 transition-colors" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {(c.tags ?? []).length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {(c.tags ?? []).map((tag, i) => (
                          <span key={i} className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm border border-slate-200">
                            <Tag size={11} /> {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  {c.stats && (
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-3">Course Stats</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { label: 'Enrolled',  value: c.stats.enrolledCount.toLocaleString(),       icon: <Users size={14} /> },
                          { label: 'Completed', value: c.stats.completedCount.toLocaleString(),       icon: <CheckCircle size={14} /> },
                          { label: 'Rating',    value: `${c.stats.averageRating.toFixed(1)} / 5`,     icon: <Star size={14} /> },
                          { label: 'Ratings',   value: c.stats.totalRatings.toLocaleString(),         icon: <BarChart2 size={14} /> },
                          { label: 'Reviews',   value: c.stats.totalReviews.toLocaleString(),         icon: <MessageSquare size={14} /> },
                        ].map(stat => (
                          <div key={stat.label} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                            <div className="flex justify-center text-brand-500 mb-1">{stat.icon}</div>
                            <p className="text-base font-bold text-slate-900">{stat.value}</p>
                            <p className="text-xs text-slate-400">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Sidebar ── */}
            <div className="w-full lg:w-72 xl:w-80 bg-slate-50 p-5 sm:p-6 border-t lg:border-t-0 lg:border-l border-slate-200 flex-shrink-0">
              <div className="space-y-5 lg:sticky lg:top-16">

                {/* Course includes */}
                <div>
                  <p className="font-bold text-slate-900 text-sm mb-3">This course includes:</p>
                  <ul className="space-y-2.5 text-sm text-slate-600">
                    {totalConcepts > 0 && (
                      <li className="flex items-center gap-2"><PlayCircle size={15} className="text-brand-500" /> {totalConcepts} video lessons</li>
                    )}
                    {totalAttachments > 0 && (
                      <li className="flex items-center gap-2"><Download size={15} className="text-brand-500" /> {totalAttachments} downloadable resources</li>
                    )}
                    {isLive && sessions.length > 0 && (
                      <li className="flex items-center gap-2"><Calendar size={15} className="text-accent-500" /> {sessions.length} live sessions</li>
                    )}
                    <li className="flex items-center gap-2"><Users size={15} className="text-brand-500" /> Community forum access</li>
                    {certAvailable && (
                      <li className="flex items-center gap-2 text-green-700 font-medium"><Award size={15} className="text-green-600" /> Certificate of completion</li>
                    )}
                    {!c.requiresEnrollment && (
                      <li className="flex items-center gap-2 text-green-700 font-medium"><Shield size={15} className="text-green-600" /> Open access</li>
                    )}
                  </ul>
                </div>

                {/* Level & Language */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
                    <BarChart2 size={14} className="text-brand-500 mx-auto mb-1" />
                    <p className="text-xs text-slate-400">Level</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{formatLevel(c.level)}</p>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
                    <Globe size={14} className="text-brand-500 mx-auto mb-1" />
                    <p className="text-xs text-slate-400">Language</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{c.language ?? 'English'}</p>
                  </div>
                </div>

                {/* Pricing inclusions */}
                {(c.pricing?.inclusions ?? []).length > 0 && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Pricing Includes</p>
                    <ul className="space-y-1">
                      {(c.pricing!.inclusions!).map((inc, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                          <CheckCircle size={12} className="text-green-500 mt-0.5 flex-shrink-0" /> {inc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tags */}
                {(c.tags ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {(c.tags ?? []).slice(0, 5).map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-200 text-slate-600 rounded-full text-xs">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="flex-none p-4 sm:p-5 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.08)] z-30">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wide mb-0.5">Total Price</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl sm:text-3xl font-display font-bold text-slate-900">{effectivePrice}</span>
                {originalPrice && (
                  <span className="text-slate-400 line-through mb-1 text-sm">{originalPrice}</span>
                )}
              </div>
              {c.pricing?.discountEndsAt && (
                <p className="text-xs text-red-500 font-medium mt-0.5">
                  Offer ends {fmtDate(c.pricing.discountEndsAt)}
                </p>
              )}
              {c.pricing?.note && (
                <p className="text-xs text-slate-500 mt-0.5">{c.pricing.note}</p>
              )}
            </div>
            <Button
              size="lg"
              className="flex-grow sm:flex-grow-0 sm:min-w-[180px] shadow-lg shadow-brand-500/20"
              onClick={() => { onClose(); if (onEnroll) onEnroll(); }}
            >
              {c.pricing?.isFree || effectivePrice === 'Free' ? 'Enroll Free' : 'Enroll Now'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
