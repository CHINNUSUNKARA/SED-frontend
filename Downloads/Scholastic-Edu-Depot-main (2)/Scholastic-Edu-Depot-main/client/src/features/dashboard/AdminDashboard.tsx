
import React, { useState, useEffect } from 'react';
import { ViewState } from '../../App';
import {
  LayoutDashboard, BookOpen, Users, GraduationCap, Settings, LogOut,
  Bell, Search, Plus, MoreVertical, TrendingUp, DollarSign,
  Filter, Menu, X, Edit, Trash2, Archive, Mail, CheckCircle, AlertCircle, Download, Award, Check,
  Globe, Shield, CreditCard, Save, Lock, IndianRupee, PieChart, BarChart2, Activity, MousePointer, Clock, MapPin, ArrowUpRight,
  Phone, Calendar, FileText, ChevronLeft, ChevronRight, ChevronDown, RefreshCw, Key, Ban
} from 'lucide-react';
import { COURSE_CATEGORIES } from '../../constants';
import { Button } from '../../components/ui/Button';

import * as adminService from '../../services/adminService';
import { userService } from '../../services/userService';

interface AdminDashboardProps {
  onNavigate: (view: ViewState) => void;
}

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
  const [newCourse, setNewCourse] = useState({
    title: '',
    tagline: '',
    description: '',
    instructor: '',
    category: 'Development',
    price: '',
    duration: '',
    level: 'Beginner',
    image: '',
    lessons: 1
  });

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

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: string[] = [];

    if (!newCourse.title.trim()) errors.push("Course Title is required");
    if (!newCourse.description.trim()) errors.push("Description is required");
    if (!newCourse.instructor.trim()) errors.push("Instructor is required");
    if (!newCourse.duration.trim()) errors.push("Duration is required");

    // Validate Price
    if (!newCourse.price.trim()) {
      errors.push("Price is required");
    } else {
      const priceNum = parseFloat(newCourse.price.replace(/[^0-9.]/g, ''));
      if (isNaN(priceNum) || priceNum < 0) {
        errors.push("Price must be a valid positive number (e.g., ₹19,999)");
      }
    }

    // Validate Lessons
    if (newCourse.lessons <= 0) {
      errors.push("Lessons must be greater than 0");
    }

    if (errors.length > 0) {
      alert("Validation Failed:\n\n• " + errors.join("\n• "));
      return;
    }

    try {
      const slug = newCourse.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const coursePayload = {
        name: newCourse.title,
        slug: slug,
        tagline: newCourse.tagline,
        description: newCourse.description,
        instructor: newCourse.instructor,
        category: newCourse.category,
        pricing: {
          amount: parseFloat(newCourse.price.replace(/[^0-9.]/g, '')) || 0,
          currency: 'INR'
        },
        duration: newCourse.duration,
        level: newCourse.level,
        imageUrl: newCourse.image,
        lessons: newCourse.lessons,
      };

      await adminService.createCourse(coursePayload);

      // Refresh courses
      const coursesResponse = await adminService.getAllCourses();
      if (coursesResponse.success) {
        setCoursesList(coursesResponse.data);
      } else if (Array.isArray(coursesResponse)) {
        // Handle different response formats if needed
        setCoursesList(coursesResponse);
      }

      alert(`Course "${newCourse.title}" added successfully!`);
      setIsAddModalOpen(false);

      // Reset Form
      setNewCourse({
        title: '',
        tagline: '',
        description: '',
        instructor: '',
        category: 'Development',
        price: '',
        duration: '',
        level: 'Beginner',
        image: '',
        lessons: 1
      });
    } catch (err: any) {
      console.error("Failed to add course:", err);
      alert("Failed to add course: " + (err.response?.data?.message || err.message));
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
    // Load course data into editing state
    setEditingCourse({
      ...course,
      price: course.price?.toString() || ''
    });
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
        tagline: editingCourse.tagline || '',
        description: editingCourse.description,
        instructor: editingCourse.instructor,
        category: editingCourse.category,
        pricing: {
          amount: parseFloat(editingCourse.price.toString().replace(/[^0-9.]/g, '')) || 0,
          currency: 'INR'
        },
        duration: editingCourse.duration,
        level: editingCourse.level || 'Beginner',
        imageUrl: editingCourse.image,
        lessons: editingCourse.lessons || 0,
        slug: editingCourse.slug
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0">
              <h3 className="text-xl font-bold text-slate-900">Add New Course</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddCourse} className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Course Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="e.g. Advanced React Patterns"
                    value={newCourse.title}
                    onChange={e => setNewCourse({ ...newCourse, title: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tagline <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="Short course tagline..."
                    value={newCourse.tagline}
                    onChange={e => setNewCourse({ ...newCourse, tagline: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                    placeholder="Brief summary of the course content..."
                    value={newCourse.description}
                    onChange={e => setNewCourse({ ...newCourse, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Instructor <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="Instructor Name"
                    value={newCourse.instructor}
                    onChange={e => setNewCourse({ ...newCourse, instructor: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                    value={newCourse.category}
                    onChange={e => setNewCourse({ ...newCourse, category: e.target.value })}
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
                    value={newCourse.price}
                    onChange={e => setNewCourse({ ...newCourse, price: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duration <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 4 Weeks"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    value={newCourse.duration}
                    onChange={e => setNewCourse({ ...newCourse, duration: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
                  <select
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                    value={newCourse.level}
                    onChange={e => setNewCourse({ ...newCourse, level: e.target.value })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lessons <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    value={newCourse.lessons}
                    onChange={e => setNewCourse({ ...newCourse, lessons: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    value={newCourse.image}
                    onChange={e => setNewCourse({ ...newCourse, image: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-8 mt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
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
              </div>

              <div className="flex justify-end gap-3 pt-8 mt-2">
                <Button type="button" variant="outline" onClick={() => { setIsEditModalOpen(false); setEditingCourse(null); }} disabled={isUpdating}>Cancel</Button>
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
