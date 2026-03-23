
import React, { useEffect } from 'react';
import { X, Clock, BookOpen, Star, Users, Shield, Award, CheckCircle, PlayCircle, Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';

import { CourseSummary } from '../../services/courseService';

interface CourseDetailModalProps {
  course: CourseSummary;
  onClose: () => void;
  onEnroll?: () => void;
  onViewInstructor?: (name: string) => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({ course, onClose, onEnroll, onViewInstructor }) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-fade-in-up overflow-hidden">

        {/* Close Button (Fixed relative to container) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white text-slate-600 rounded-full backdrop-blur-sm transition-all shadow-sm hover:shadow-md"
        >
          <X size={20} />
        </button>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto flex-grow overscroll-contain">

          {/* Hero Image & Header */}
          <div className="relative h-64 sm:h-80">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 text-white">
              <div className="flex flex-wrap gap-3 mb-3">
                <span className="px-3 py-1 bg-brand-600 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                  {course.category}
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full uppercase tracking-wide border border-white/30">
                  {course.level}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold leading-tight mb-2 shadow-sm pr-8">
                {course.title}
              </h2>
              <div className="flex items-center gap-4 text-sm sm:text-base text-slate-200 font-medium">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="fill-current" size={18} />
                  <span>{course.rating} / 5.0</span>
                </div>
                <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                <div className="flex items-center gap-1">
                  <Users size={18} />
                  <span>{course.students?.toLocaleString() || 0} Students Enrolled</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Main Content Column */}
            <div className="flex-1 p-6 sm:p-8">

              {/* Instructor Profile */}
              <div className="flex items-center gap-4 mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor || 'Instructor')}&background=EBF4FF&color=2563EB&bold=true`}
                  alt={course.instructor}
                  className="w-12 h-12 rounded-full border-2 border-white shadow-md ring-2 ring-slate-50"
                />
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Instructor</p>
                  <p className="text-lg font-bold text-slate-900">{course.instructor || 'SED Instructor'}</p>
                </div>
                <div className="ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onClose();
                      if (onViewInstructor && course.instructor) onViewInstructor(course.instructor);
                    }}
                  >
                    View Profile
                  </Button>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4">About This Course</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {course.description}
                  <br /><br />
                  This comprehensive course is designed to take you from basics to advanced concepts with real-world examples. You will gain hands-on experience through projects and assignments that mimic industry scenarios.
                </p>
              </div>

              {/* Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                  <Clock className="text-brand-500 mt-1" size={20} />
                  <div>
                    <h4 className="font-bold text-slate-900">Duration</h4>
                    <p className="text-slate-500 text-sm">{course.duration} of intensive training</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                  <BookOpen className="text-brand-500 mt-1" size={20} />
                  <div>
                    <h4 className="font-bold text-slate-900">Curriculum</h4>
                    <p className="text-slate-500 text-sm">{course.lessons} Comprehensive Lessons</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                  <Award className="text-brand-500 mt-1" size={20} />
                  <div>
                    <h4 className="font-bold text-slate-900">Certification</h4>
                    <p className="text-slate-500 text-sm">Industry-recognized certificate</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                  <PlayCircle className="text-brand-500 mt-1" size={20} />
                  <div>
                    <h4 className="font-bold text-slate-900">Access</h4>
                    <p className="text-slate-500 text-sm">Lifetime access to course materials</p>
                  </div>
                </div>
              </div>

              {/* Learning Outcomes */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">What You'll Learn</h3>
                <ul className="space-y-3">
                  {[
                    "Master core concepts and advanced techniques",
                    "Build real-world projects for your portfolio",
                    "Best practices used by top tech companies",
                    "Problem-solving skills for technical interviews"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={18} />
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sidebar Info (Desktop) */}
            <div className="w-full lg:w-80 bg-slate-50 p-6 sm:p-8 border-t lg:border-t-0 lg:border-l border-slate-200">
              <div className="space-y-4">
                <p className="font-bold text-slate-900 text-sm">This course includes:</p>
                <ul className="text-sm text-slate-600 space-y-3">
                  <li className="flex items-center gap-2"><PlayCircle size={16} className="text-brand-500" /> {course.lessons} video lessons</li>
                  <li className="flex items-center gap-2"><Download size={16} className="text-brand-500" /> 12 downloadable resources</li>
                  <li className="flex items-center gap-2"><Users size={16} className="text-brand-500" /> Community access</li>
                  <li className="flex items-center gap-2"><Shield size={16} className="text-brand-500" /> Certificate of completion</li>
                </ul>

                <div className="pt-6 mt-6 border-t border-slate-200">
                  <Button variant="outline" className="w-full bg-white">
                    <Download size={16} className="mr-2" />
                    Download Syllabus
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer Action Bar */}
        <div className="flex-none p-4 sm:p-6 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-30">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wide mb-1">Total Price</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-display font-bold text-slate-900">{course.price}</span>
                <span className="text-slate-400 line-through mb-1.5 text-sm hidden sm:inline-block">₹79,999</span>
              </div>
            </div>
            <Button
              size="lg"
              className="flex-grow sm:flex-grow-0 sm:w-auto min-w-[200px] shadow-lg shadow-brand-500/20 text-lg"
              onClick={() => {
                onClose();
                if (onEnroll) onEnroll();
              }}
            >
              Enroll Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
