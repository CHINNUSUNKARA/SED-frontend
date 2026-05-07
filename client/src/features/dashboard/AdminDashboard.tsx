
import React, { useState, useEffect, useRef } from 'react';
import { ViewState } from '../../App';
import {
  LayoutDashboard, BookOpen, Users, GraduationCap, Settings, LogOut,
  Bell, Search, Plus, MoreVertical, TrendingUp, DollarSign,
  Filter, Menu, X, Edit, Trash2, Archive, Mail, CheckCircle, AlertCircle, Download, Award, Check,
  Globe, Shield, CreditCard, Save, Lock, IndianRupee, PieChart, BarChart2, Activity, MousePointer, Clock, MapPin, ArrowUpRight,
  Phone, Calendar, FileText, ChevronLeft, ChevronRight, ChevronDown, RefreshCw, Key, Ban,
  Upload, Image as ImageIcon, Video, Bold, Italic, Underline, List, AlignLeft, Link2
} from 'lucide-react';
import { COURSE_CATEGORIES } from '../../constants';
import { Button } from '../../components/ui/Button';

import * as adminService from '../../services/adminService';
import { userService } from '../../services/userService';

interface AdminDashboardProps {
  onNavigate: (view: ViewState) => void;
}

interface NewCourseAdmin {
  title: string;
  slug: string;
  tagline: string;
  shortDescription: string;
  description: string;
  courseType: 'live' | 'self-paced';
  category: string;
  subCategory: string;
  level: string;
  language: string;
  tags: string;
  duration: string;
  totalHours: string;
  learningObjectives: string;
  highlights: string;
  prerequisites: string;
  targetAudience: string;
  tools: string;
  isFree: boolean;
  price: string;
  discountedPrice: string;
  imageUrl: string;
  bannerUrl: string;
  promoVideoUrl: string;
  startDate: string;
  endDate: string;
  maxStudents: string;
  batchName: string;
  meetingPlatform: string;
  hasCertification: boolean;
  instructorId: string;
}

interface CurriculumConceptForm {
  title: string;
  type: 'video' | 'audio' | 'pdf' | 'text' | 'markdown' | 'slides' | 'link' | 'embed' | 'image' | 'notebook';
  url: string;
  duration: string;
  isPreview: boolean;
}

interface CurriculumWeekForm {
  weekNumber: number;
  title: string;
  description: string;
  isLocked: boolean;
  unlockAfterDays: string;
  concepts: CurriculumConceptForm[];
  _expanded: boolean;
}

