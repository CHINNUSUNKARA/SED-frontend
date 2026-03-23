import React, { useState, useEffect } from 'react';
import { ViewState } from '../../App';
import { Star, Users, BookOpen, MessageSquare, Linkedin, Twitter, Globe, Mail, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { CourseDetailModal } from '../courses/CourseDetailModal';
import { CourseSummary } from '../../services/courseService';
import api from '../../lib/api';

interface InstructorProfilePageProps {
   instructorName: string;
   onNavigate: (view: ViewState) => void;
}

interface InstructorData {
   id: string;
   name: string;
   role: string;
   bio: string;
   skills: string[];
   students: number;
   rating: number;
   reviews: number;
   socials: {
      linkedin?: string;
      twitter?: string;
      website?: string;
      youtube?: string;
   };
   avatarUrl?: string;
}

export const InstructorProfilePage: React.FC<InstructorProfilePageProps> = ({ instructorName, onNavigate }) => {
   const [selectedCourse, setSelectedCourse] = useState<CourseSummary | null>(null);
   const [instructor, setInstructor] = useState<InstructorData | null>(null);
   const [courses, setCourses] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');

   useEffect(() => {
      const fetchData = async () => {
         try {
            setLoading(true);
            // Use the public endpoint
            const res = await api.get(`/instructor/public/${encodeURIComponent(instructorName)}`);
            setInstructor({
               ...res.data.instructor,
               role: res.data.instructor.title || 'Instructor', // Fallback to Title or 'Instructor'
               skills: res.data.instructor.skills || [],
               socials: res.data.instructor.socials || {}
            });
            setCourses(res.data.courses);
         } catch (err) {
            console.error("Failed to fetch instructor:", err);
            setError('Instructor not found');
         } finally {
            setLoading(false);
         }
      };

      if (instructorName) {
         fetchData();
      }
   }, [instructorName]);


   // Convert backend Course to CourseSummary for modal
   const mapCourseToCourseSummary = (course: any): CourseSummary => ({
      id: course.slug || course._id,
      _id: course._id,
      name: course.title,
      slug: course.slug,
      title: course.title,
      description: course.description,
      price: typeof course.price === 'number' ? `₹${course.price}` : course.price || 'Free',
      image: course.thumbnail || course.image,
      level: course.level,
      rating: course.rating || 0,
      students: 0, // Not always readily available, can be fetched if needed
      duration: course.duration,
      lessons: course.lessons || 0,
      instructor: instructor?.name || '',
      category: course.category,
      whatYouWillLearn: [], // Can fetch detail if needed
      requirements: []
   });

   if (loading) return <div className="pt-32 text-center">Loading profile...</div>;
   if (error || !instructor) return <div className="pt-32 text-center text-red-500">{error || 'Instructor not found'}</div>;

   const avatarUrl = instructor.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.name)}&background=EBF4FF&color=2563EB&bold=true&size=200`;

   return (
      <div className="pt-24 min-h-screen bg-slate-50">

         {/* Modal Integration */}
         {selectedCourse && (
            <CourseDetailModal
               course={selectedCourse}
               onClose={() => setSelectedCourse(null)}
               onEnroll={() => onNavigate('get-started')}
               onViewInstructor={() => { /* Already on instructor page */ }}
            />
         )}

         {/* Header / Cover Section */}
         <div className="relative bg-white mb-12 pb-12">
            <div className="h-48 lg:h-64 w-full bg-gradient-to-r from-brand-600 to-brand-800 overflow-hidden relative">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="relative -mt-20 sm:-mt-24 flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-6 border-b border-slate-200">
                  <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white z-10">
                     <img src={avatarUrl} alt={instructor.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-grow text-center sm:text-left mb-4 sm:mb-0">
                     <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">{instructor.name}</h1>
                     <p className="text-brand-600 font-medium text-lg">{instructor.role}</p>

                     <div className="flex items-center justify-center sm:justify-start gap-4 mt-4 text-slate-500">
                        {instructor.socials?.linkedin && (
                           <a href={instructor.socials.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 transition-colors"><Linkedin size={20} /></a>
                        )}
                        {instructor.socials?.twitter && (
                           <a href={instructor.socials.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 transition-colors"><Twitter size={20} /></a>
                        )}
                        {instructor.socials?.website && (
                           <a href={instructor.socials.website} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 transition-colors"><Globe size={20} /></a>
                        )}
                        <a href="#" className="hover:text-brand-600 transition-colors"><Mail size={20} /></a>
                     </div>
                  </div>

                  <div className="flex-shrink-0 flex gap-3">
                     <Button onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}>
                        View Courses
                     </Button>
                     <Button variant="outline" onClick={() => onNavigate('courses')}>
                        Back to All Courses
                     </Button>
                  </div>
               </div>

               {/* Quick Stats */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
                  <div className="text-center sm:text-left">
                     <div className="text-sm text-slate-500 font-medium uppercase tracking-wide mb-1">Total Students</div>
                     <div className="text-2xl font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-2">
                        <Users size={20} className="text-brand-500" />
                        {instructor.students.toLocaleString()}
                     </div>
                  </div>
                  <div className="text-center sm:text-left">
                     <div className="text-sm text-slate-500 font-medium uppercase tracking-wide mb-1">Instructor Rating</div>
                     <div className="text-2xl font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-2">
                        <Star size={20} className="text-yellow-400 fill-current" />
                        {instructor.rating} <span className="text-sm text-slate-400 font-normal">/ 5.0</span>
                     </div>
                  </div>
                  <div className="text-center sm:text-left">
                     <div className="text-sm text-slate-500 font-medium uppercase tracking-wide mb-1">Reviews</div>
                     <div className="text-2xl font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-2">
                        <MessageSquare size={20} className="text-brand-500" />
                        {instructor.reviews}
                     </div>
                  </div>
                  <div className="text-center sm:text-left">
                     <div className="text-sm text-slate-500 font-medium uppercase tracking-wide mb-1">Courses</div>
                     <div className="text-2xl font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-2">
                        <BookOpen size={20} className="text-brand-500" />
                        {courses.length}
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Left Column: About & Skills */}
               <div className="space-y-8">
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                     <h3 className="text-xl font-bold text-slate-900 mb-4">About Me</h3>
                     <p className="text-slate-600 leading-relaxed">
                        {instructor.bio || "No biography available."}
                     </p>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                     <h3 className="text-xl font-bold text-slate-900 mb-4">Key Expertise</h3>
                     <div className="flex flex-wrap gap-2">
                        {instructor.skills && instructor.skills.length > 0 ? instructor.skills.map(skill => (
                           <span key={skill} className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-sm font-medium border border-brand-100">
                              {skill}
                           </span>
                        )) : (
                           <span className="text-slate-500 text-sm">No skills listed</span>
                        )}
                     </div>
                  </div>
               </div>

               {/* Right Column: Courses */}
               <div id="courses" className="lg:col-span-2">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                     <BookOpen className="text-brand-600" />
                     Courses by {instructor.name}
                  </h2>

                  <div className="space-y-6">
                     {courses.length > 0 ? courses.map(course => (
                        <div
                           key={course._id || course.id}
                           className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col sm:flex-row h-auto sm:h-48"
                           onClick={() => setSelectedCourse(mapCourseToCourseSummary(course))}
                        >
                           <div className="w-full sm:w-64 h-48 sm:h-full flex-shrink-0 relative">
                              <img src={course.thumbnail || course.image || '/placeholder.jpg'} alt={course.title} className="w-full h-full object-cover" />
                              <div className="absolute top-2 left-2">
                                 <span className="px-2 py-1 bg-white/90 backdrop-blur text-brand-700 text-xs font-bold rounded uppercase tracking-wide">
                                    {course.level}
                                 </span>
                              </div>
                           </div>
                           <div className="p-6 flex flex-col justify-between flex-grow">
                              <div>
                                 <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-brand-600 uppercase tracking-wide">{course.category}</span>
                                    <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                                       <Star size={14} className="fill-current" />
                                       {course.rating || 0}
                                    </div>
                                 </div>
                                 <h3 className="text-xl font-bold text-slate-900 mb-2 hover:text-brand-600 transition-colors">
                                    {course.title}
                                 </h3>
                                 <p className="text-slate-600 text-sm line-clamp-2 mb-4">
                                    {course.description}
                                 </p>
                              </div>

                              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                 <div className="flex gap-4 text-xs text-slate-500 font-medium">
                                    <span className="flex items-center gap-1"><Clock size={14} /> {course.duration || 'N/A'}</span>
                                    <span className="flex items-center gap-1"><Users size={14} /> {(course.students || 0).toLocaleString()}</span>
                                 </div>
                                 <div className="text-lg font-bold text-slate-900">
                                    {typeof course.price === 'number' ? `₹${course.price}` : course.price || 'Free'}
                                 </div>
                              </div>
                           </div>
                        </div>
                     )) : (
                        <div className="text-center py-10 text-slate-500">No courses found</div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};
