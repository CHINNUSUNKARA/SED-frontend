




import React, { useState } from 'react';
import { ViewState } from '../../App';
import {
   LayoutDashboard, BookOpen, Calendar, FileText, Award, Settings, LogOut,
   Bell, Search, PlayCircle, CheckCircle, Clock, User, Menu, X, ChevronRight,
   Video, Download, Star, TrendingUp, ArrowRight, MoreHorizontal, ChevronLeft, Lock, HelpCircle, Check, Trash2, Upload, AlertCircle, ShoppingCart
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { userService, UserProfile, Assignment, ScheduleEvent, Certificate, Notification } from '../../services/userService';
import { fetchCourses, CourseSummary } from '../../services/courseService';

interface StudentDashboardProps {
   onNavigate: (view: ViewState) => void;
}

type StudentTab = 'dashboard' | 'my-courses' | 'schedule' | 'assignments' | 'certificates' | 'settings';

interface EnrolledCourse extends CourseSummary {
   progress: number;
   nextLesson: string;
   lastAccessed?: string;
}

// Mock Student Data
// Mock data removed. Using dynamic data from userService.


export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
   const [activeTab, setActiveTab] = useState<StudentTab>('dashboard');
   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
   const [viewingCourseId, setViewingCourseId] = useState<string | number | null>(null);
   const [selectedScheduleItem, setSelectedScheduleItem] = useState<ScheduleEvent | null>(null);
   const [submissionLoading, setSubmissionLoading] = useState<string | null>(null); // assignment ID being submitted
   const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
   const [selectedAssignmentForSubmission, setSelectedAssignmentForSubmission] = useState<Assignment | null>(null);

   const [profile, setProfile] = useState<UserProfile | null>(null);
   const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
   const [assignments, setAssignments] = useState<Assignment[]>([]);
   const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
   const [certificates, setCertificates] = useState<Certificate[]>([]);

   const [notifications, setNotifications] = useState<Notification[]>([]);
   const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
   const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
   const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
   const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread'>('all');
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   // Course Browsing Modal State
   const [isCourseBrowsingOpen, setIsCourseBrowsingOpen] = useState(false);
   const [availableCourses, setAvailableCourses] = useState<CourseSummary[]>([]);
   const [coursesLoading, setCoursesLoading] = useState(false);

   React.useEffect(() => {
      const fetchData = async () => {
         try {
            const [userProfile, userCourses, userAssignments, userSchedule, userCerts, userNotifications] = await Promise.all([
               userService.getProfile(),
               userService.getEnrolledCourses(),
               userService.getAssignments(),
               userService.getSchedule(),
               userService.getCertificates(),
               userService.getNotifications()
            ]);
            setProfile(userProfile);
            setEnrolledCourses(userCourses);
            setAssignments(userAssignments);
            setSchedule(userSchedule);
            setCertificates(userCerts);
            setNotifications(userNotifications);
            setHasUnreadNotifications(userNotifications.some(n => !n.read));
         } catch (err: any) {
            console.error("Dashboard data fetch error:", err);
            setError(err.response?.data?.message || err.message || "Failed to load dashboard data");
         } finally {
            setLoading(false);
         }
      };
      fetchData();
   }, []);

   if (loading) {
      return (
         <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center">
               <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
               <p className="text-slate-600 font-medium">Loading Dashboard...</p>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
               <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X size={32} />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Profile</h3>
               <p className="text-slate-600 mb-6">{error}</p>
               <Button onClick={() => window.location.reload()} className="w-full">
                  Retry
               </Button>
            </div>
         </div>
      );
   }

   // Safe profile check
   if (!profile) return <div>Error loading profile (No profile data)</div>;


   const SidebarItem = ({ id, icon: Icon, label }: { id: StudentTab, icon: any, label: string }) => (
      <button
         onClick={() => {
            setActiveTab(id);
            setViewingCourseId(null); // Reset view when switching tabs
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
         }}
         className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === id
            ? 'bg-brand-600 text-white shadow-md'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
      >
         <Icon size={20} />
         <span className="font-medium">{label}</span>
      </button>
   );

   const handleOpenSubmissionModal = (assignment: Assignment) => {
      setSelectedAssignmentForSubmission(assignment);
      setIsSubmissionModalOpen(true);
   };

   const handleSubmitAssignment = async (text: string, fileUrl?: string) => {
      if (!selectedAssignmentForSubmission) return;

      try {
         setSubmissionLoading(selectedAssignmentForSubmission.id);
         await userService.submitAssignment(selectedAssignmentForSubmission.id, text, fileUrl);

         // Show success (could be a toast, using alert for now but cleaner)
         alert("Assignment submitted successfully!");

         // Refresh assignments
         const newAssignments = await userService.getAssignments();
         setAssignments(newAssignments);
         setIsSubmissionModalOpen(false);
         setSelectedAssignmentForSubmission(null);
      } catch (err) {
         console.error("Failed to submit assignment", err);
         alert("Failed to submit assignment. Please try again.");
      } finally {
         setSubmissionLoading(null);
      }
   };

   return (
      <div className="min-h-screen bg-slate-50 flex relative">

         {/* Course Browsing Modal */}
         {isCourseBrowsingOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
               <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[90vh]">
                  {/* Header */}
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-brand-600 to-blue-500 text-white flex-shrink-0">
                     <div>
                        <h3 className="text-2xl font-bold flex items-center gap-2">
                           <BookOpen size={28} />
                           Browse Courses
                        </h3>
                        <p className="text-brand-100 mt-1">Explore our catalog and start learning today</p>
                     </div>
                     <button
                        onClick={() => setIsCourseBrowsingOpen(false)}
                        className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                     >
                        <X size={28} />
                     </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                     {coursesLoading ? (
                        <div className="flex items-center justify-center py-20">
                           <div className="text-center">
                              <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                              <p className="text-slate-600 font-medium">Loading courses...</p>
                           </div>
                        </div>
                     ) : availableCourses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                           <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                              <BookOpen size={40} className="text-slate-400" />
                           </div>
                           <h4 className="text-xl font-bold text-slate-900 mb-2">No courses available</h4>
                           <p className="text-slate-500 max-w-md">Check back later for new courses.</p>
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {availableCourses.map((course) => (
                              <div
                                 key={course._id}
                                 className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group"
                              >
                                 {/* Course Image */}
                                 <div className="h-48 relative overflow-hidden bg-slate-100">
                                    <img
                                       src={course.image || '/placeholder.jpg'}
                                       alt={course.title}
                                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm font-bold text-brand-600 shadow-md">
                                       {course.price}
                                    </div>
                                    {course.level && (
                                       <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white">
                                          {course.level}
                                       </div>
                                    )}
                                 </div>

                                 {/* Course Info */}
                                 <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-2">
                                       {course.category && (
                                          <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-1 rounded">
                                             {course.category}
                                          </span>
                                       )}
                                    </div>

                                    <h4 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">
                                       {course.title}
                                    </h4>

                                    {course.description && (
                                       <p className="text-sm text-slate-600 mb-4 line-clamp-2 flex-1">
                                          {course.description}
                                       </p>
                                    )}

                                    {/* Course Meta */}
                                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 pb-4 border-b border-slate-100">
                                       {course.lessons && (
                                          <div className="flex items-center gap-1">
                                             <PlayCircle size={14} />
                                             <span>{course.lessons} Lessons</span>
                                          </div>
                                       )}
                                       {course.duration && (
                                          <div className="flex items-center gap-1">
                                             <Clock size={14} />
                                             <span>{course.duration}</span>
                                          </div>
                                       )}
                                       {course.rating && (
                                          <div className="flex items-center gap-1">
                                             <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                             <span>{course.rating}</span>
                                          </div>
                                       )}
                                    </div>

                                    {/* Instructor */}
                                    {course.instructor && (
                                       <div className="flex items-center gap-2 mb-4">
                                          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm">
                                             {course.instructor.charAt(0)}
                                          </div>
                                          <div>
                                             <p className="text-xs text-slate-500">Instructor</p>
                                             <p className="text-sm font-semibold text-slate-900">{course.instructor}</p>
                                          </div>
                                       </div>
                                    )}

                                    {/* Enroll Button */}
                                    <Button
                                       className="w-full group-hover:shadow-lg transition-shadow"
                                       onClick={() => {
                                          // Here you would implement enrollment logic
                                          alert(`Enrolling in: ${course.title}`);
                                          setIsCourseBrowsingOpen(false);
                                       }}
                                    >
                                       <ShoppingCart size={16} className="mr-2" />
                                       Enroll Now
                                    </Button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center flex-shrink-0">
                     <p className="text-sm text-slate-600">
                        Showing <span className="font-bold text-slate-900">{availableCourses.length}</span> courses
                     </p>
                     <Button variant="outline" onClick={() => setIsCourseBrowsingOpen(false)}>
                        Close
                     </Button>
                  </div>
               </div>
            </div>
         )}

         {/* Schedule Detail Modal */}
         {selectedScheduleItem && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                  {/* Header */}
                  <div className="flex justify-between items-center p-6 border-b border-slate-100">
                     <h3 className="text-xl font-bold text-slate-900">Event Details</h3>
                     <button onClick={() => setSelectedScheduleItem(null)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                     </button>
                  </div>
                  {/* Content */}
                  <div className="p-6 space-y-4">
                     <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${selectedScheduleItem.type === 'Live Class' ? 'bg-red-100 text-red-600' :
                        selectedScheduleItem.type === 'Deadline' ? 'bg-orange-100 text-orange-600' :
                           'bg-blue-100 text-blue-600'
                        }`}>
                        {selectedScheduleItem.type}
                     </span>
                     <h4 className="text-xl font-bold text-slate-900">{selectedScheduleItem.title}</h4>

                     <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-3 text-slate-600">
                           <Calendar size={18} className="text-brand-500" />
                           <span className="font-medium">{selectedScheduleItem.date}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                           <Clock size={18} className="text-brand-500" />
                           <span className="font-medium">{selectedScheduleItem.time}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                           <User size={18} className="text-brand-500" />
                           <span className="font-medium">Instructor: {selectedScheduleItem.instructor || 'TBD'}</span>
                        </div>
                     </div>

                     <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-600 mt-4">
                        <p className="font-bold text-slate-900 mb-1">Description</p>
                        <p>This is a scheduled {selectedScheduleItem.type.toLowerCase()} for your course. Please ensure you are prepared with any necessary materials and join on time.</p>
                     </div>
                  </div>
                  {/* Footer */}
                  <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                     <Button variant="outline" onClick={() => setSelectedScheduleItem(null)}>Close</Button>
                     {selectedScheduleItem.type === 'Live Class' && (
                        <Button className="bg-red-600 hover:bg-red-700 border-none">
                           <Video size={16} className="mr-2" /> Join Now
                        </Button>
                     )}
                     {selectedScheduleItem.type === 'Meeting' && (
                        <Button className="bg-brand-600 hover:bg-brand-700">
                           <Video size={16} className="mr-2" /> Join Meeting
                        </Button>
                     )}
                  </div>
               </div>
            </div>
         )}


         {/* Submission Modal */}
         {isSubmissionModalOpen && selectedAssignmentForSubmission && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                     <div>
                        <h3 className="text-xl font-bold text-slate-900">Submit Assignment</h3>
                        <p className="text-sm text-slate-500 mt-1">{selectedAssignmentForSubmission.title}</p>
                     </div>
                     <button
                        onClick={() => setIsSubmissionModalOpen(false)}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                     >
                        <X size={24} />
                     </button>
                  </div>

                  <div className="p-6 space-y-6">
                     <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3 text-blue-800 text-sm">
                        <AlertCircle size={20} className="flex-shrink-0" />
                        <p>Ensure your submission meets the requirements. Once submitted, it will be sent to your instructor for grading.</p>
                     </div>

                     <form id="submission-form" onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        handleSubmitAssignment(formData.get('text') as string, formData.get('fileUrl') as string);
                     }}>
                        <div className="space-y-4">
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Text / Link Submission</label>
                              <textarea
                                 name="text"
                                 required
                                 className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-shadow"
                                 rows={4}
                                 placeholder="Enter your answer, reflection, or link to your work here..."
                              ></textarea>
                           </div>

                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Attachment (Optional)</label>
                              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                                 <Upload size={32} className="mx-auto text-slate-400 group-hover:text-brand-500 mb-2 transition-colors" />
                                 <p className="text-sm text-slate-600 font-medium">Click to upload file</p>
                                 <p className="text-xs text-slate-400 mt-1">PDF, DOCX, ZIP up to 10MB</p>
                                 {/* Hidden input for visual demo */}
                                 <input type="file" className="hidden" />
                              </div>
                           </div>
                        </div>
                     </form>
                  </div>

                  <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                     <Button variant="outline" onClick={() => setIsSubmissionModalOpen(false)} type="button">Cancel</Button>
                     <Button type="submit" form="submission-form" disabled={!!submissionLoading} className="min-w-[120px]">
                        {submissionLoading ? (
                           <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div> Sending...</>
                        ) : (
                           <>Submit Work</>
                        )}
                     </Button>
                  </div>
               </div>
            </div>
         )}

         {isNotificationsModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
                  {/* Header */}
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white flex-shrink-0">
                     <div>
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                           <Bell className="text-brand-600" size={24} />
                           Notifications
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">Updates on your courses and platform announcements.</p>
                     </div>
                     <button
                        onClick={() => setIsNotificationsModalOpen(false)}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                     >
                        <X size={24} />
                     </button>
                  </div>

                  {/* Filter Tabs */}
                  <div className="px-6 pt-4 border-b border-slate-100 flex gap-6 flex-shrink-0">
                     <button
                        onClick={() => setNotificationFilter('all')}
                        className={`pb-3 text-sm font-semibold transition-colors relative ${notificationFilter === 'all'
                           ? 'text-brand-600'
                           : 'text-slate-500 hover:text-slate-700'
                           }`}
                     >
                        All
                        {notificationFilter === 'all' && (
                           <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-600 rounded-t-full"></span>
                        )}
                     </button>
                     <button
                        onClick={() => setNotificationFilter('unread')}
                        className={`pb-3 text-sm font-semibold transition-colors relative ${notificationFilter === 'unread'
                           ? 'text-brand-600'
                           : 'text-slate-500 hover:text-slate-700'
                           }`}
                     >
                        Unread
                        {notificationFilter === 'unread' && (
                           <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-600 rounded-t-full"></span>
                        )}
                     </button>
                  </div>

                  {/* List */}
                  <div className="overflow-y-auto flex-1 p-6 bg-slate-50">
                     {(() => {
                        const filtered = notifications.filter(n => {
                           if (notificationFilter === 'unread') return !n.read;
                           return true;
                        });

                        if (filtered.length === 0) {
                           return (
                              <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl border border-slate-100 shadow-sm mx-4 mb-4">
                                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 relative">
                                    <Bell size={32} className="text-slate-300" />
                                    <span className="absolute top-0 right-0 p-2 bg-white rounded-full">
                                       <div className="w-3 h-3 bg-brand-500 rounded-full animate-ping"></div>
                                    </span>
                                 </div>
                                 <h3 className="text-xl font-bold text-slate-900 mb-2">No notifications yet</h3>
                                 <p className="text-slate-500 max-w-md mx-auto leading-relaxed mb-6">
                                    {notificationFilter === 'unread' ? "You've read all your important messages." : "When you get new assignments, course updates, or messages, they will appear here."}
                                 </p>
                                 {notificationFilter !== 'all' && (
                                    <Button variant="outline" onClick={() => setNotificationFilter('all')}>
                                       View all notifications
                                    </Button>
                                 )}
                              </div>
                           );
                        }

                        return (
                           <div className="space-y-3">
                              {filtered.map((notif, idx) => (
                                 <div key={idx} className={`group relative p-4 rounded-xl border transition-all hover:shadow-md hover:border-brand-200 ${!notif.read ? 'bg-white border-brand-100 shadow-sm' : 'bg-white/50 border-slate-200'}`}>
                                    <div className="flex gap-4">
                                       <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${!notif.read ? 'bg-blue-100 text-brand-600 group-hover:bg-brand-200' : 'bg-slate-100 text-slate-500'}`}>
                                          <Bell size={20} />
                                       </div>
                                       <div className="flex-1">
                                          <div className="flex justify-between items-start mb-1">
                                             <h5 className={`text-sm font-semibold truncate pr-2 ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>{notif.title}</h5>
                                             <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                                                {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                             </span>
                                          </div>
                                          <p className="text-sm text-slate-600 mb-2 leading-relaxed line-clamp-2">{notif.message}</p>

                                          <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                             {!notif.read && (
                                                <button
                                                   onClick={async (e) => {
                                                      e.stopPropagation();
                                                      await userService.markNotificationAsRead(notif._id);
                                                      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
                                                   }}
                                                   className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-800 transition-colors"
                                                >
                                                   <Check size={14} /> Mark as read
                                                </button>
                                             )}
                                          </div>
                                       </div>
                                       {!notif.read && (
                                          <div className="absolute top-4 right-4 w-2 h-2 bg-brand-500 rounded-full"></div>
                                       )}
                                    </div>
                                 </div>
                              ))}
                           </div>
                        );
                     })()}
                  </div>
               </div>
            </div>
         )}

         {/* Sidebar */}
         <aside
            className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-64 flex-shrink-0'
               }`}
         >
            <div className="h-full flex flex-col">
               <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
                     <img src="/logo-sed.png" alt="SED" className="w-8 h-8 rounded-lg" />
                     <span className="text-xl font-display font-bold">SED<span className="text-brand-500">.</span></span>
                  </div>
                  <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400">
                     <X size={24} />
                  </button>
               </div>

               <div className="px-6 py-2">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 border border-slate-700">
                     <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-lg font-bold">
                        {profile.avatarUrl ? <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full rounded-full" /> : (profile.name ? profile.name.charAt(0) : 'U')}
                     </div>
                     <div className="overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">{profile.name}</p>
                        <p className="text-xs text-slate-400 truncate">Student Account</p>
                     </div>
                  </div>
               </div>

               <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
                  <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
                  <SidebarItem id="my-courses" icon={BookOpen} label="My Courses" />
                  <SidebarItem id="assignments" icon={FileText} label="Assignments" />
                  <SidebarItem id="schedule" icon={Calendar} label="Schedule" />
                  <SidebarItem id="certificates" icon={Award} label="Certificates" />
                  <SidebarItem id="settings" icon={Settings} label="Settings" />
               </nav>

               <div className="p-4 border-t border-slate-800">
                  <button
                     onClick={() => onNavigate('login')}
                     className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-red-900/20 hover:text-red-500 transition-colors"
                  >
                     <LogOut size={20} />
                     <span className="font-medium">Log Out</span>
                  </button>
               </div>
            </div>
         </aside>

         {/* Main Content */}
         <main className="flex-1 flex flex-col h-screen overflow-hidden w-full">

            {/* Top Header */}
            <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 lg:px-8 z-40 flex-shrink-0">
               <div className="flex items-center gap-4">
                  <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-500">
                     <Menu size={24} />
                  </button>
                  <h2 className="text-xl font-bold text-slate-800 capitalize">
                     {activeTab === 'my-courses' ? 'My Courses' : activeTab}
                  </h2>
               </div>

               <div className="flex items-center gap-4 sm:gap-6">
                  <div className="relative hidden md:block">
                     <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                     <input
                        type="text"
                        placeholder="Search courses, lessons..."
                        className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-64"
                     />
                  </div>
                  <div className="relative">
                     <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className={`relative text-slate-500 hover:text-slate-700 transition-colors p-2 rounded-full hover:bg-slate-100 ${isNotificationsOpen || hasUnreadNotifications ? 'text-brand-600 bg-brand-50' : ''}`}
                     >
                        <Bell size={20} className={hasUnreadNotifications ? "animate-swing" : ""} />
                        {hasUnreadNotifications && (
                           <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        )}
                     </button>

                     {/* Notification Dropdown */}
                     {isNotificationsOpen && (
                        <>
                           <div className="fixed inset-0 z-[40]" onClick={() => setIsNotificationsOpen(false)}></div>
                           <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-slate-100 ring-1 ring-slate-200/50 z-[50] overflow-hidden animate-fade-in-up origin-top-right">
                              <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
                                 <h4 className="font-bold text-slate-900 text-sm">Notifications</h4>
                                 <button
                                    onClick={async () => {
                                       try {
                                          await userService.markNotificationAsRead('all'); // Assuming backend supports this or loop
                                          // For now loop through
                                          const unread = notifications.filter(n => !n.read);
                                          await Promise.all(unread.map(n => userService.markNotificationAsRead(n._id)));

                                          setHasUnreadNotifications(false);
                                          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                                       } catch (err) {
                                          console.error("Failed to mark notifications read", err);
                                       }
                                    }}
                                    className="text-xs text-brand-600 hover:text-brand-700 font-bold hover:underline"
                                 >
                                    Mark all read
                                 </button>
                              </div>
                              <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                                 {notifications.length === 0 ? (
                                    <div className="p-10 text-center flex flex-col items-center gap-3">
                                       <div className="p-3 bg-slate-50 rounded-full text-slate-300"><Bell size={24} /></div>
                                       <p className="text-slate-500 text-sm font-medium">No new notifications</p>
                                    </div>
                                 ) : (
                                    notifications.slice(0, 5).map((notif, idx) => (
                                       <div key={idx} className={`p-4 border-b border-slate-50 hover:bg-slate-50/80 transition-colors cursor-pointer group ${!notif.read ? 'bg-brand-50/30' : ''}`}>
                                          <div className="flex gap-3 items-start">
                                             <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notif.read ? 'bg-brand-500' : 'bg-transparent'}`}></div>
                                             <div>
                                                <p className="text-sm text-slate-800 font-semibold mb-1 group-hover:text-brand-700 transition-colors">{notif.title}</p>
                                                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{notif.message}</p>
                                                <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                                                   {new Date(notif.createdAt).toLocaleDateString()}
                                                </span>
                                             </div>
                                          </div>
                                       </div>
                                    ))
                                 )}
                              </div>
                              <div className="p-2 bg-slate-50/80 backdrop-blur-sm border-t border-slate-100">
                                 <button
                                    onClick={() => {
                                       setIsNotificationsOpen(false);
                                       setIsNotificationsModalOpen(true);
                                    }}
                                    className="w-full py-2 text-xs font-bold text-brand-600 hover:text-brand-700 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-200"
                                 >
                                    View All Notifications
                                 </button>
                              </div>
                           </div>
                        </>
                     )}
                  </div>
                  <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
                  <button onClick={() => onNavigate('home')} className="text-sm font-medium text-brand-600 hover:text-brand-700 hidden sm:block">
                     Back to Website
                  </button>
               </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">

               {/* Dashboard Overview */}
               {activeTab === 'dashboard' && (
                  <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">

                     {/* Welcome Banner */}
                     <div className="bg-gradient-to-r from-brand-600 to-blue-500 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
                        <div className="relative z-10">
                           <h1 className="text-3xl font-display font-bold mb-2">Hello, {profile.name}! 👋</h1>
                           <p className="text-brand-100 text-lg mb-6">Welcome back to your learning journey! Keep up the great work.</p>

                           {enrolledCourses.length > 0 && (
                              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-xl inline-block max-w-md">
                                 <p className="text-xs text-brand-200 uppercase font-bold mb-1">Continue Learning</p>
                                 <h3 className="font-bold text-lg mb-1">{enrolledCourses[0].title}</h3>
                                 <p className="text-sm text-white/80 mb-3">Next: {enrolledCourses[0].nextLesson}</p>
                                 <Button size="sm" className="bg-white text-brand-600 hover:bg-brand-50 border-none">
                                    <PlayCircle size={16} className="mr-2" /> Resume
                                 </Button>
                              </div>
                           )}
                        </div>
                     </div>

                     {/* Stats Grid */}
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                           <div className="flex justify-between items-start mb-4">
                              <div className="p-3 rounded-lg bg-blue-50 text-blue-600"><BookOpen size={24} /></div>
                              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">Active</span>
                           </div>
                           <h3 className="text-3xl font-bold text-slate-900 mb-1">{enrolledCourses.filter(c => c.progress < 100).length}</h3>
                           <p className="text-sm text-slate-500">Courses in Progress</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                           <div className="flex justify-between items-start mb-4">
                              <div className="p-3 rounded-lg bg-green-50 text-green-600"><CheckCircle size={24} /></div>
                              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">Done</span>
                           </div>
                           <h3 className="text-3xl font-bold text-slate-900 mb-1">{enrolledCourses.filter(c => c.progress === 100).length}</h3>
                           <p className="text-sm text-slate-500">Courses Completed</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                           <div className="flex justify-between items-start mb-4">
                              <div className="p-3 rounded-lg bg-purple-50 text-purple-600"><Award size={24} /></div>
                              <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">Earned</span>
                           </div>
                           <h3 className="text-3xl font-bold text-slate-900 mb-1">{certificates.length}</h3>
                           <p className="text-sm text-slate-500">Certificates</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                           <div className="flex justify-between items-start mb-4">
                              <div className="p-3 rounded-lg bg-orange-50 text-orange-600"><Clock size={24} /></div>
                              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">Est. Total</span>
                           </div>
                           <h3 className="text-3xl font-bold text-slate-900 mb-1">
                              {Math.round(enrolledCourses.reduce((acc, curr) => acc + (curr.progress / 100 * (curr.lessons || 0) * 1.5), 0))}h
                           </h3>
                           <p className="text-sm text-slate-500">Learning Time</p>
                        </div>
                     </div>

                     {/* My Progress Section (New) */}
                     <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                           <div>
                              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                 <TrendingUp className="text-brand-600" size={20} /> My Learning Progress
                              </h3>
                              <p className="text-sm text-slate-500 mt-1">Track your completion status across all enrolled courses.</p>
                           </div>
                           <Button variant="ghost" size="sm" onClick={() => setActiveTab('my-courses')}>
                              View All Courses <ArrowRight size={16} className="ml-1" />
                           </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                           {enrolledCourses.map((course) => {
                              const completedLessons = Math.round((course.progress / 100) * (course.lessons || 0));
                              return (
                                 <div key={course.id} className="relative">
                                    <div className="flex justify-between items-end mb-2">
                                       <div>
                                          <h4 className="font-bold text-slate-900 text-sm line-clamp-1" title={course.title}>{course.title}</h4>
                                          <p className="text-xs text-slate-500">{completedLessons}/{course.lessons} Lessons</p>
                                       </div>
                                       <span className={`text-sm font-bold ${course.progress === 100 ? 'text-green-600' :
                                          course.progress > 50 ? 'text-brand-600' :
                                             'text-orange-500'
                                          }`}>{course.progress}%</span>
                                    </div>

                                    <div className="w-full bg-slate-100 rounded-full h-2.5 mb-3 overflow-hidden">
                                       <div
                                          style={{ width: `${course.progress}%` }}
                                          className={`h-2.5 rounded-full transition-all duration-1000 ${course.progress === 100 ? 'bg-green-500' :
                                             course.progress > 50 ? 'bg-brand-500' :
                                                'bg-orange-400'
                                             }`}
                                       ></div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                       <span className="flex items-center gap-1"><Clock size={10} /> Last: {course.lastAccessed}</span>
                                       {course.progress === 100 ? (
                                          <span className="flex items-center gap-1 text-green-600 font-medium"><Award size={12} /> Certified</span>
                                       ) : (
                                          <span
                                             className="font-medium text-brand-600 cursor-pointer hover:underline"
                                             onClick={() => {
                                                setActiveTab('my-courses');
                                                setViewingCourseId(String(course.id));
                                             }}
                                          >
                                             Resume
                                          </span>
                                       )}
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Upcoming Schedule */}
                        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                           <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                              <h3 className="font-bold text-slate-900 text-lg">Upcoming Schedule</h3>
                              <Button variant="ghost" size="sm" onClick={() => setActiveTab('schedule')}>View All</Button>
                           </div>
                           <div className="divide-y divide-slate-100">
                              {schedule.map((item) => (
                                 <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedScheduleItem(item)}>
                                    <div className="flex-shrink-0 w-14 text-center bg-slate-50 rounded-lg border border-slate-100 p-2">
                                       <div className="text-xs text-slate-500 uppercase font-bold">{item.date.split(' ')[0].substring(0, 3)}</div>
                                       <div className="text-lg font-bold text-slate-900">{item.date.match(/\d+/) || '12'}</div>
                                    </div>
                                    <div className="flex-grow">
                                       <h4 className="font-bold text-slate-900">{item.title}</h4>
                                       <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.type === 'Live Class' ? 'bg-red-100 text-red-600' :
                                             item.type === 'Deadline' ? 'bg-orange-100 text-orange-600' :
                                                'bg-blue-100 text-blue-600'
                                             }`}>
                                             {item.type}
                                          </span>
                                          <span>•</span>
                                          <Clock size={14} />
                                          <span>{item.time}</span>
                                       </div>
                                    </div>
                                    <Button size="sm" variant="outline" className="hidden sm:flex" onClick={(e) => { e.stopPropagation(); setSelectedScheduleItem(item); }}>
                                       {item.type === 'Live Class' ? 'Join' : 'Details'}
                                    </Button>
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* Assignments */}
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                           <div className="p-6 border-b border-slate-100">
                              <h3 className="font-bold text-slate-900 text-lg">Assignments</h3>
                           </div>
                           <div className="divide-y divide-slate-100">
                              {assignments.slice(0, 3).map((assignment) => (
                                 <div key={assignment.id} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                       <span className={`text-xs font-bold px-2 py-1 rounded-full ${assignment.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                          assignment.status === 'Submitted' ? 'bg-blue-100 text-blue-700' :
                                             'bg-green-100 text-green-700'
                                          }`}>
                                          {assignment.status}
                                       </span>
                                       <span className="text-xs text-slate-500">{assignment.dueDate}</span>
                                    </div>
                                    <h4 className="font-medium text-slate-900 text-sm line-clamp-1 mb-1">{assignment.title}</h4>
                                    <p className="text-xs text-slate-500 line-clamp-1">{assignment.course}</p>
                                 </div>
                              ))}
                              <div className="p-4 text-center">
                                 <Button variant="ghost" size="sm" className="w-full" onClick={() => setActiveTab('assignments')}>See All Assignments</Button>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* My Courses Tab */}
               {activeTab === 'my-courses' && (
                  <div className="max-w-6xl mx-auto animate-fade-in-up">
                     {!viewingCourseId ? (
                        <>
                           <div className="flex justify-between items-center mb-8">
                              <div>
                                 <h2 className="text-2xl font-bold text-slate-900">My Courses</h2>
                                 <p className="text-slate-500">Manage and continue your learning journey.</p>
                              </div>
                              <div className="flex gap-2">
                                 <Button variant="outline" size="sm">In Progress</Button>
                                 <Button variant="ghost" size="sm">Completed</Button>
                              </div>
                           </div>

                           {enrolledCourses.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
                                 <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-4">
                                    <BookOpen size={32} className="text-brand-600" />
                                 </div>
                                 <h3 className="text-xl font-bold text-slate-900 mb-2">No courses found</h3>
                                 <p className="text-slate-500 max-w-md mb-6">You are not enrolled in any courses yet. Explore our catalog to start learning today.</p>
                                 <Button onClick={async () => {
                                    setIsCourseBrowsingOpen(true);
                                    setCoursesLoading(true);
                                    try {
                                       const courses = await fetchCourses();
                                       setAvailableCourses(courses);
                                    } catch (err) {
                                       console.error('Failed to fetch courses:', err);
                                    } finally {
                                       setCoursesLoading(false);
                                    }
                                 }}>
                                    Browse Courses
                                 </Button>
                              </div>
                           ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 {enrolledCourses.map((course) => (
                                    <div
                                       key={course.id}
                                       className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow"
                                       onClick={() => setViewingCourseId(String(course.id))}
                                    >
                                       <div className="h-40 relative">
                                          <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                             <Button className="rounded-full pointer-events-none"><PlayCircle size={20} className="mr-2" /> Continue</Button>
                                          </div>
                                          <div className="absolute bottom-4 left-4 right-4">
                                             <div className="flex justify-between text-xs font-bold text-white mb-1">
                                                <span>{course.progress}% Completed</span>
                                                <span>{course.lessons} Lessons</span>
                                             </div>
                                             <div className="w-full bg-white/30 rounded-full h-1.5 backdrop-blur-sm">
                                                <div style={{ width: `${course.progress}%` }} className="bg-green-400 h-1.5 rounded-full"></div>
                                             </div>
                                          </div>
                                       </div>
                                       <div className="p-6 flex-grow flex flex-col">
                                          <div className="flex justify-between items-start mb-2">
                                             <span className="text-xs font-bold text-brand-600 uppercase tracking-wide bg-brand-50 px-2 py-1 rounded">{course.category}</span>
                                             <div className="flex items-center text-yellow-500 text-xs font-bold">
                                                <Star size={12} className="fill-current mr-1" /> {course.rating}
                                             </div>
                                          </div>
                                          <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-1 group-hover:text-brand-600 transition-colors">{course.title}</h3>
                                          <p className="text-sm text-slate-500 mb-4 line-clamp-2">{course.description}</p>

                                          <div className="mt-auto pt-4 border-t border-slate-100">
                                             {course.progress === 100 ? (
                                                <div className="flex items-center text-green-600 text-sm font-bold">
                                                   <CheckCircle size={16} className="mr-2" /> Course Completed
                                                   <span className="ml-auto text-xs text-slate-400 font-normal"> Rated 5.0</span>
                                                </div>
                                             ) : (
                                                <div>
                                                   <p className="text-xs text-slate-400 uppercase font-bold mb-1">Up Next</p>
                                                   <div className="flex justify-between items-center">
                                                      <p className="text-sm font-medium text-slate-800 truncate max-w-[70%]">{course.nextLesson}</p>
                                                      <span className="text-brand-600 text-sm font-bold flex items-center">
                                                         Start <ChevronRight size={16} />
                                                      </span>
                                                   </div>
                                                </div>
                                             )}
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           )}
                        </>
                     ) : (
                        /* Detailed Course View */
                        <div className="animate-fade-in-up">
                           {/* Nav Back */}
                           <button
                              onClick={() => setViewingCourseId(null)}
                              className="flex items-center text-slate-500 hover:text-slate-900 mb-6 font-medium"
                           >
                              <ChevronLeft size={20} className="mr-1" /> Back to Courses
                           </button>

                           {(() => {
                              const course = enrolledCourses.find(c => String(c.id) === String(viewingCourseId));
                              // Default progress details if not available
                              const details = {
                                 totalTimeSpent: '2h 15m',
                                 quizAverage: '0%',
                                 modules: [
                                    { id: 1, title: 'Introduction', status: 'In Progress', score: '-', duration: '45m', lessons: 3, current: true },
                                    { id: 2, title: 'Core Concepts', status: 'Locked', score: '-', duration: '1h 30m', lessons: 5 },
                                 ]
                              };

                              if (!course) return <div>Course not found</div>;

                              return (
                                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Main Content */}
                                    <div className="lg:col-span-2 space-y-6">
                                       {/* Header Card */}
                                       <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                          <div className="h-32 bg-slate-900 relative">
                                             <img src={course.image} alt={course.title} className="w-full h-full object-cover opacity-40" />
                                             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                                             <div className="absolute bottom-6 left-6 text-white">
                                                <div className="flex gap-2 mb-2">
                                                   <span className="bg-brand-600 text-white text-xs font-bold px-2 py-0.5 rounded uppercase">{course.category}</span>
                                                </div>
                                                <h1 className="text-2xl font-bold">{course.title}</h1>
                                             </div>
                                          </div>
                                          <div className="p-6">
                                             <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-bold text-slate-700">Overall Progress</span>
                                                <span className="text-sm font-bold text-brand-600">{course.progress}%</span>
                                             </div>
                                             <div className="w-full bg-slate-100 rounded-full h-3 mb-6">
                                                <div style={{ width: `${course.progress}%` }} className="bg-brand-600 h-3 rounded-full relative overflow-hidden">
                                                   <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]"></div>
                                                </div>
                                             </div>

                                             <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-6">
                                                <div className="text-center">
                                                   <div className="flex items-center justify-center text-slate-400 mb-1"><Clock size={16} /></div>
                                                   <p className="font-bold text-slate-900">{details.totalTimeSpent}</p>
                                                   <p className="text-xs text-slate-500">Time Spent</p>
                                                </div>
                                                <div className="text-center border-l border-slate-100">
                                                   <div className="flex items-center justify-center text-slate-400 mb-1"><HelpCircle size={16} /></div>
                                                   <p className="font-bold text-slate-900">{details.quizAverage}</p>
                                                   <p className="text-xs text-slate-500">Quiz Avg.</p>
                                                </div>
                                                <div className="text-center border-l border-slate-100">
                                                   <div className="flex items-center justify-center text-slate-400 mb-1"><Award size={16} /></div>
                                                   <p className="font-bold text-slate-900">{course.progress === 100 ? 'Yes' : 'No'}</p>
                                                   <p className="text-xs text-slate-500">Certified</p>
                                                </div>
                                             </div>
                                          </div>
                                       </div>

                                       {/* Curriculum / Modules */}
                                       <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                          <div className="p-6 border-b border-slate-100">
                                             <h3 className="font-bold text-slate-900 text-lg">Curriculum Progress</h3>
                                          </div>
                                          <div className="divide-y divide-slate-100">
                                             {details.modules.map((module: any, idx: number) => (
                                                <div key={idx} className={`p-4 flex items-center gap-4 transition-colors ${module.current ? 'bg-brand-50' : 'hover:bg-slate-50'}`}>
                                                   <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${module.status === 'Completed' ? 'bg-green-100 text-green-600' :
                                                      module.status === 'In Progress' ? 'bg-brand-100 text-brand-600' :
                                                         'bg-slate-100 text-slate-400'
                                                      }`}>
                                                      {module.status === 'Completed' ? <CheckCircle size={20} /> :
                                                         module.status === 'In Progress' ? <PlayCircle size={20} /> : <Lock size={20} />}
                                                   </div>

                                                   <div className="flex-grow">
                                                      <div className="flex justify-between items-center mb-1">
                                                         <h4 className={`font-bold text-sm ${module.status === 'Locked' ? 'text-slate-400' : 'text-slate-900'}`}>
                                                            Module {idx + 1}: {module.title}
                                                         </h4>
                                                         <span className={`text-xs font-bold px-2 py-0.5 rounded ${module.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                            module.status === 'In Progress' ? 'bg-brand-100 text-brand-700' :
                                                               'bg-slate-100 text-slate-500'
                                                            }`}>
                                                            {module.status}
                                                         </span>
                                                      </div>
                                                      <div className="flex gap-4 text-xs text-slate-500">
                                                         <span className="flex items-center gap-1"><BookOpen size={12} /> {module.lessons} Lessons</span>
                                                         <span className="flex items-center gap-1"><Clock size={12} /> {module.duration}</span>
                                                         {module.score !== '-' && (
                                                            <span className="flex items-center gap-1 font-medium text-slate-700">Quiz Score: {module.score}</span>
                                                         )}
                                                      </div>
                                                   </div>
                                                </div>
                                             ))}
                                          </div>
                                       </div>
                                    </div>

                                    {/* Sidebar Info */}
                                    <div className="space-y-6">
                                       <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                                          <h3 className="font-bold text-slate-900 mb-4">Instructor</h3>
                                          <div className="flex items-center gap-3 mb-4">
                                             <div className="w-12 h-12 rounded-full bg-slate-200">
                                                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor || 'SED')}&background=EBF4FF&color=2563EB`} alt={course.instructor} className="w-full h-full rounded-full" />
                                             </div>
                                             <div>
                                                <p className="font-bold text-slate-900 text-sm">{course.instructor}</p>
                                                <p className="text-xs text-slate-500">Senior Instructor</p>
                                             </div>
                                          </div>
                                          <Button variant="outline" size="sm" className="w-full">View Profile</Button>
                                       </div>

                                       <div className="bg-brand-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
                                          <h3 className="font-bold text-lg mb-2 relative z-10">Keep going! 🚀</h3>
                                          <p className="text-brand-100 text-sm mb-4 relative z-10">
                                             You are doing great. Finish the next module to unlock a new badge.
                                          </p>
                                          <Button size="sm" className="w-full bg-white text-brand-600 hover:bg-brand-50 border-none relative z-10">
                                             Continue Learning
                                          </Button>
                                       </div>

                                       {course.progress === 100 && (
                                          <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6 text-center">
                                             <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Award size={32} />
                                             </div>
                                             <h3 className="font-bold text-slate-900 mb-2">Congratulations!</h3>
                                             <p className="text-sm text-slate-500 mb-4">You have successfully completed this course.</p>
                                             <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white border-none">
                                                Download Certificate
                                             </Button>
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              );
                           })()}
                        </div>
                     )}
                  </div>
               )}

               {/* Assignments Tab */}
               {activeTab === 'assignments' && (
                  <div className="max-w-5xl mx-auto animate-fade-in-up">
                     <div className="flex justify-between items-center mb-8">
                        <div>
                           <h2 className="text-2xl font-bold text-slate-900">Assignments</h2>
                           <p className="text-slate-500">Track your tasks, quizzes, and project submissions.</p>
                        </div>
                        {/* Filter placeholder */}
                        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                           <button className="px-3 py-1.5 text-xs font-bold bg-brand-50 text-brand-700 rounded-md shadow-sm">All</button>
                           <button className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700">Pending</button>
                           <button className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700">Graded</button>
                        </div>
                     </div>

                     <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        {assignments.length > 0 ? (
                           <div className="divide-y divide-slate-100">
                              {assignments.map((assignment) => (
                                 <div key={assignment.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row gap-6 items-start sm:items-center group">
                                    <div className={`p-4 rounded-xl flex items-center justify-center flex-shrink-0 ${assignment.status === 'Pending' ? 'bg-amber-100 text-amber-600' :
                                       assignment.status === 'Submitted' ? 'bg-blue-100 text-blue-600' :
                                          'bg-green-100 text-green-600'
                                       }`}>
                                       <FileText size={24} />
                                    </div>

                                    <div className="flex-grow min-w-0">
                                       <div className="flex items-center gap-2 mb-1">
                                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${assignment.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                             assignment.status === 'Submitted' ? 'bg-blue-100 text-blue-700' :
                                                'bg-green-100 text-green-700'
                                             }`}>
                                             {assignment.status}
                                          </span>
                                          {assignment.status === 'Pending' && new Date(assignment.dueDate) < new Date() && (
                                             <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-red-100 text-red-700">Overdue</span>
                                          )}
                                       </div>
                                       <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-brand-600 transition-colors">{assignment.title}</h3>
                                       <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                          <span className="flex items-center gap-1"><BookOpen size={14} className="text-slate-400" /> {assignment.course}</span>
                                          <span className="flex items-center gap-1"><Clock size={14} className="text-slate-400" /> Due: {new Date(assignment.dueDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                       </div>
                                    </div>

                                    <div className="flex-shrink-0 flex flex-col items-end gap-2 w-full sm:w-auto">
                                       {assignment.status === 'Pending' && (
                                          <Button
                                             onClick={() => handleOpenSubmissionModal(assignment)}
                                             className="w-full sm:w-auto shadow-md shadow-brand-500/20"
                                          >
                                             Submit Assignment
                                          </Button>
                                       )}
                                       {assignment.status === 'Submitted' && (
                                          <div className="text-right">
                                             <p className="text-sm font-bold text-slate-700 mb-1">Submitted</p>
                                             <p className="text-xs text-slate-400">Waiting for review</p>
                                          </div>
                                       )}
                                       {assignment.status === 'Graded' && (
                                          <div className="flex items-center gap-4">
                                             <div className="text-right">
                                                <p className="text-2xl font-bold text-green-600">{assignment.grade}<span className="text-sm text-slate-400 font-normal">/100</span></p>
                                                <p className="text-xs text-green-700 font-medium">Great Work!</p>
                                             </div>
                                             <Button variant="outline" size="sm">Feedback</Button>
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <div className="py-20 px-6 text-center flex flex-col items-center justify-center">
                              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 relative">
                                 <FileText size={48} className="text-slate-300" />
                                 <div className="absolute top-0 right-0 p-2 bg-white rounded-full shadow-sm">
                                    <CheckCircle size={20} className="text-green-500" />
                                 </div>
                              </div>
                              <h3 className="text-xl font-bold text-slate-900 mb-2">You're all caught up!</h3>
                              <p className="text-slate-500 max-w-md mx-auto mb-8">
                                 No pending assignments found. Check back later or review your completed work.
                              </p>
                              <Button onClick={() => setActiveTab('my-courses')} variant="outline">
                                 Continue Learning
                              </Button>
                           </div>
                        )}
                     </div>
                  </div>
               )}

               {/* Certificates Tab */}
               {activeTab === 'certificates' && (
                  <div className="max-w-4xl mx-auto animate-fade-in-up">
                     <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">My Certificates</h2>
                        <p className="text-slate-500">Verified credentials for your completed courses.</p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {certificates.map((cert) => (
                           <div key={cert.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
                              <div className="flex items-start justify-between mb-6">
                                 <div className="p-3 bg-brand-50 text-brand-600 rounded-lg">
                                    <Award size={32} />
                                 </div>
                                 <div className="text-right">
                                    <p className="text-xs text-slate-400 font-medium">Issued On</p>
                                    <p className="text-sm font-bold text-slate-900">{cert.date}</p>
                                 </div>
                              </div>

                              <div className="mb-6 flex-grow">
                                 <h3 className="text-lg font-bold text-slate-900 mb-2">{cert.course}</h3>
                                 <p className="text-sm text-slate-500">Credential ID: <span className="font-mono text-slate-700">{cert.id_code}</span></p>
                              </div>

                              <div className="flex gap-3">
                                 <Button className="flex-1" size="sm">
                                    <Download size={16} className="mr-2" /> Download PDF
                                 </Button>
                                 <Button variant="outline" className="flex-1" size="sm">
                                    Share
                                 </Button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {/* Schedule Tab */}
               {activeTab === 'schedule' && (
                  <div className="max-w-4xl mx-auto animate-fade-in-up">
                     <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">My Schedule</h2>
                        <p className="text-slate-500">Upcoming classes, deadlines, and events.</p>
                     </div>

                     <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                        {schedule.length > 0 ? schedule.map((item, index) => (
                           <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">

                              {/* Icon Marker */}
                              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 group-hover:bg-brand-500 group-hover:text-white text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors z-10">
                                 {item.type === 'Deadline' ? <Clock size={18} /> :
                                    item.type === 'Live Class' ? <Video size={18} /> :
                                       item.type === 'Meeting' ? <User size={18} /> :
                                          <Calendar size={18} />}
                              </div>

                              {/* Content Card */}
                              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative">
                                 {/* Arrow for desktop */}
                                 <div className="hidden md:block absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-b border-l border-slate-200 rotate-45 md:group-odd:left-auto md:group-odd:-right-2 md:group-odd:border-l-0 md:group-odd:border-r md:group-odd:border-t md:group-even:-left-2"></div>

                                 <div className="flex items-center justify-between mb-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${item.type === 'Deadline' ? 'bg-amber-100 text-amber-700' :
                                       item.type === 'Live Class' ? 'bg-red-100 text-red-700' :
                                          'bg-blue-100 text-blue-700'
                                       }`}>
                                       {item.type}
                                    </span>
                                    <time className="font-mono text-xs text-slate-400">
                                       {new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} • {item.time}
                                    </time>
                                 </div>
                                 <h3 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h3>
                                 <p className="text-sm text-slate-500 mb-4">{(item as any).courseName || 'General Event'}</p>

                                 {item.link && (
                                    <Button size="sm" variant="outline" className="w-full sm:w-auto h-8 text-xs" onClick={() => window.open(item.link, '_blank')}>
                                       {item.type === 'Live Class' ? 'Join Now' : 'View Details'}
                                    </Button>
                                 )}
                              </div>
                           </div>
                        )) : (
                           <div className="relative z-10 bg-white rounded-xl border border-slate-200 p-12 text-center max-w-2xl mx-auto shadow-sm">
                              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                 <Calendar size={40} className="text-slate-300" />
                              </div>
                              <h3 className="text-xl font-bold text-slate-900 mb-2">No Upcoming Events</h3>
                              <p className="text-slate-500 mb-6">Your schedule is currently clear. Relax or catch up on course materials.</p>
                              <Button variant="outline" onClick={() => setActiveTab('my-courses')}>
                                 Browse Courses
                              </Button>
                           </div>
                        )}
                     </div>
                  </div>
               )}

               {/* Settings Tab */}
               {activeTab === 'settings' && (
                  <div className="max-w-2xl mx-auto animate-fade-in-up">
                     <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">Account Settings</h2>
                        <p className="text-slate-500">Manage your profile and preferences.</p>
                     </div>

                     <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
                        <h3 className="font-bold text-slate-900 mb-6">Profile Information</h3>
                        <div className="flex items-center gap-6 mb-6">
                           <div className="w-20 h-20 rounded-full bg-brand-600 text-white flex items-center justify-center text-3xl font-bold">
                              {profile.avatarUrl ? <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full rounded-full" /> : (profile.name ? profile.name.charAt(0) : 'U')}
                           </div>
                           <div>
                              <Button variant="outline" size="sm" className="mb-2">Change Avatar</Button>
                              <p className="text-xs text-slate-400">JPG, GIF or PNG. Max size of 800K</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                              <input type="text" defaultValue={profile.name} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                              <input type="email" defaultValue={profile.email} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-slate-50" disabled />
                           </div>
                           <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                              <textarea rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none" placeholder="Tell us a little about yourself..."></textarea>
                           </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-100 text-right">
                           <Button>Save Changes</Button>
                        </div>
                     </div>

                     <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-bold text-slate-900 mb-6">Notifications</h3>
                        <div className="space-y-4">
                           {['Email notifications for new assignments', 'Weekly progress report', 'Promotional offers and course recommendations'].map((label, i) => (
                              <div key={i} className="flex items-center justify-between">
                                 <span className="text-slate-700 text-sm">{label}</span>
                                 <input type="checkbox" defaultChecked={i < 2} className="h-4 w-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500" />
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               )}

            </div>
         </main>
      </div>
   );
};