const RichTextEditor: React.FC<{ label?: string; value: string; onChange: (html: string) => void; placeholder?: string; height?: string }> = ({ label, value, onChange, placeholder, height = 'h-40' }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isFocused = useRef(false);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      if (!isFocused.current || value === '') {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value]);

  const applyFormat = (command: string, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html === '<br>' ? '' : html);
    }
  };

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
      <div className="border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-500 transition-shadow bg-white flex flex-col">
        <div className="flex items-center gap-1 p-2 border-b border-slate-200 bg-slate-50 overflow-x-auto flex-shrink-0">
          <button type="button" onClick={() => applyFormat('bold')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors" title="Bold"><Bold size={16} /></button>
          <button type="button" onClick={() => applyFormat('italic')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors" title="Italic"><Italic size={16} /></button>
          <button type="button" onClick={() => applyFormat('underline')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors" title="Underline"><Underline size={16} /></button>
          <div className="w-px h-4 bg-slate-300 mx-1"></div>
          <button type="button" onClick={() => applyFormat('insertUnorderedList')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors" title="Bullet List"><List size={16} /></button>
          <button type="button" onClick={() => applyFormat('justifyLeft')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors" title="Align Left"><AlignLeft size={16} /></button>
          <div className="w-px h-4 bg-slate-300 mx-1"></div>
          <button type="button" onClick={() => applyFormat('formatBlock', 'H3')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600 font-bold text-xs transition-colors" title="Heading">H3</button>
          <button type="button" onClick={() => { const url = prompt('Enter URL:'); if (url) applyFormat('createLink', url); }} className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors" title="Link"><Link2 size={16} /></button>
        </div>
        <div className="relative flex-grow">
          <div
            ref={editorRef}
            className={`p-4 w-full outline-none overflow-y-auto ${height} text-sm text-slate-700 leading-relaxed`}
            contentEditable
            onInput={handleInput}
            onFocus={() => { isFocused.current = true; }}
            onBlur={() => { isFocused.current = false; }}
            suppressContentEditableWarning={true}
          />
          {(!value || value === '<br>' || value === '') && placeholder && (
            <div className="absolute top-4 left-4 text-slate-400 text-sm pointer-events-none select-none">{placeholder}</div>
          )}
        </div>
      </div>
    </div>
  );
};

type Tab = 'overview' | 'courses' | 'students' | 'instructors' | 'settings' | 'analytics';

// Mock data removed. Using API data.

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Selection States
  const [selectedCourseIds, setSelectedCourseIds] = useState<(string | number)[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

  // Data States
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [coursesList, setCoursesList] = useState<any[]>([]);

  const [studentSearch, setStudentSearch] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('All');

  // Add Course Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const emptyCourse: NewCourseAdmin = {
    title: '', slug: '', tagline: '', shortDescription: '', description: '',
    courseType: 'self-paced', category: 'Development', subCategory: '', level: 'Beginner',
    language: 'English', tags: '', duration: '', totalHours: '',
    learningObjectives: '', highlights: '', prerequisites: '', targetAudience: '', tools: '',
    isFree: false, price: '', discountedPrice: '',
    imageUrl: '', bannerUrl: '', promoVideoUrl: '',
    startDate: '', endDate: '', maxStudents: '', batchName: '', meetingPlatform: '',
    hasCertification: false, instructorId: '',
  };
  const [newCourse, setNewCourse] = useState<NewCourseAdmin>(emptyCourse);
  const [curriculum, setCurriculum] = useState<CurriculumWeekForm[]>([]);
  const [editingCurriculum, setEditingCurriculum] = useState<CurriculumWeekForm[]>([]);

  // Add Student Modal State
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '', role: 'Student' });

  // Edit Course Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);

  // Student Detail Modal State
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // API Data State
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: { value: 0, change: '0%' },
    activeStudents: { value: 0, change: '0%' },
    courseEnrollments: { value: 0, change: '0%' },
    newInstructors: { value: 0, change: '0%' }
  });
  const [recentEnrollments, setRecentEnrollments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  // Notification Modal State
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread'>('all');

  // Add Instructor Modal State
  const [isAddInstructorModalOpen, setIsAddInstructorModalOpen] = useState(false);
  const [newInstructor, setNewInstructor] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Instructor',
    title: '',
    bio: ''
  });

  // Settings State
  const [settingsData, setSettingsData] = useState({
    general: {
      platformName: 'SED - Scholastic A Edu. Depot',
      supportEmail: 'support@sed-edu.com',
      maintenanceMode: false,
      publicRegistration: true,
    },
    notifications: {
      emailAlerts: true,
      newStudentNotify: true,
      instructorAppNotify: true,
      marketingEmails: false,
    },
    security: {
      twoFactorAuth: true,
      minPasswordLength: '8',
      sessionTimeout: '30',
    },
    billing: {
      currency: 'INR',
      taxRate: '18',
      invoicePrefix: 'SED-INV-',
    }
  });

  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch settings separately
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await adminService.getSettings();
        if (response.success && response.data) {
          // Merge with defaults to ensure all fields exist
          const merged = { ...settingsData, ...response.data };
          // Ensure nested objects are merged too if partial
          if (response.data.general) merged.general = { ...settingsData.general, ...response.data.general };
          if (response.data.notifications) merged.notifications = { ...settingsData.notifications, ...response.data.notifications };
          if (response.data.security) merged.security = { ...settingsData.security, ...response.data.security };
          if (response.data.billing) merged.billing = { ...settingsData.billing, ...response.data.billing };
          setSettingsData(merged);
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    };
    fetchSettings();
  }, []);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [statsResponse, enrollmentsResponse, studentsResponse, instructorsResponse, coursesResponse, analyticsResponse, settingsResponse, notificationsResponse] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getRecentEnrollments(5),
          adminService.getAllStudents(),
          adminService.getAllInstructors(),
          adminService.getAllCourses(),
          adminService.getAnalytics(),
          adminService.getSettings(),
          adminService.getNotifications()
        ]);

        if (statsResponse.success) {
          setDashboardStats(statsResponse.data);
        }

        if (enrollmentsResponse.success) {
          setRecentEnrollments(enrollmentsResponse.data);
        }

        if (studentsResponse.success) {
          setStudents(studentsResponse.data);
        }

        if (instructorsResponse.success) {
          setInstructors(instructorsResponse.data);
        }

        if (coursesResponse.success) {
          setCoursesList(coursesResponse.data);
        }

        if (analyticsResponse.success) {
          setAnalyticsData(analyticsResponse.data);
        }

        if (settingsResponse.success) {
          setSettingsData(settingsResponse.data);
        }

        if (studentsResponse.success) {
          setStudentsList(studentsResponse.data);
          // Also set students if needed, or just use studentsList
          setStudents(studentsResponse.data);
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    // specific notification check
    userService.getNotifications().then(notifs => {
      setNotifications(notifs);
      setHasUnreadNotifications(notifs.some(n => !n.read));
    }).catch(err => console.error("Failed to fetch notifications", err));
  }, []);

  // Format stats for display
  // Format stats for display
  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${(dashboardStats.totalRevenue?.value || 0).toLocaleString('en-IN')} `,
      change: dashboardStats.totalRevenue?.change || '0%',
      icon: IndianRupee,
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Active Students',
      value: (dashboardStats.activeStudents?.value || 0).toString(),
      change: dashboardStats.activeStudents?.change || '0%',
      icon: Users,
      color: 'bg-brand-100 text-brand-600'
    },
    {
      title: 'Course Enrollments',
      value: (dashboardStats.courseEnrollments?.value || 0).toString(),
      change: dashboardStats.courseEnrollments?.change || '0%',
      icon: BookOpen,
      color: 'bg-orange-100 text-orange-600'
    },
    {
      title: 'New Instructors',
      value: (dashboardStats.newInstructors?.value || 0).toString(),
      change: dashboardStats.newInstructors?.change || '0%',
      icon: GraduationCap,
      color: 'bg-purple-100 text-purple-600'
    },
  ];

  const SidebarItem = ({ id, icon: Icon, label }: { id: Tab, icon: any, label: string }) => (
    <button
      onClick={() => {
        setActiveTab(id);
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

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      Completed: 'bg-green-100 text-green-700',
      Pending: 'bg-yellow-100 text-yellow-700',
      Rejected: 'bg-red-100 text-red-700',
      Active: 'bg-blue-100 text-blue-700',
      Inactive: 'bg-slate-100 text-slate-600',
      Draft: 'bg-slate-100 text-slate-600',
      Dropped: 'bg-red-100 text-red-700'
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
        {status}
      </span>
    );
  };

  const emptyWeekForm = (n: number): CurriculumWeekForm => ({
    weekNumber: n, title: '', description: '', isLocked: false, unlockAfterDays: '', concepts: [], _expanded: true,
  });
  const emptyConceptForm = (): CurriculumConceptForm => ({ title: '', type: 'video', url: '', duration: '', isPreview: false });

  // Create-form curriculum helpers
  const addWeek = () => setCurriculum(prev => [...prev, emptyWeekForm(prev.length + 1)]);
  const removeWeek = (i: number) => setCurriculum(prev => prev.filter((_, j) => j !== i).map((w, j) => ({ ...w, weekNumber: j + 1 })));
  const updateWeek = (i: number, ch: Partial<CurriculumWeekForm>) => setCurriculum(prev => prev.map((w, j) => j === i ? { ...w, ...ch } : w));
  const addWeekConcept = (wi: number) => setCurriculum(prev => prev.map((w, j) => j === wi ? { ...w, concepts: [...w.concepts, emptyConceptForm()] } : w));
  const removeWeekConcept = (wi: number, ci: number) => setCurriculum(prev => prev.map((w, j) => j === wi ? { ...w, concepts: w.concepts.filter((_, k) => k !== ci) } : w));
  const updateWeekConcept = (wi: number, ci: number, ch: Partial<CurriculumConceptForm>) => setCurriculum(prev => prev.map((w, j) => j === wi ? { ...w, concepts: w.concepts.map((c, k) => k === ci ? { ...c, ...ch } : c) } : w));

  // Edit-modal curriculum helpers
  const addEditWeek = () => setEditingCurriculum(prev => [...prev, emptyWeekForm(prev.length + 1)]);
  const removeEditWeek = (i: number) => setEditingCurriculum(prev => prev.filter((_, j) => j !== i).map((w, j) => ({ ...w, weekNumber: j + 1 })));
  const updateEditWeek = (i: number, ch: Partial<CurriculumWeekForm>) => setEditingCurriculum(prev => prev.map((w, j) => j === i ? { ...w, ...ch } : w));
  const addEditWeekConcept = (wi: number) => setEditingCurriculum(prev => prev.map((w, j) => j === wi ? { ...w, concepts: [...w.concepts, emptyConceptForm()] } : w));
  const removeEditWeekConcept = (wi: number, ci: number) => setEditingCurriculum(prev => prev.map((w, j) => j === wi ? { ...w, concepts: w.concepts.filter((_, k) => k !== ci) } : w));
  const updateEditWeekConcept = (wi: number, ci: number, ch: Partial<CurriculumConceptForm>) => setEditingCurriculum(prev => prev.map((w, j) => j === wi ? { ...w, concepts: w.concepts.map((c, k) => k === ci ? { ...c, ...ch } : c) } : w));

  const serializeCurriculum = (weeks: CurriculumWeekForm[]) =>
    weeks.filter(w => w.title.trim()).map(w => ({
      weekNumber: w.weekNumber,
      title: w.title,
      description: w.description,
      isLocked: w.isLocked,
      unlockAfterDays: w.unlockAfterDays ? Number(w.unlockAfterDays) : undefined,
      concepts: w.concepts.filter(c => c.title.trim()).map(c => ({
        title: c.title,
        type: c.type,
        url: c.url || undefined,
        duration: c.duration ? Number(c.duration) * 60 : undefined,
        isPreview: c.isPreview,
      })),
    }));

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: string[] = [];
    if (!newCourse.title.trim()) errors.push("Course Title is required");
    if (!newCourse.description.trim()) errors.push("Description is required");
    if (!newCourse.instructorId) errors.push("Instructor is required");
    if (!newCourse.isFree && !newCourse.price.trim()) errors.push("Price is required (or mark course as free)");

    if (errors.length > 0) {
      alert("Validation Failed:\n\n• " + errors.join("\n• "));
      return;
    }

    try {
      const selectedInstructor = instructors.find((i: any) => i.id === newCourse.instructorId || i._id === newCourse.instructorId);
      const coursePayload = {
        name: newCourse.title,
        slug: newCourse.slug || newCourse.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        tagline: newCourse.tagline,
        shortDescription: newCourse.shortDescription,
        description: newCourse.description,
        courseType: newCourse.courseType,
        instructor: { name: selectedInstructor?.name || '', id: newCourse.instructorId },
        category: newCourse.category,
        subCategory: newCourse.subCategory,
        level: newCourse.level,
        language: newCourse.language,
        tags: newCourse.tags.split(',').map(t => t.trim()).filter(Boolean),
        duration: newCourse.duration,
        totalHours: newCourse.totalHours ? Number(newCourse.totalHours) : undefined,
        learningObjectives: newCourse.learningObjectives.split('\n').filter(Boolean),
        highlights: newCourse.highlights.split('\n').filter(Boolean),
        prerequisites: newCourse.prerequisites.split('\n').filter(Boolean),
        targetAudience: newCourse.targetAudience.split('\n').filter(Boolean),
        tools: newCourse.tools.split(',').map(t => t.trim()).filter(Boolean),
        pricing: {
          isFree: newCourse.isFree,
          amount: newCourse.isFree ? 0 : (parseFloat(newCourse.price) || 0),
          discountedAmount: newCourse.discountedPrice ? parseFloat(newCourse.discountedPrice) : undefined,
          currency: 'INR',
        },
        imageUrl: newCourse.imageUrl,
        bannerUrl: newCourse.bannerUrl,
        promoVideoUrl: newCourse.promoVideoUrl,
        hasCertification: newCourse.hasCertification,
        curriculum: serializeCurriculum(curriculum),
        ...(newCourse.courseType === 'live' && {
          batchName: newCourse.batchName,
          startDate: newCourse.startDate,
          endDate: newCourse.endDate,
          maxStudents: newCourse.maxStudents ? Number(newCourse.maxStudents) : undefined,
          meetingPlatform: newCourse.meetingPlatform,
        }),
      };

      await adminService.createCourse(coursePayload);

      const coursesResponse = await adminService.getAllCourses();
      if (coursesResponse.success) setCoursesList(coursesResponse.data);

      alert(`Course "${newCourse.title}" created successfully!`);
      setIsAddModalOpen(false);
      setNewCourse(emptyCourse);
      setCurriculum([]);
    } catch (err: any) {
      console.error("Failed to add course:", err);
      alert("Failed to add course: " + (err.response?.data?.message || err.message));
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.email || !newStudent.password) {
      alert("Please fill in all required fields.");
      return;
    }
    try {
      await adminService.createUser(newStudent);
      alert("Student added successfully!");
      setIsAddStudentModalOpen(false);
      setNewStudent({ name: '', email: '', password: '', role: 'Student' });
      const studentsResponse = await adminService.getAllStudents();
      if (studentsResponse.success) {
        setStudents(studentsResponse.data);
        setStudentsList(studentsResponse.data);
      }
    } catch (err: any) {
      console.error("Failed to add student", err);
      alert("Failed to add student: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteCourse = async (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await adminService.deleteCourses([id]);

        // Refresh courses
        const coursesResponse = await adminService.getAllCourses();
        if (coursesResponse.success) {
          setCoursesList(coursesResponse.data);
        } else if (Array.isArray(coursesResponse)) {
          setCoursesList(coursesResponse);
        } else {
          setCoursesList(prev => prev.filter(c => c.id !== id));
        }

        alert('Course deleted successfully.');
      } catch (err) {
        console.error("Failed to delete course", err);
        alert("Failed to delete course");
      }
    }
  };

  const handleEditCourse = (course: any) => {
    setEditingCourse({ ...course, price: course.price?.toString() || '' });
    const loaded: CurriculumWeekForm[] = (course.curriculum || []).map((w: any, i: number) => ({
      weekNumber: w.weekNumber || i + 1,
      title: w.title || '',
      description: w.description || '',
      isLocked: w.isLocked || false,
      unlockAfterDays: w.unlockAfterDays != null ? String(w.unlockAfterDays) : '',
      concepts: (w.concepts || []).map((c: any) => ({
        title: c.title || '',
        type: c.type || 'video',
        url: c.url || '',
        duration: c.duration ? String(Math.round(c.duration / 60)) : '',
        isPreview: c.isPreview || false,
      })),
      _expanded: false,
    }));
    setEditingCurriculum(loaded);
    setIsEditModalOpen(true);
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingCourse) return;

    const errors: string[] = [];

    if (!editingCourse.title?.trim()) errors.push("Course Title is required");
    if (!editingCourse.tagline?.trim()) errors.push("Tagline is required");
    if (!editingCourse.description?.trim()) errors.push("Description is required");
    if (!editingCourse.instructor?.trim()) errors.push("Instructor is required");
    if (!editingCourse.duration?.trim()) errors.push("Duration is required");

    // Validate Price
    if (!editingCourse.price?.toString().trim()) {
      errors.push("Price is required");
    } else {
      const priceNum = parseFloat(editingCourse.price.toString().replace(/[^0-9.]/g, ''));
      if (isNaN(priceNum) || priceNum < 0) {
        errors.push("Price must be a valid positive number");
      }
    }

    if (errors.length > 0) {
      alert("Validation Failed:\n\n• " + errors.join("\n• "));
      return;
    }

    setIsUpdating(true);
    try {
      const coursePayload = {
        name: editingCourse.title,
        slug: editingCourse.slug,
        tagline: editingCourse.tagline || '',
        description: editingCourse.description,
        // instructor from admin API is already a string (transformed name); re-wrap as object
        instructor: { name: typeof editingCourse.instructor === 'string' ? editingCourse.instructor : editingCourse.instructor?.name || '' },
        category: editingCourse.category,
        pricing: {
          amount: parseFloat(editingCourse.price.toString().replace(/[^0-9.]/g, '')) || 0,
          currency: 'INR'
        },
        duration: editingCourse.duration,
        imageUrl: editingCourse.image,
        curriculum: serializeCurriculum(editingCurriculum),
      };

      await adminService.updateCourse(editingCourse.slug, coursePayload);

      // Refresh courses
      const coursesResponse = await adminService.getAllCourses();
      if (coursesResponse.success) {
        setCoursesList(coursesResponse.data);
      }

      alert(`Course "${editingCourse.title}" updated successfully!`);
      setIsEditModalOpen(false);
      setEditingCourse(null);
      setEditingCurriculum([]);
    } catch (err: any) {
      console.error("Failed to update course:", err);
      alert("Failed to update course: " + (err.response?.data?.message || err.message));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveSettings = async () => {
    const btn = document.getElementById('save-settings-btn');
    if (btn) btn.innerText = 'Saving...';
    try {
      await adminService.updateSettings(settingsData);
      if (btn) btn.innerText = 'Changes Saved!';
      setTimeout(() => {
        if (btn) btn.innerText = 'Save Changes';
      }, 2000);
    } catch (err) {
      console.error("Failed to save settings", err);
      if (btn) btn.innerText = 'Failed to Save';
    }
  };

  const handleSettingChange = (section: keyof typeof settingsData, key: string, value: any) => {
    setSettingsData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  // Bulk Selection Handlers - Courses
  const toggleSelectAllCourses = () => {
    if (selectedCourseIds.length === coursesList.length) {
      setSelectedCourseIds([]);
    } else {
      setSelectedCourseIds(coursesList.map(c => c.id));
    }
  };

  const toggleSelectCourse = (id: string | number) => {
    if (selectedCourseIds.includes(id)) {
      setSelectedCourseIds(selectedCourseIds.filter(sid => sid !== id));
    } else {
      setSelectedCourseIds([...selectedCourseIds, id]);
    }
  };

  const handleBulkDeleteCourses = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedCourseIds.length} selected courses ? `)) {
      try {
        await adminService.deleteCourses(selectedCourseIds);

        // Refresh courses
        const coursesResponse = await adminService.getAllCourses();
        if (coursesResponse.success) {
          setCoursesList(coursesResponse.data);
        } else {
          setCoursesList(prev => prev.filter(c => !selectedCourseIds.includes(String(c.id))));
        }

        setSelectedCourseIds([]);
        alert('Selected courses have been deleted.');
      } catch (err) {
        console.error("Failed to delete courses", err);
        alert("Failed to delete courses");
      }
    }
  };

  const handleBulkArchiveCourses = () => {
    alert(`Archived ${selectedCourseIds.length} courses. (This is a simulation)`);
    setSelectedCourseIds([]);
  };

  // Bulk Selection & Filtering - Students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.email?.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesStatus = studentStatusFilter === 'All';

    return matchesSearch && matchesStatus;
  });

  const toggleSelectAllStudents = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map(s => s.id));
    }
  };

  const toggleSelectStudent = (id: number) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter(sid => sid !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  // Student Bulk Action Handlers
  const handleBulkEmailStudents = () => {
    const selected = studentsList.filter(s => selectedStudentIds.includes(s.id));
    const emails = selected.map(s => s.email).filter(e => e).join(',');
    if (emails) {
      window.location.href = `mailto:? bcc = ${emails} `;
    } else {
      alert("No emails found for selected students.");
    }
    setSelectedStudentIds([]);
  };

  const handleBulkSuspendStudents = async () => {
    if (window.confirm(`Are you sure you want to suspend ${selectedStudentIds.length} students ? `)) {
      try {
        await adminService.suspendStudents(selectedStudentIds);

        // Refresh students
        const studentsResponse = await adminService.getAllStudents();
        if (studentsResponse.success) {
          setStudents(studentsResponse.data);
          setStudentsList(studentsResponse.data);
        }
        alert(`${selectedStudentIds.length} students have been suspended.`);
        setSelectedStudentIds([]);
      } catch (err) {
        console.error("Failed to suspend students", err);
        alert("Failed to suspend students");
      }
    }
  };

  const handleBulkDeleteStudents = async () => {
    if (window.confirm(`Are you sure you want to PERMANENTLY delete ${selectedStudentIds.length} students ? This action cannot be undone.`)) {
      try {
        await adminService.deleteStudents(selectedStudentIds);

        // Refresh students
        const studentsResponse = await adminService.getAllStudents();
        if (studentsResponse.success) {
          setStudents(studentsResponse.data);
          setStudentsList(studentsResponse.data);
        } else {
          setStudentsList(prev => prev.filter(s => !selectedStudentIds.includes(s.id)));
        }

        alert(`${selectedStudentIds.length} students have been deleted.`);
        setSelectedStudentIds([]);
      } catch (err) {
        console.error("Failed to delete students", err);
        alert("Failed to delete students");
      }
    }
  };

  const handleAddInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstructor.name || !newInstructor.email || !newInstructor.password) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      await adminService.createUser(newInstructor);
      alert("Instructor added successfully!");
      setIsAddInstructorModalOpen(false);
      setNewInstructor({ name: '', email: '', password: '', role: 'Instructor', title: '', bio: '' });

      // Refresh instructors
      const instructorsResponse = await adminService.getAllInstructors();
      if (instructorsResponse.success) {
        setInstructors(instructorsResponse.data);
      }
    } catch (err: any) {
      console.error("Failed to add instructor", err);
      alert("Failed to add instructor: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex relative">

      {/* Add Course Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden animate-fade-in-up max-h-[92vh] flex flex-col">
            <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100 bg-slate-50 flex-shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Create New Course</h3>
                <p className="text-sm text-slate-500">Fill in the details to publish a new course on the platform.</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddCourse} className="flex-1 overflow-y-auto px-8 py-6">
              <div className="space-y-8">

                {/* 1. Basic Information */}
                <section>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">1. Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Course Title <span className="text-red-500">*</span></label>
                      <input type="text" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="e.g. Advanced Microservices Patterns with Spring Boot"
                        value={newCourse.title}
                        onChange={e => setNewCourse({ ...newCourse, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">URL Slug</label>
                      <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none font-mono text-sm" placeholder="auto-generated-from-title"
                        value={newCourse.slug} onChange={e => setNewCourse({ ...newCourse, slug: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tagline</label>
                      <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="A short, catchy one-liner for the course"
                        value={newCourse.tagline} onChange={e => setNewCourse({ ...newCourse, tagline: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Short Description <span className="text-slate-400 text-xs">(max 300 chars)</span></label>
                      <textarea rows={2} maxLength={300} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none text-sm" placeholder="Brief overview shown on course cards..."
                        value={newCourse.shortDescription} onChange={e => setNewCourse({ ...newCourse, shortDescription: e.target.value })}
                      />
                      <p className="text-xs text-slate-400 text-right mt-1">{newCourse.shortDescription.length}/300</p>
                    </div>
                    <div className="md:col-span-2">
                      <RichTextEditor label="Full Description *" value={newCourse.description}
                        onChange={(html) => setNewCourse({ ...newCourse, description: html })}
                        placeholder="Describe the course in detail..."
                      />
                    </div>
                  </div>
                </section>

                {/* 2. Instructor & Course Settings */}
                <section>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">2. Instructor & Settings</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Assign Instructor <span className="text-red-500">*</span></label>
                      <select required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                        value={newCourse.instructorId} onChange={e => setNewCourse({ ...newCourse, instructorId: e.target.value })}
                      >
                        <option value="">— Select an instructor —</option>
                        {instructors.map((inst: any) => (
                          <option key={inst.id || inst._id} value={inst.id || inst._id}>{inst.name} {inst.email ? `(${inst.email})` : ''}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Course Type</label>
                      <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                        value={newCourse.courseType} onChange={e => setNewCourse({ ...newCourse, courseType: e.target.value as 'live' | 'self-paced' })}
                      >
                        <option value="self-paced">Self-Paced</option>
                        <option value="live">Live</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Category <span className="text-red-500">*</span></label>
                      <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                        value={newCourse.category} onChange={e => setNewCourse({ ...newCourse, category: e.target.value })}
                      >
                        {COURSE_CATEGORIES.filter(c => c !== 'All').map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Sub-Category</label>
                      <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="e.g. Backend, DevOps"
                        value={newCourse.subCategory} onChange={e => setNewCourse({ ...newCourse, subCategory: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty Level</label>
                      <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                        value={newCourse.level} onChange={e => setNewCourse({ ...newCourse, level: e.target.value })}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="All">All Levels</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
                      <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="English"
                        value={newCourse.language} onChange={e => setNewCourse({ ...newCourse, language: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                      <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="e.g. 8 Weeks"
                        value={newCourse.duration} onChange={e => setNewCourse({ ...newCourse, duration: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Total Hours</label>
                      <input type="number" min="0" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="e.g. 40"
                        value={newCourse.totalHours} onChange={e => setNewCourse({ ...newCourse, totalHours: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tags <span className="text-slate-400 text-xs">(comma-separated)</span></label>
                      <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="e.g. Java, Spring Boot, Docker"
                        value={newCourse.tags} onChange={e => setNewCourse({ ...newCourse, tags: e.target.value })}
                      />
                    </div>
                  </div>
                </section>

                {/* 3. Learning Details */}
                <section>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">3. Learning Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Learning Objectives <span className="text-slate-400 text-xs">(one per line)</span></label>
                      <textarea rows={4} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none text-sm" placeholder="Build REST APIs&#10;Deploy on AWS"
                        value={newCourse.learningObjectives} onChange={e => setNewCourse({ ...newCourse, learningObjectives: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Course Highlights <span className="text-slate-400 text-xs">(one per line)</span></label>
                      <textarea rows={4} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none text-sm" placeholder="Certificate of completion&#10;24x7 mentor support"
                        value={newCourse.highlights} onChange={e => setNewCourse({ ...newCourse, highlights: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Prerequisites <span className="text-slate-400 text-xs">(one per line)</span></label>
                      <textarea rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none text-sm" placeholder="Basic Java knowledge"
                        value={newCourse.prerequisites} onChange={e => setNewCourse({ ...newCourse, prerequisites: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Target Audience <span className="text-slate-400 text-xs">(one per line)</span></label>
                      <textarea rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none text-sm" placeholder="Java developers&#10;Backend engineers"
                        value={newCourse.targetAudience} onChange={e => setNewCourse({ ...newCourse, targetAudience: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tools & Technologies <span className="text-slate-400 text-xs">(comma-separated)</span></label>
                      <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="e.g. Spring Boot, Docker, PostgreSQL"
                        value={newCourse.tools} onChange={e => setNewCourse({ ...newCourse, tools: e.target.value })}
                      />
                    </div>
                  </div>
                </section>

                {/* 4. Pricing */}
                <section>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">4. Pricing</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                    <div className="flex items-center gap-3 pt-8">
                      <input id="adminIsFree" type="checkbox" className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
                        checked={newCourse.isFree} onChange={e => setNewCourse({ ...newCourse, isFree: e.target.checked, price: '', discountedPrice: '' })}
                      />
                      <label htmlFor="adminIsFree" className="text-sm font-medium text-slate-700">Free Course</label>
                    </div>
                    <div className={newCourse.isFree ? 'opacity-40 pointer-events-none' : ''}>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Price (INR) {!newCourse.isFree && <span className="text-red-500">*</span>}</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                        <input type="number" min="0" className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="49999"
                          value={newCourse.price} onChange={e => setNewCourse({ ...newCourse, price: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className={newCourse.isFree ? 'opacity-40 pointer-events-none' : ''}>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Discounted Price (INR)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                        <input type="number" min="0" className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="39999"
                          value={newCourse.discountedPrice} onChange={e => setNewCourse({ ...newCourse, discountedPrice: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* 5. Media */}
                <section>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">5. Media</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Thumbnail / Course Image URL</label>
                      <div className="flex gap-2">
                        <div className="relative flex-grow">
                          <ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="url" className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="https://example.com/thumbnail.jpg"
                            value={newCourse.imageUrl} onChange={e => setNewCourse({ ...newCourse, imageUrl: e.target.value })}
                          />
                        </div>
                        <Button type="button" variant="outline" size="sm"><Upload size={15} /></Button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Banner Image URL</label>
                      <div className="relative">
                        <ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="url" className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="https://example.com/banner.jpg"
                          value={newCourse.bannerUrl} onChange={e => setNewCourse({ ...newCourse, bannerUrl: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Promo Video URL</label>
                      <div className="relative">
                        <Video size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="url" className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="https://youtube.com/watch?v=..."
                          value={newCourse.promoVideoUrl} onChange={e => setNewCourse({ ...newCourse, promoVideoUrl: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* 6. Live Course Details (conditional) */}
                {newCourse.courseType === 'live' && (
                  <section>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">6. Live Course Details</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Batch Name</label>
                        <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="e.g. Batch 12 – Jan 2026"
                          value={newCourse.batchName} onChange={e => setNewCourse({ ...newCourse, batchName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                        <input type="date" title="Course Start Date" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                          value={newCourse.startDate} onChange={e => setNewCourse({ ...newCourse, startDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                        <input type="date" title="Course End Date" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                          value={newCourse.endDate} onChange={e => setNewCourse({ ...newCourse, endDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Max Students</label>
                        <input type="number" min="1" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="50"
                          value={newCourse.maxStudents} onChange={e => setNewCourse({ ...newCourse, maxStudents: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Meeting Platform</label>
                        <select title="Meeting Platform" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                          value={newCourse.meetingPlatform} onChange={e => setNewCourse({ ...newCourse, meetingPlatform: e.target.value })}
                        >
                          <option value="">Select platform</option>
                          <option value="zoom">Zoom</option>
                          <option value="google_meet">Google Meet</option>
                          <option value="microsoft_teams">Microsoft Teams</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                    </div>
                  </section>
                )}

                {/* 7. Certification */}
                <section>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">{newCourse.courseType === 'live' ? '7' : '6'}. Certification</h4>
                  <div className="flex items-center gap-3">
                    <input id="adminHasCert" type="checkbox" className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
                      checked={newCourse.hasCertification} onChange={e => setNewCourse({ ...newCourse, hasCertification: e.target.checked })}
                    />
                    <label htmlFor="adminHasCert" className="text-sm font-medium text-slate-700">Issue Certificate of Completion</label>
                    {newCourse.hasCertification && (
                      <span className="ml-2 text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Award size={12} /> Enabled
                      </span>
                    )}
                  </div>
                </section>

                {/* Curriculum */}
                <section>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">
                    {newCourse.courseType === 'live' ? '8' : '7'}. Curriculum
                  </h4>
                  <div className="space-y-3">
                    {curriculum.map((week, wIdx) => (
                      <div key={wIdx} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50">
                          <span className="text-xs font-bold text-brand-600 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full flex-shrink-0">Week {week.weekNumber}</span>
                          <input
                            type="text"
                            className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                            placeholder="Module title e.g. Introduction & Setup"
                            value={week.title}
                            onChange={e => updateWeek(wIdx, { title: e.target.value })}
                          />
                          <button type="button" onClick={() => updateWeek(wIdx, { _expanded: !week._expanded })} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors" title={week._expanded ? 'Collapse' : 'Expand'}>
                            <ChevronDown size={16} className={`transition-transform ${week._expanded ? 'rotate-180' : ''}`} />
                          </button>
                          <button type="button" onClick={() => removeWeek(wIdx)} className="p-1.5 text-red-400 hover:text-red-600 transition-colors" title="Remove week">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        {week._expanded && (
                          <div className="p-4 border-t border-slate-100 space-y-4">
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">Description (optional)</label>
                              <textarea rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none" placeholder="What students will cover in this week..." value={week.description} onChange={e => updateWeek(wIdx, { description: e.target.value })} />
                            </div>
                            <div className="flex items-center gap-4 flex-wrap">
                              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
                                <input type="checkbox" className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500" checked={week.isLocked} onChange={e => updateWeek(wIdx, { isLocked: e.target.checked })} />
                                <Lock size={13} className="text-slate-400" /> Lock (drip content)
                              </label>
                              {week.isLocked && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <span className="text-xs">Unlock after</span>
                                  <input type="number" min="0" className="w-16 px-2 py-1 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" placeholder="7" value={week.unlockAfterDays} onChange={e => updateWeek(wIdx, { unlockAfterDays: e.target.value })} />
                                  <span className="text-xs">days</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lessons / Concepts ({week.concepts.length})</span>
                                <button type="button" onClick={() => addWeekConcept(wIdx)} className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 hover:underline"><Plus size={13} /> Add Lesson</button>
                              </div>
                              <div className="space-y-2">
                                {week.concepts.map((concept, cIdx) => (
                                  <div key={cIdx} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <input type="text" className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Lesson title" value={concept.title} onChange={e => updateWeekConcept(wIdx, cIdx, { title: e.target.value })} />
                                      <select title="Content type" className="w-28 px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white" value={concept.type} onChange={e => updateWeekConcept(wIdx, cIdx, { type: e.target.value as CurriculumConceptForm['type'] })}>
                                        <option value="video">Video</option>
                                        <option value="audio">Audio</option>
                                        <option value="pdf">PDF</option>
                                        <option value="text">Text</option>
                                        <option value="markdown">Markdown</option>
                                        <option value="slides">Slides</option>
                                        <option value="link">Link</option>
                                        <option value="embed">Embed</option>
                                        <option value="image">Image</option>
                                        <option value="notebook">Notebook</option>
                                      </select>
                                      <button type="button" title="Remove lesson" onClick={() => removeWeekConcept(wIdx, cIdx)} className="text-red-400 hover:text-red-600 p-1 flex-shrink-0"><Trash2 size={14} /></button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <input type="url" className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" placeholder="URL / link (optional)" value={concept.url} onChange={e => updateWeekConcept(wIdx, cIdx, { url: e.target.value })} />
                                      <input type="number" min="0" className="w-28 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Duration (min)" value={concept.duration} onChange={e => updateWeekConcept(wIdx, cIdx, { duration: e.target.value })} />
                                      <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none flex-shrink-0">
                                        <input type="checkbox" className="w-3.5 h-3.5 text-brand-600 border-slate-300 rounded" checked={concept.isPreview} onChange={e => updateWeekConcept(wIdx, cIdx, { isPreview: e.target.checked })} />
                                        Preview
                                      </label>
                                    </div>
                                  </div>
                                ))}
                                {week.concepts.length === 0 && (
                                  <div className="text-center py-3 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">No lessons added yet</div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={addWeek} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:border-brand-400 hover:text-brand-600 transition-colors flex items-center justify-center gap-2 font-medium">
                      <Plus size={16} /> Add Week / Module
                    </button>
                  </div>
                </section>

              </div>

              <div className="flex justify-end gap-3 pt-8 mt-2 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => { setIsAddModalOpen(false); setNewCourse(emptyCourse); setCurriculum([]); }}>Cancel</Button>
                <Button type="button" variant="secondary" className="bg-slate-200 text-slate-700 hover:bg-slate-300 border-none" onClick={() => alert('Draft saving not yet implemented')}>Save Draft</Button>
                <Button type="submit">Create Course</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {isEditModalOpen && editingCourse && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0">
              <h3 className="text-xl font-bold text-slate-900">Edit Course</h3>
              <button onClick={() => { setIsEditModalOpen(false); setEditingCourse(null); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateCourse} className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Course Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="e.g. Advanced React Patterns"
                    value={editingCourse.title || ''}
                    onChange={e => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tagline <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="Short course tagline..."
                    value={editingCourse.tagline || ''}
                    onChange={e => setEditingCourse({ ...editingCourse, tagline: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                    placeholder="Brief summary of the course content..."
                    value={editingCourse.description || ''}
                    onChange={e => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Instructor <span className="text-red-500">*</span></label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                    value={editingCourse.instructor || ''}
                    onChange={e => setEditingCourse({ ...editingCourse, instructor: e.target.value })}
                  >
                    <option value="">Select Instructor</option>
                    <option value="Unknown">Unknown (Default)</option>
                    {instructors.map(inst => (
                      <option key={inst._id || inst.id} value={inst.name}>{inst.name}</option>
                    ))}
                    {!instructors.some(i => i.name === editingCourse.instructor) && editingCourse.instructor && editingCourse.instructor !== 'Unknown' && (
                      <option value={editingCourse.instructor}>{editingCourse.instructor}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                    value={editingCourse.category || 'Development'}
                    onChange={e => setEditingCourse({ ...editingCourse, category: e.target.value })}
                  >
                    {COURSE_CATEGORIES.filter(cat => cat !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="₹19,999"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    value={editingCourse.price || ''}
                    onChange={e => setEditingCourse({ ...editingCourse, price: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duration <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 4 Weeks"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    value={editingCourse.duration || ''}
                    onChange={e => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
                  <select
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                    value={editingCourse.level || 'Beginner'}
                    onChange={e => setEditingCourse({ ...editingCourse, level: e.target.value })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lessons</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    value={editingCourse.lessons || 0}
                    onChange={e => setEditingCourse({ ...editingCourse, lessons: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    value={editingCourse.image || ''}
                    onChange={e => setEditingCourse({ ...editingCourse, image: e.target.value })}
                  />
                </div>

                {/* Curriculum */}
                <div className="col-span-2 mt-2">
                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2 border-t border-slate-100 pt-4">
                    <BookOpen size={16} className="text-brand-600" /> Curriculum
                  </h4>
                  <div className="space-y-3">
                    {editingCurriculum.map((week, wIdx) => (
                      <div key={wIdx} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50">
                          <span className="text-xs font-bold text-brand-600 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full flex-shrink-0">Week {week.weekNumber}</span>
                          <input type="text" className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Module title" value={week.title} onChange={e => updateEditWeek(wIdx, { title: e.target.value })} />
                          <button type="button" title={week._expanded ? 'Collapse' : 'Expand'} onClick={() => updateEditWeek(wIdx, { _expanded: !week._expanded })} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                            <ChevronDown size={16} className={`transition-transform ${week._expanded ? 'rotate-180' : ''}`} />
                          </button>
                          <button type="button" title="Remove week" onClick={() => removeEditWeek(wIdx)} className="p-1.5 text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        {week._expanded && (
                          <div className="p-4 border-t border-slate-100 space-y-4">
                            <textarea rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none" placeholder="Week description (optional)" value={week.description} onChange={e => updateEditWeek(wIdx, { description: e.target.value })} />
                            <div className="flex items-center gap-4 flex-wrap">
                              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
                                <input type="checkbox" className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500" checked={week.isLocked} onChange={e => updateEditWeek(wIdx, { isLocked: e.target.checked })} />
                                <Lock size={13} className="text-slate-400" /> Lock (drip)
                              </label>
                              {week.isLocked && (
                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                  <span>Unlock after</span>
                                  <input type="number" min="0" className="w-16 px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-brand-500 outline-none" placeholder="7" value={week.unlockAfterDays} onChange={e => updateEditWeek(wIdx, { unlockAfterDays: e.target.value })} />
                                  <span>days</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lessons ({week.concepts.length})</span>
                                <button type="button" onClick={() => addEditWeekConcept(wIdx)} className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 hover:underline"><Plus size={13} /> Add Lesson</button>
                              </div>
                              <div className="space-y-2">
                                {week.concepts.map((concept, cIdx) => (
                                  <div key={cIdx} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <input type="text" className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Lesson title" value={concept.title} onChange={e => updateEditWeekConcept(wIdx, cIdx, { title: e.target.value })} />
                                      <select title="Content type" className="w-28 px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white" value={concept.type} onChange={e => updateEditWeekConcept(wIdx, cIdx, { type: e.target.value as CurriculumConceptForm['type'] })}>
                                        <option value="video">Video</option><option value="audio">Audio</option><option value="pdf">PDF</option><option value="text">Text</option><option value="markdown">Markdown</option><option value="slides">Slides</option><option value="link">Link</option><option value="embed">Embed</option><option value="image">Image</option><option value="notebook">Notebook</option>
                                      </select>
                                      <button type="button" title="Remove lesson" onClick={() => removeEditWeekConcept(wIdx, cIdx)} className="text-red-400 hover:text-red-600 p-1 flex-shrink-0"><Trash2 size={14} /></button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <input type="url" className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" placeholder="URL (optional)" value={concept.url} onChange={e => updateEditWeekConcept(wIdx, cIdx, { url: e.target.value })} />
                                      <input type="number" min="0" className="w-28 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Duration (min)" value={concept.duration} onChange={e => updateEditWeekConcept(wIdx, cIdx, { duration: e.target.value })} />
                                      <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none flex-shrink-0">
                                        <input type="checkbox" className="w-3.5 h-3.5 text-brand-600 border-slate-300 rounded" checked={concept.isPreview} onChange={e => updateEditWeekConcept(wIdx, cIdx, { isPreview: e.target.checked })} /> Preview
                                      </label>
                                    </div>
                                  </div>
                                ))}
                                {week.concepts.length === 0 && (
                                  <div className="text-center py-3 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">No lessons added yet</div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={addEditWeek} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:border-brand-400 hover:text-brand-600 transition-colors flex items-center justify-center gap-2 font-medium">
                      <Plus size={16} /> Add Week / Module
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-8 mt-2">
                <Button type="button" variant="outline" onClick={() => { setIsEditModalOpen(false); setEditingCourse(null); setEditingCurriculum([]); }} disabled={isUpdating}>Cancel</Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? <span className="flex items-center gap-2"><RefreshCw size={16} className="animate-spin" /> Updating...</span> : 'Update Course'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Instructor Modal */}
      {isAddInstructorModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Add New Instructor</h3>
              <button onClick={() => setIsAddInstructorModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddInstructor} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="e.g. Venu Thota"
                    value={newInstructor.name}
                    onChange={e => setNewInstructor({ ...newInstructor, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="e.g. john@sed.com"
                    value={newInstructor.email}
                    onChange={e => setNewInstructor({ ...newInstructor, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Temporary Password <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="e.g. TempPass123"
                    value={newInstructor.password}
                    onChange={e => setNewInstructor({ ...newInstructor, password: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title (Optional)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="e.g. Senior Lecturer"
                    value={newInstructor.title}
                    onChange={e => setNewInstructor({ ...newInstructor, title: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddInstructorModalOpen(false)}>Cancel</Button>
                <Button type="submit">Add Instructor</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Add New Student</h3>
              <button type="button" onClick={() => setIsAddStudentModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddStudent} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="e.g. Ravi Kumar"
                    value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input type="email" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="e.g. ravi@example.com"
                    value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Temporary Password <span className="text-red-500">*</span></label>
                  <input type="text" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="e.g. TempPass123"
                    value={newStudent.password} onChange={e => setNewStudent({ ...newStudent, password: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 mt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddStudentModalOpen(false)}>Cancel</Button>
                <Button type="submit">Add Student</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="relative bg-gradient-to-r from-brand-600 to-brand-800 p-6 sm:p-8 flex-shrink-0">
              <button
                onClick={() => setSelectedStudent(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full border-4 border-white/30 bg-white text-brand-600 flex items-center justify-center text-4xl font-bold shadow-lg">
                  {selectedStudent.avatar}
                </div>
                <div className="text-center sm:text-left text-white">
                  <h2 className="text-3xl font-bold">{selectedStudent.name}</h2>
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 mt-2 text-brand-100">
                    <span className="flex items-center gap-1 text-sm"><Mail size={14} /> {selectedStudent.email}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="flex items-center gap-1 text-sm"><MapPin size={14} /> {selectedStudent.location}</span>
                  </div>
                  <div className="mt-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-white/20 text-white`}>
                      {selectedStudent.status} Student
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Personal Info */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Users size={16} className="text-brand-500" /> Personal Details
                    </h4>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500 text-sm">Phone</span>
                        <span className="text-slate-900 font-medium text-sm">{selectedStudent.phone}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500 text-sm">Join Date</span>
                        <span className="text-slate-900 font-medium text-sm">{selectedStudent.joined}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 text-sm">Last Active</span>
                        <span className="text-slate-900 font-medium text-sm">{selectedStudent.lastActive}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Activity size={16} className="text-brand-500" /> Recent Activity
                    </h4>
                    <div className="space-y-4">
                      {[
                        { action: 'Completed Module 4: Advanced Components', time: '2 hours ago' },
                        { action: 'Submitted Assignment: E-commerce UI', time: '1 day ago' },
                        { action: 'Logged in from new device', time: '2 days ago' }
                      ].map((act, i) => (
                        <div key={i} className="flex gap-3 relative">
                          <div className="w-2 h-full absolute left-1.5 top-2 bg-slate-100 -z-10"></div>
                          <div className="w-3 h-3 mt-1.5 rounded-full bg-brand-400 ring-4 ring-white"></div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{act.action}</p>
                            <p className="text-xs text-slate-400">{act.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Academic Info */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <GraduationCap size={16} className="text-brand-500" /> Enrolled Courses
                    </h4>
                    <div className="space-y-4">
                      {selectedStudent.enrollments && selectedStudent.enrollments.map((enrollment: any, idx: number) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h5 className="font-bold text-slate-900 text-sm line-clamp-1" title={enrollment.course}>{enrollment.course}</h5>
                              <p className="text-xs text-slate-500 mt-1">Enrolled: {enrollment.date}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide h-fit whitespace-nowrap ${enrollment.status === 'Completed' ? 'bg-green-100 text-green-700' :
                              enrollment.status === 'Active' ? 'bg-blue-100 text-blue-700' :
                                enrollment.status === 'Dropped' ? 'bg-red-100 text-red-700' :
                                  'bg-slate-100 text-slate-600'
                              }`}>
                              {enrollment.status}
                            </span>
                          </div>

                          <div>
                            <div className="flex justify-between items-end mb-1">
                              <span className="text-xs font-medium text-slate-700">Progress</span>
                              <span className="text-xs font-bold text-slate-900">{enrollment.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-1000 ${enrollment.progress === 100 ? 'bg-green-500' :
                                  enrollment.status === 'Dropped' ? 'bg-red-400' : 'bg-brand-600'
                                  }`}
                                style={{ width: `${enrollment.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!selectedStudent.enrollments || selectedStudent.enrollments.length === 0) && (
                        <div className="text-sm text-slate-500 italic">No enrollment data available.</div>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-start gap-3">
                      <Award className="text-brand-600 mt-1" size={20} />
                      <div>
                        <h5 className="font-bold text-brand-900 text-sm">Achievements</h5>
                        <p className="text-xs text-brand-700 mt-1">
                          Top performer in "React Fundamentals" quiz last week.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between gap-4">
              <div className="flex gap-3">
                <Button variant="outline" className="text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50">
                  <Lock size={16} className="mr-2" /> Reset Password
                </Button>
                <Button variant="outline" className="text-slate-600">
                  <FileText size={16} className="mr-2" /> Download Report
                </Button>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary">
                  <Mail size={16} className="mr-2" /> Send Email
                </Button>
                <Button onClick={() => alert('Saved!')}>
                  <Save size={16} className="mr-2" /> Save Changes
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-64'
          }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo-sed.png" alt="SED" className="w-8 h-8 rounded-lg" />
              <span className="text-xl font-display font-bold">Admin<span className="text-brand-500">.</span></span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400">
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4">
            <SidebarItem id="overview" icon={LayoutDashboard} label="Dashboard" />
            <SidebarItem id="analytics" icon={BarChart2} label="Analytics" />
            <SidebarItem id="courses" icon={BookOpen} label="Courses" />
            <SidebarItem id="students" icon={Users} label="Students" />
            <SidebarItem id="instructors" icon={GraduationCap} label="Instructors" />
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
      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Top Header */}
        {/* Top Header - Professional Glassmorphism Design */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 h-20 flex items-center justify-between px-8 z-40 sticky top-0 transition-all duration-200">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors">
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 capitalize tracking-tight">{activeTab}</h2>
              <p className="text-xs text-slate-500 hidden sm:block">Manage your {activeTab} preferences and data</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Advanced Animated Search */}
            <div className="relative hidden md:group md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400 group-focus-within:text-brand-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search anything..."
                className="pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-64 focus:w-80 transition-all duration-300 ease-in-out shadow-sm placeholder:text-slate-400 text-slate-700"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-xs text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">⌘K</span>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

            <div className="flex items-center gap-4">
              {/* Notification Bell with Pulse */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsModalOpen(true)}
                  className={`relative p-2.5 rounded-full transition-all duration-200 ${isNotificationsModalOpen || hasUnreadNotifications ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
                >
                  <Bell size={20} className={hasUnreadNotifications ? "animate-swing" : ""} />
                  {hasUnreadNotifications && (
                    <span className="absolute top-2 right-2.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white"></span>
                    </span>
                  )}
                </button>

                {/* Dropdown (Legacy - Disabled in favor of full modal) */}
                {false && isNotificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-[40]" onClick={() => setIsNotificationsOpen(false)}></div>
                    <div className="absolute right-0 mt-4 w-96 bg-white rounded-2xl shadow-xl border border-slate-100/80 ring-1 ring-slate-200/50 z-[50] overflow-hidden animate-fade-in-up origin-top-right backdrop-blur-sm">
                      <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
                        <h4 className="font-bold text-slate-900 text-sm">Notifications</h4>
                        <button
                          onClick={async () => {
                            try {
                              await adminService.markAllNotificationsRead();
                              setHasUnreadNotifications(false);
                              setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                            } catch (err) {
                              console.error("Failed to mark notifications read", err);
                            }
                          }}
                          className="text-xs text-brand-600 hover:text-brand-700 font-bold hover:underline px-2 py-1 rounded hover:bg-brand-50 transition-colors"
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
                          notifications.map((notif, idx) => (
                            <div key={idx} className={`p-4 border-b border-slate-50 hover:bg-slate-50/80 transition-colors cursor-pointer group ${!notif.read ? 'bg-brand-50/30' : ''}`}>
                              <div className="flex gap-3 items-start">
                                <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notif.read ? 'bg-brand-500' : 'bg-transparent'}`}></div>
                                <div>
                                  <p className="text-sm text-slate-800 font-semibold mb-1 group-hover:text-brand-700 transition-colors">{notif.title}</p>
                                  <p className="text-xs text-slate-500 leading-relaxed">{notif.message}</p>
                                  <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                                    {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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

              {/* User Profile - Professional Badge */}
              <div className="flex items-center gap-3 pl-2 cursor-pointer hover:bg-slate-50 rounded-lg p-1.5 transition-colors border border-transparent hover:border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20 text-sm ring-2 ring-white">
                  AU
                </div>
                <div className="hidden sm:block text-left mr-1">
                  <p className="text-sm font-bold text-slate-800 leading-none">Admin User</p>
                  <p className="text-[10px] font-bold text-brand-600 uppercase tracking-wide mt-1">Super Admin</p>
                </div>
                <ChevronLeft size={16} className="text-slate-400 rotate-[-90deg] hidden sm:block" />
              </div>
            </div>

            {/* Full Notification Modal */}
            {isNotificationsModalOpen && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">

                  {/* Modal Header */}
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white flex-shrink-0">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Bell className="text-brand-600" size={24} />
                        Notifications
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">Stay updated with your courses, assignments, and system alerts.</p>
                    </div>
                    <button
                      onClick={() => setIsNotificationsModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Filter Tabs */}
                  <div className="px-6 pt-4 border-b border-slate-100 flex gap-6">
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

                  {/* Scrollable List */}
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
                                <div className="flex-1 min-w-0">
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
                                          await adminService.markNotificationAsRead(notif._id);
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
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in-up">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-lg ${stat.color}`}>
                        <stat.icon size={24} />
                      </div>
                      <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <TrendingUp size={12} className="mr-1" /> {stat.change}
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</h3>
                    <p className="text-sm text-slate-500">{stat.title}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Enrollments Table */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 text-lg">Recent Enrollments</h3>
                    <Button variant="ghost" size="sm">View All</Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 text-left">
                        <tr>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Course</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {recentEnrollments.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xs">
                                  {item.studentName?.charAt(0) || '?'}
                                </div>
                                <span className="font-medium text-slate-900 text-sm">{item.studentName || 'Unknown'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{item.courseName || 'Unknown Course'}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{item.date}</td>
                            <td className="px-6 py-4">
                              <StatusBadge status={item.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Performing Courses */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                  <h3 className="font-bold text-slate-900 text-lg mb-6">Popular Courses</h3>
                  <div className="space-y-6">
                    {coursesList.slice(0, 4).map((course, idx) => (
                      <div key={course.id} className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={course.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{course.title}</h4>
                          <p className="text-xs text-slate-500">{course.students.toLocaleString()} students</p>
                        </div>
                        <div className="text-sm font-bold text-brand-600">
                          {course.rating} ★
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-6" onClick={() => setActiveTab('analytics')}>View Analysis</Button>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Performance Analytics</h3>
                  <p className="text-slate-500">Detailed insights into your platform's growth and engagement.</p>
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200">
                  <button className="px-3 py-1 text-sm font-medium bg-brand-50 text-brand-700 rounded-md">12 Months</button>
                  <button className="px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md">30 Days</button>
                  <button className="px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md">7 Days</button>
                </div>
              </div>

              {/* Revenue Chart Section */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Revenue Trends</h4>
                    <p className="text-sm text-slate-500">Monthly earnings breakdown</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center text-xs text-slate-500"><div className="w-3 h-3 bg-brand-600 rounded-sm mr-1"></div> Courses</span>
                    <span className="flex items-center text-xs text-slate-500"><div className="w-3 h-3 bg-brand-200 rounded-sm mr-1"></div> Services</span>
                  </div>
                </div>

                {/* Custom CSS Bar Chart */}
                <div className="h-64 flex items-end justify-between gap-2 sm:gap-4">
                  {analyticsData?.revenueTrends && analyticsData.revenueTrends.length > 0 ? (() => {
                    const maxRevenue = Math.max(...analyticsData.revenueTrends.map((d: any) => d.revenue));
                    return analyticsData.revenueTrends.map((data: any, i: number) => {
                      const heightPercent = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                      const monthName = new Date(0, data._id.month - 1).toLocaleString('default', { month: 'short' });
                      return (
                        <div key={i} className="w-full flex flex-col justify-end group cursor-pointer relative">
                          <div className="w-full bg-brand-100 rounded-t-sm hover:bg-brand-200 transition-all relative overflow-hidden" style={{ height: '100%' }}>
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className="absolute bottom-0 w-full bg-brand-600 rounded-t-sm group-hover:bg-brand-500 transition-colors"
                            ></div>
                          </div>
                          {/* Tooltip */}
                          <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
                            ₹{data.revenue.toLocaleString('en-IN')}
                          </div>
                          <span className="text-xs text-slate-400 text-center mt-3 font-medium">{monthName}</span>
                        </div>
                      );
                    });
                  })() : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      No revenue data available for recent months.
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Traffic Sources */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><PieChart size={20} /></div>
                    <h4 className="text-lg font-bold text-slate-900">Traffic Sources</h4>
                  </div>
                  <div className="space-y-6">
                    {analyticsData?.trafficSources ? analyticsData.trafficSources.map((item: any, idx: number) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600 font-medium">{item.label}</span>
                          <span className="text-slate-900 font-bold">{item.percent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5">
                          <div style={{ width: `${item.percent}%` }} className={`h-2.5 rounded-full ${item.color}`}></div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-4 text-slate-500">Loading data...</div>
                    )}
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Clock size={20} /></div>
                      <p className="text-sm text-slate-500 font-medium">Avg. Session Duration</p>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900">{analyticsData?.sessionMetrics?.avgSessionDuration || '0m 0s'}</h3>
                    <p className="text-green-600 text-xs font-bold mt-2 flex items-center gap-1"><ArrowUpRight size={14} /> {analyticsData?.sessionMetrics?.sessionDurationChange || '0%'} vs last month</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Activity size={20} /></div>
                      <p className="text-sm text-slate-500 font-medium">Bounce Rate</p>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900">{analyticsData?.sessionMetrics?.bounceRate || '0%'}</h3>
                    <p className="text-green-600 text-xs font-bold mt-2 flex items-center gap-1"><ArrowUpRight size={14} /> {analyticsData?.sessionMetrics?.bounceRateChange || '0%'} improvement</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 sm:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><MapPin size={20} /></div>
                        <h4 className="font-bold text-slate-900">Top Regions (AP Districts)</h4>
                      </div>
                      <Button variant="ghost" size="sm">View Full Report</Button>
                    </div>
                    <div className="space-y-3">
                      {analyticsData?.topRegions ? analyticsData.topRegions.map((region: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-slate-500">0{idx + 1}</span>
                            <span className="text-sm font-medium text-slate-900">{region.district}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-slate-900 block">{typeof region.users === 'number' ? region.users.toLocaleString() : region.users}</span>
                            <span className="text-xs text-slate-500">{region.percent}</span>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-4 text-slate-500">Loading regions...</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Course Analysis Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-lg">Course Performance</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 text-left">
                      <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Course Name</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Views</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Unique Sales</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Conversion Rate</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {coursesList.slice(0, 5).map((course, idx) => {
                        const views = Math.floor(Math.random() * 50000) + 10000;
                        const sales = Math.floor(views * 0.08);
                        const conversion = ((sales / views) * 100).toFixed(1);

                        return (
                          <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img src={course.image} alt="" className="w-8 h-8 rounded object-cover" />
                                <span className="text-sm font-medium text-slate-900">{course.title}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{views.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{sales.toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900">{conversion}%</span>
                                <div className="w-16 bg-slate-100 rounded-full h-1.5">
                                  <div style={{ width: `${conversion}% ` }} className="h-1.5 rounded-full bg-green-500"></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                              ₹{(sales * 2500).toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in-up">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

                {selectedCourseIds.length > 0 ? (
                  <div className="flex items-center gap-4 w-full sm:w-auto bg-brand-50 p-2 rounded-lg border border-brand-100 animate-fade-in-up">
                    <span className="text-brand-700 font-medium text-sm pl-2">{selectedCourseIds.length} Selected</span>
                    <div className="h-4 w-px bg-brand-200"></div>
                    <div className="flex gap-2">
                      <button onClick={handleBulkArchiveCourses} className="px-3 py-1.5 text-xs font-medium bg-white text-slate-600 border border-slate-200 rounded-md hover:text-brand-600 hover:border-brand-200 transition-colors flex items-center gap-1">
                        <Archive size={14} /> Archive
                      </button>
                      <button onClick={handleBulkDeleteCourses} className="px-3 py-1.5 text-xs font-medium bg-white text-red-600 border border-slate-200 rounded-md hover:border-red-200 hover:bg-red-50 transition-colors flex items-center gap-1">
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Course Management</h3>
                      <p className="text-slate-500 text-sm">Manage your course catalog and content.</p>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="text-slate-600"><Filter size={18} className="mr-2" /> Filter</Button>
                      <Button onClick={() => setIsAddModalOpen(true)}><Plus size={18} className="mr-2" /> Add New Course</Button>
                    </div>
                  </>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 text-left">
                    <tr>
                      <th className="px-6 py-4 w-10">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4 cursor-pointer"
                          checked={selectedCourseIds.length === coursesList.length && coursesList.length > 0}
                          onChange={toggleSelectAllCourses}
                        />
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Course Name</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Instructor</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Students</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {coursesList.length > 0 ? coursesList.map((course) => (
                      <tr key={course.id} className={`hover:bg-slate-50 ${selectedCourseIds.map(String).includes(String(course.id)) ? 'bg-brand-50/30' : ''}`}>
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4 cursor-pointer"
                            checked={selectedCourseIds.map(String).includes(String(course.id))}
                            onChange={() => toggleSelectCourse(course.id)}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={course.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            <div className="font-medium text-slate-900 text-sm">{course.title}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{course.instructor}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">{course.category}</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">{course.price}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{course.students.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditCourse(course)}
                              className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                              title="Edit Course"
                            >
                              <Edit size={18} />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Course" onClick={() => handleDeleteCourse(course.id)}>
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                          No courses found. Add a new course to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Instructors Tab */}
          {/* Instructors Tab */}
          {activeTab === 'instructors' && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Header */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Instructors</h3>
                  <p className="text-slate-500 text-sm">Manage your teaching staff and their assignments.</p>
                </div>
                <div>
                  <Button onClick={() => setIsAddInstructorModalOpen(true)}>
                    <Plus size={18} className="mr-2" /> Add Instructor
                  </Button>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {instructors.map((instructor, idx) => (
                  <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.name)}&background=random`}
                          alt={instructor.name}
                          className="w-14 h-14 rounded-full"
                        />
                        <div>
                          <h3 className="font-bold text-slate-900">{instructor.name}</h3>
                          <p className="text-xs text-brand-600 font-bold uppercase">{instructor.role}</p>
                        </div>
                      </div >
                      <div className="p-1 rounded-full hover:bg-slate-100 cursor-pointer text-slate-400">
                        <MoreVertical size={18} />
                      </div>
                    </div >

                    <div className="grid grid-cols-3 gap-2 mb-6 text-center">
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <p className="text-xs text-slate-500 uppercase font-bold">Students</p>
                        <p className="font-bold text-slate-900">{instructor.students ? instructor.students.toLocaleString() : 0}</p>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <p className="text-xs text-slate-500 uppercase font-bold">Rating</p>
                        <p className="font-bold text-slate-900">{instructor.rating || 'N/A'}</p>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <p className="text-xs text-slate-500 uppercase font-bold">Reviews</p>
                        <p className="font-bold text-slate-900">{instructor.reviews || 0}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" size="sm" className="flex-1">View Profile</Button>
                      <Button size="sm" className="flex-1">Message</Button>
                    </div>
                  </div >
                ))}
              </div>
            </div >
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <div className="animate-fade-in-up space-y-8">
              {/* Student Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-500 font-medium text-sm">Total Students</h3>
                    <div className="p-2 bg-brand-50 rounded-lg text-brand-600"><Users size={20} /></div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{students.length.toLocaleString()}</p>
                  <p className="text-green-600 text-xs font-bold mt-1 flex items-center gap-1"><TrendingUp size={12} /> +15% this month</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-500 font-medium text-sm">Active Learners</h3>
                    <div className="p-2 bg-green-50 rounded-lg text-green-600"><BookOpen size={20} /></div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">
                    {students.filter(s => s.enrolledCourses?.length > 0).length.toLocaleString()}
                  </p>
                  <p className="text-green-600 text-xs font-bold mt-1 flex items-center gap-1"><CheckCircle size={12} />
                    {students.length > 0 ? Math.round((students.filter(s => s.enrolledCourses?.length > 0).length / students.length) * 100) : 0}% engagement
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-500 font-medium text-sm">Course Completion</h3>
                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><Award size={20} /></div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">
                    {(() => {
                      const totalProgress = students.reduce((acc, s) => {
                        if (!s.enrolledCourses || s.enrolledCourses.length === 0) return acc;
                        const studentAvg = s.enrolledCourses.reduce((sum: number, c: any) => sum + (c.progress || 0), 0) / s.enrolledCourses.length;
                        return acc + studentAvg;
                      }, 0);
                      return students.length > 0 ? Math.round(totalProgress / students.length) : 0;
                    })()}%
                  </p>
                  <p className="text-slate-400 text-xs mt-1">Avg. completion rate</p>
                </div>
              </div>

              {/* Students Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                  {selectedStudentIds.length > 0 ? (
                    <div className="flex items-center gap-4 w-full md:w-auto bg-brand-50 p-2 rounded-lg border border-brand-100">
                      <span className="text-brand-700 font-medium text-sm pl-2">{selectedStudentIds.length} Selected</span>
                      <div className="h-4 w-px bg-brand-200"></div>
                      <div className="flex gap-2">
                        <button onClick={handleBulkEmailStudents} className="px-3 py-1.5 text-xs font-medium bg-white text-slate-600 border border-slate-200 rounded-md hover:text-brand-600 hover:border-brand-200 transition-colors flex items-center gap-1">
                          <Mail size={14} /> Email
                        </button>
                        <button onClick={handleBulkSuspendStudents} className="px-3 py-1.5 text-xs font-medium bg-white text-orange-600 border border-slate-200 rounded-md hover:border-orange-200 hover:bg-orange-50 transition-colors flex items-center gap-1">
                          <Ban size={14} /> Suspend
                        </button>
                        <button onClick={handleBulkDeleteStudents} className="px-3 py-1.5 text-xs font-medium bg-white text-red-600 border border-slate-200 rounded-md hover:border-red-200 hover:bg-red-50 transition-colors flex items-center gap-1">
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
                      <h3 className="text-xl font-bold text-slate-900">Student Directory</h3>
                      <div className="hidden md:block w-px h-6 bg-slate-200"></div>
                      {/* Filter Dropdown */}
                      <div className="relative w-full sm:w-40">
                        <select
                          value={studentStatusFilter}
                          onChange={(e) => setStudentStatusFilter(e.target.value)}
                          className="appearance-none w-full bg-slate-50 border border-slate-200 text-slate-700 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer font-medium"
                        >
                          <option value="All">All Status</option>
                          <option value="Active">Active</option>
                          <option value="Completed">Completed</option>
                          <option value="Pending">Pending</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                          <ChevronLeft size={14} className="rotate-[-90deg]" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-grow md:flex-grow-0">
                      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search students..."
                        className="w-full md:w-64 pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" className="hidden sm:flex"><Download size={18} className="mr-2" /> Export</Button>
                    <Button onClick={() => setIsAddStudentModalOpen(true)}><Plus size={18} className="mr-2" /> Add Student</Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 text-left">
                      <tr>
                        <th className="px-6 py-4 w-10">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4 cursor-pointer"
                            checked={selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0}
                            onChange={toggleSelectAllStudents}
                          />
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrolled Course</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Progress</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Join Date</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                        <tr
                          key={student.id}
                          className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedStudentIds.includes(student.id) ? 'bg-brand-50/30' : ''}`}
                          onClick={() => setSelectedStudent(student)}
                        >
                          <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4 cursor-pointer"
                              checked={selectedStudentIds.includes(student.id)}
                              onChange={() => toggleSelectStudent(student.id)}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-sm border border-brand-200">
                                {student.avatar}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-sm hover:text-brand-600 transition-colors">{student.name}</div>
                                <div className="text-xs text-slate-500">{student.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 font-medium max-w-xs truncate" title={student.enrolledCourses?.[0]?.courseSlug || "No active course"}>
                            {student.enrolledCourses?.[0]?.courseSlug ? student.enrolledCourses[0].courseSlug.replace(/-/g, ' ') : "Not Enrolled"}
                          </td>
                          <td className="px-6 py-4 w-32">
                            <div className="w-full bg-slate-200 rounded-full h-2 mb-1">
                              <div
                                className={`h-2 rounded-full ${student.enrolledCourses?.[0]?.progress === 100 ? 'bg-green-500' : 'bg-brand-500'}`}
                                style={{ width: `${student.enrolledCourses?.[0]?.progress || 0}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-slate-500 text-right">{student.enrolledCourses?.[0]?.progress || 0}%</div>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={student.status || "Active"} />
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "N/A"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => setSelectedStudent(student)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="View Profile">
                                <Users size={16} />
                              </button>
                              <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" title="Message">
                                <Mail size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                            <div className="flex flex-col items-center">
                              <Search size={48} className="text-slate-200 mb-4" />
                              <p className="text-lg font-medium text-slate-700">No students found</p>
                              <p className="text-sm">Try adjusting your search terms or filters.</p>
                              <Button variant="outline" className="mt-4" onClick={() => { setStudentSearch(''); setStudentStatusFilter('All'); }}>Clear Filters</Button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <span className="text-sm text-slate-500">
                    Showing <span className="font-bold text-slate-900">{filteredStudents.length}</span> results
                  </span>
                  <div className="flex gap-2">
                    <button disabled className="p-2 rounded-lg border border-slate-200 bg-white text-slate-300 cursor-not-allowed">
                      <ChevronLeft size={16} />
                    </button>
                    <button className="px-3 py-1 rounded-lg border border-brand-500 bg-brand-50 text-brand-600 font-bold text-sm">1</button>
                    <button className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-sm font-medium">2</button>
                    <button className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-sm font-medium">3</button>
                    <span className="px-2 py-1 text-slate-400">...</span>
                    <button className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-brand-600 transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Platform Settings Tab */}
          {activeTab === 'settings' && (
            <div className="animate-fade-in-up space-y-8 pb-12 max-w-7xl mx-auto">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4 pb-6 border-b border-slate-200/60">
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Platform Settings</h3>
                  <p className="text-slate-500 mt-2 text-lg">Manage your application configuration, security, and preferences.</p>
                </div>
                <Button id="save-settings-btn" onClick={handleSaveSettings} className="shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 transition-all px-6">
                  <Save size={18} className="mr-2" /> Save Changes
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* General Settings */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl ring-4 ring-blue-50/50"><Globe size={24} /></div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">General Information</h4>
                      <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">Platform Basics</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Platform Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700"
                        value={settingsData.general.platformName}
                        onChange={(e) => handleSettingChange('general', 'platformName', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Support Email</label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700"
                        value={settingsData.general.supportEmail}
                        onChange={(e) => handleSettingChange('general', 'supportEmail', e.target.value)}
                      />
                    </div>
                    <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">Maintenance Mode</p>
                        <p className="text-xs text-slate-500 mt-0.5">Disable access for users</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('general', 'maintenanceMode', !settingsData.general.maintenanceMode)}
                        className={`w-12 h-7 rounded-full transition-all duration-300 relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 ${settingsData.general.maintenanceMode ? 'bg-brand-600' : 'bg-slate-300'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm transition-all duration-300 ${settingsData.general.maintenanceMode ? 'left-6' : 'left-1'}`}></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">Public Registration</p>
                        <p className="text-xs text-slate-500 mt-0.5">Allow new signups</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('general', 'publicRegistration', !settingsData.general.publicRegistration)}
                        className={`w-12 h-7 rounded-full transition-all duration-300 relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 ${settingsData.general.publicRegistration ? 'bg-brand-600' : 'bg-slate-300'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm transition-all duration-300 ${settingsData.general.publicRegistration ? 'left-6' : 'left-1'}`}></div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl ring-4 ring-red-50/50"><Shield size={24} /></div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">Security</h4>
                      <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">Access Control</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-3 px-4 bg-red-50/50 rounded-xl border border-red-100">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">Two-Factor Auth (2FA)</p>
                        <p className="text-xs text-slate-500 mt-0.5">Recommended for admins</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('security', 'twoFactorAuth', !settingsData.security.twoFactorAuth)}
                        className={`w-12 h-7 rounded-full transition-all duration-300 relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${settingsData.security.twoFactorAuth ? 'bg-red-600' : 'bg-slate-300'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm transition-all duration-300 ${settingsData.security.twoFactorAuth ? 'left-6' : 'left-1'}`}></div>
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Minimum Password Length</label>
                      <div className="relative">
                        <select
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none appearance-none font-medium text-slate-700"
                          value={settingsData.security.minPasswordLength}
                          onChange={(e) => handleSettingChange('security', 'minPasswordLength', e.target.value)}
                        >
                          <option value="6">6 Characters</option>
                          <option value="8">8 Characters</option>
                          <option value="12">12 Characters (Recommended)</option>
                        </select>
                        <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 rotate-[-90deg] text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Session Timeout (Minutes)</label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700"
                        value={settingsData.security.sessionTimeout}
                        onChange={(e) => handleSettingChange('security', 'sessionTimeout', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl ring-4 ring-yellow-50/50"><Bell size={24} /></div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">Notifications</h4>
                      <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">Alert Preferences</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: 'Email Alerts', sub: 'Receive daily summary emails', key: 'emailAlerts' },
                      { label: 'New Student Notification', sub: 'When a new student registers', key: 'newStudentNotify' },
                      { label: 'Instructor Application', sub: 'When an instructor applies', key: 'instructorAppNotify' },
                      { label: 'Marketing Emails', sub: 'Receive tips and product updates', key: 'marketingEmails' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-3 px-4 bg-slate-50/50 rounded-xl border border-slate-50 hover:bg-slate-50 hover:border-slate-100 transition-colors">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{item.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange('notifications', item.key, !settingsData.notifications[item.key as keyof typeof settingsData.notifications])}
                          className={`w-12 h-7 rounded-full transition-all duration-300 relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 ${settingsData.notifications[item.key as keyof typeof settingsData.notifications] ? 'bg-brand-600' : 'bg-slate-300'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm transition-all duration-300 ${settingsData.notifications[item.key as keyof typeof settingsData.notifications] ? 'left-6' : 'left-1'}`}></div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Billing Settings */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl ring-4 ring-green-50/50"><CreditCard size={24} /></div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">Billing & Payment</h4>
                      <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">Financial Config</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Currency</label>
                        <div className="relative">
                          <select
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none appearance-none font-medium text-slate-700"
                            value={settingsData.billing.currency}
                            onChange={(e) => handleSettingChange('billing', 'currency', e.target.value)}
                          >
                            <option value="INR">INR (₹)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                          </select>
                          <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 rotate-[-90deg] text-slate-400 pointer-events-none" size={16} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Tax Rate (%)</label>
                        <input
                          type="number"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700"
                          value={settingsData.billing.taxRate}
                          onChange={(e) => handleSettingChange('billing', 'taxRate', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Invoice Prefix</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700"
                        value={settingsData.billing.invoicePrefix}
                        onChange={(e) => handleSettingChange('billing', 'invoicePrefix', e.target.value)}
                      />
                    </div>
                    <div className="pt-4 border-t border-slate-100 mt-4">
                      <Button variant="outline" className="w-full py-6 border-slate-200 text-slate-600 hover:border-brand-200 hover:text-brand-600 hover:bg-brand-50 group font-bold">
                        <Lock size={18} className="mr-2 group-hover:text-brand-500 transition-colors" /> Configure Payment Gateway
                      </Button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
