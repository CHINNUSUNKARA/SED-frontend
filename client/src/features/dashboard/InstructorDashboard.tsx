

import React, { useState, useEffect, useRef } from 'react';
import { ViewState } from '../../App';
import {
    LayoutDashboard, BookOpen, Users, Calendar, FileText, Settings, LogOut,
    Bell, Search, Plus, MoreHorizontal, Video, Edit2, MessageCircle, Star,
    TrendingUp, Clock, CheckCircle, Menu, X, DollarSign, Eye, Award, Upload, Image as ImageIcon, Save,
    ChevronLeft, Trash2, GripVertical, BarChart2, MousePointer, PlayCircle, Lock, Mail, Filter, ChevronRight,
    Bold, Italic, Underline, List, AlignLeft, Link2, Type
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { COURSE_CATEGORIES } from '../../constants';
import { instructorService, InstructorStats, InstructorCourse, InstructorStudent } from '../../services/instructorService';
import { userService, UserProfile } from '../../services/userService';

interface InstructorDashboardProps {
    onNavigate: (view: ViewState) => void;
}

type InstructorTab = 'dashboard' | 'courses' | 'assignments' | 'students' | 'schedule' | 'settings' | 'edit-course' | 'course-analytics';

interface NewCourse {
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
    // Learning
    learningObjectives: string;
    highlights: string;
    prerequisites: string;
    targetAudience: string;
    tools: string;
    // Pricing
    isFree: boolean;
    price: string;
    discountedPrice: string;
    // Media
    imageUrl: string;
    bannerUrl: string;
    promoVideoUrl: string;
    // Live details
    startDate: string;
    endDate: string;
    maxStudents: string;
    batchName: string;
    meetingPlatform: string;
    // Certification
    hasCertification: boolean;
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

interface InstructorEvent {
    id: number;
    title: string;
    date: string;
    time: string;
    type: 'Deadline' | 'Live Class' | 'Meeting' | 'Task';
}

// --- Rich Text Editor Component ---
interface RichTextEditorProps {
    label?: string;
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    height?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ label, value, onChange, placeholder, height = "h-40" }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const isFocused = useRef(false);

    // Sync value from props to editor content if they differ significantly
    // This handles initial load and external updates (like resets), but skips while typing to avoid cursor jumps
    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            // Only update if not focused to prevent cursor jumping, or if the new value is empty (reset)
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
                {/* Toolbar */}
                <div className="flex items-center gap-1 p-2 border-b border-slate-200 bg-slate-50 overflow-x-auto flex-shrink-0">
                    <button type="button" onClick={() => applyFormat('bold')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors" title="Bold"><Bold size={16} /></button>
                    <button type="button" onClick={() => applyFormat('italic')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors" title="Italic"><Italic size={16} /></button>
                    <button type="button" onClick={() => applyFormat('underline')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors" title="Underline"><Underline size={16} /></button>
                    <div className="w-px h-4 bg-slate-300 mx-1"></div>
                    <button type="button" onClick={() => applyFormat('insertUnorderedList')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors" title="Bullet List"><List size={16} /></button>
                    <button type="button" onClick={() => applyFormat('justifyLeft')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors" title="Align Left"><AlignLeft size={16} /></button>
                    <div className="w-px h-4 bg-slate-300 mx-1"></div>
                    <button type="button" onClick={() => applyFormat('formatBlock', 'H3')} className="p-1.5 hover:bg-slate-200 rounded text-slate-600 font-bold text-xs transition-colors" title="Heading">H3</button>
                    <button type="button" onClick={() => {
                        const url = prompt('Enter URL:');
                        if (url) applyFormat('createLink', url);
                    }} className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors" title="Link"><Link2 size={16} /></button>
                </div>

                {/* Editing Area */}
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
                        <div
                            className="absolute top-4 left-4 text-slate-400 text-sm pointer-events-none select-none"
                            onClick={() => editorRef.current?.focus()}
                        >
                            {placeholder}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Mock data removed. Using dynamic data from instructorService.

export const InstructorDashboard: React.FC<InstructorDashboardProps> = ({ onNavigate }) => {
    const [activeTab, setActiveTab] = useState<InstructorTab>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

    // State for dashboard data
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<InstructorStats | null>(null);
    const [courses, setCourses] = useState<InstructorCourse[]>([]);
    const [students, setStudents] = useState<InstructorStudent[]>([]);
    const [scheduleItems, setScheduleItems] = useState<InstructorEvent[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial Data Fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userProfile, instructorStats, instructorCourses, instructorStudents, instructorSchedule, instructorAssignments] = await Promise.all([
                    userService.getProfile(),
                    instructorService.getStats(),
                    instructorService.getCourses(),
                    instructorService.getStudents(),
                    instructorService.getSchedule(),
                    instructorService.getAssignments()
                ]);
                setProfile(userProfile);
                setStats(instructorStats);
                setCourses(instructorCourses);
                setStudents(instructorStudents);
                setScheduleItems(instructorSchedule.length ? instructorSchedule : []);
                setAssignments(instructorAssignments);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Student List State
    const [studentSearch, setStudentSearch] = useState('');
    const [courseFilter, setCourseFilter] = useState('All');
    const [selectedStudent, setSelectedStudent] = useState<InstructorStudent | null>(null);

    // Schedule State
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<InstructorEvent>({
        id: 0,
        title: '',
        date: '',
        time: '',
        type: 'Meeting'
    });

    // Add Course Modal State
    const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
    const [newCourse, setNewCourse] = useState<NewCourse>({
        title: '',
        slug: '',
        tagline: '',
        shortDescription: '',
        description: '',
        courseType: 'self-paced',
        category: 'Development',
        subCategory: '',
        level: 'Beginner',
        language: 'English',
        tags: '',
        duration: '',
        totalHours: '',
        learningObjectives: '',
        highlights: '',
        prerequisites: '',
        targetAudience: '',
        tools: '',
        isFree: false,
        price: '',
        discountedPrice: '',
        imageUrl: '',
        bannerUrl: '',
        promoVideoUrl: '',
        startDate: '',
        endDate: '',
        maxStudents: '',
        batchName: '',
        meetingPlatform: '',
        hasCertification: false,
    });
    const [curriculum, setCurriculum] = useState<CurriculumWeekForm[]>([]);

    const emptyWeekForm = (n: number): CurriculumWeekForm => ({
        weekNumber: n, title: '', description: '', isLocked: false, unlockAfterDays: '', concepts: [], _expanded: true,
    });
    const emptyConceptForm = (): CurriculumConceptForm => ({ title: '', type: 'video', url: '', duration: '', isPreview: false });

    const addWeek = () => setCurriculum(prev => [...prev, emptyWeekForm(prev.length + 1)]);
    const removeWeek = (i: number) => setCurriculum(prev => prev.filter((_, j) => j !== i).map((w, j) => ({ ...w, weekNumber: j + 1 })));
    const updateWeek = (i: number, ch: Partial<CurriculumWeekForm>) => setCurriculum(prev => prev.map((w, j) => j === i ? { ...w, ...ch } : w));
    const addWeekConcept = (wi: number) => setCurriculum(prev => prev.map((w, j) => j === wi ? { ...w, concepts: [...w.concepts, emptyConceptForm()] } : w));
    const removeWeekConcept = (wi: number, ci: number) => setCurriculum(prev => prev.map((w, j) => j === wi ? { ...w, concepts: w.concepts.filter((_, k) => k !== ci) } : w));
    const updateWeekConcept = (wi: number, ci: number, ch: Partial<CurriculumConceptForm>) => setCurriculum(prev => prev.map((w, j) => j === wi ? { ...w, concepts: w.concepts.map((c, k) => k === ci ? { ...c, ...ch } : c) } : w));

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

    // Edit State
    const [editingCourseDescription, setEditingCourseDescription] = useState('');

    // Lesson Editing State
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState<any>(null);

    const SidebarItem = ({ id, icon: Icon, label }: { id: InstructorTab, icon: any, label: string }) => (
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

    const handleCreateCourse = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCourse.title || !newCourse.description || (!newCourse.isFree && !newCourse.price)) {
            alert('Please fill in all required fields marked with *');
            return;
        }
        const _curriculumPayload = serializeCurriculum(curriculum);
        alert(`Course "${newCourse.title}" created successfully as a draft!`);
        setIsAddCourseModalOpen(false);
        setActiveTab('courses');
        setCurriculum([]);
        setNewCourse({
            title: '', slug: '', tagline: '', shortDescription: '', description: '',
            courseType: 'self-paced', category: 'Development', subCategory: '', level: 'Beginner',
            language: 'English', tags: '', duration: '', totalHours: '',
            learningObjectives: '', highlights: '', prerequisites: '', targetAudience: '', tools: '',
            isFree: false, price: '', discountedPrice: '',
            imageUrl: '', bannerUrl: '', promoVideoUrl: '',
            startDate: '', endDate: '', maxStudents: '', batchName: '', meetingPlatform: '',
            hasCertification: false,
        });
    };

    const getSelectedCourse = () => courses.find(c => c.id === selectedCourseId) || courses[0];

    // Initialize editing state when course changes
    useEffect(() => {
        if (selectedCourseId) {
            setEditingCourseDescription((getSelectedCourse() as any).description || '');
        }
    }, [selectedCourseId]);

    // Filter Students
    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
            student.email.toLowerCase().includes(studentSearch.toLowerCase());
        const matchesCourse = courseFilter === 'All' || student.course === courseFilter;
        return matchesSearch && matchesCourse;
    });

    const openLessonEditor = (lesson: any) => {
        setEditingLesson({ ...lesson });
        setIsLessonModalOpen(true);
    };

    const saveLessonContent = () => {
        // In a real app, update the MOCK_CURRICULUM state here
        alert(`Content saved for lesson: ${editingLesson.title}`);
        setIsLessonModalOpen(false);
    };

    // Schedule Logic
    const openAddEventModal = () => {
        setCurrentEvent({ id: 0, title: '', date: '', time: '', type: 'Meeting' });
        setIsEventModalOpen(true);
    };

    const openEditEventModal = (event: any) => {
        setCurrentEvent({ ...event });
        setIsEventModalOpen(true);
    };

    const handleSaveEvent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentEvent.title || !currentEvent.date || !currentEvent.time) {
            alert("Please fill in all fields.");
            return;
        }

        if (currentEvent.id === 0) {
            // Create new
            const newId = Math.max(...scheduleItems.map(i => i.id), 0) + 1;
            setScheduleItems([...scheduleItems, { ...currentEvent, id: newId }]);
            alert('Event added to schedule.');
        } else {
            // Update existing
            setScheduleItems(scheduleItems.map(item => item.id === currentEvent.id ? currentEvent : item));
            alert('Event updated.');
        }
        setIsEventModalOpen(false);
    };

    const handleDeleteEvent = (id: number) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            setScheduleItems(scheduleItems.filter(i => i.id !== id));
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex relative">

            {/* Student Profile Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
                        {/* Header */}
                        <div className="bg-slate-900 p-6 text-white flex justify-between items-start">
                            <div className="flex gap-4 items-center">
                                <div className="w-16 h-16 rounded-full bg-brand-500 flex items-center justify-center text-2xl font-bold border-2 border-white">
                                    {selectedStudent.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">{selectedStudent.name}</h3>
                                    <p className="text-slate-300 text-sm">{selectedStudent.email}</p>
                                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
                                        {selectedStudent.course}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedStudent(null)} className="text-white/70 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <TrendingUp size={18} className="text-brand-600" /> Performance
                                    </h4>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-600">Overall Progress</span>
                                                <span className="font-bold text-slate-900">{selectedStudent.progress}%</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-2">
                                                <div style={{ width: `${selectedStudent.progress}%` }} className={`h-2 rounded-full ${selectedStudent.progress === 100 ? 'bg-green-500' : 'bg-brand-500'}`}></div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-600">Quiz Average</span>
                                            <span className="font-bold text-slate-900">88%</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-600">Attendance</span>
                                            <span className="font-bold text-slate-900">95%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <FileText size={18} className="text-brand-600" /> Recent Submissions
                                    </h4>
                                    <div className="space-y-3">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="flex items-center gap-3 text-sm bg-white p-2 rounded-lg border border-slate-200">
                                                <div className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                                <span className="flex-grow truncate">Module {i} Assignment</span>
                                                <span className="text-slate-400 text-xs">2d ago</span>
                                            </div>
                                        ))}
                                        <div className="flex items-center gap-3 text-sm bg-white p-2 rounded-lg border border-slate-200">
                                            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                            <span className="flex-grow truncate">Final Project Proposal</span>
                                            <span className="text-slate-400 text-xs">Pending</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-900 mb-2 text-sm">Instructor Notes</h4>
                                <textarea className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm h-24 resize-none" placeholder="Add private notes about this student..."></textarea>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setSelectedStudent(null)}>Close</Button>
                            <Button><Mail size={16} className="mr-2" /> Send Message</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lesson Editor Modal */}
            {isLessonModalOpen && editingLesson && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col animate-fade-in-up">
                        <div className="flex justify-between items-center p-6 border-b border-slate-200">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Edit Lesson Content</h3>
                                <p className="text-sm text-slate-500">Editing: <span className="font-semibold">{editingLesson.title}</span></p>
                            </div>
                            <button onClick={() => setIsLessonModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 mb-6">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Lesson Title</label>
                                        <input
                                            type="text"
                                            title="Lesson Title"
                                            placeholder="Enter lesson title"
                                            value={editingLesson.title}
                                            onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                                        <input
                                            type="text"
                                            title="Lesson Duration"
                                            placeholder="e.g. 12 min"
                                            value={editingLesson.duration}
                                            onChange={(e) => setEditingLesson({ ...editingLesson, duration: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                                        />
                                    </div>
                                </div>

                                <RichTextEditor
                                    label="Lesson Content / Notes"
                                    value={editingLesson.content || ''}
                                    onChange={(html) => setEditingLesson({ ...editingLesson, content: html })}
                                    placeholder="Enter detailed lesson content, lecture notes, or transcript here..."
                                    height="h-64"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-200 flex justify-end gap-3 bg-white rounded-b-xl">
                            <Button variant="outline" onClick={() => setIsLessonModalOpen(false)}>Cancel</Button>
                            <Button onClick={saveLessonContent}><Save size={16} className="mr-2" /> Save Lesson</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Event Modal */}
            {isEventModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900">{currentEvent.id === 0 ? 'Add New Event' : 'Edit Event'}</h3>
                            <button onClick={() => setIsEventModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveEvent} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                                    placeholder="Event Title"
                                    value={currentEvent.title}
                                    onChange={(e) => setCurrentEvent({ ...currentEvent, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                                    value={currentEvent.type}
                                    onChange={(e) => setCurrentEvent({ ...currentEvent, type: e.target.value as InstructorEvent['type'] })}
                                >
                                    <option value="Live Class">Live Class</option>
                                    <option value="Meeting">Meeting</option>
                                    <option value="Task">Task</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                                        placeholder="e.g. Tomorrow"
                                        value={currentEvent.date}
                                        onChange={(e) => setCurrentEvent({ ...currentEvent, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                                        placeholder="10:00 AM"
                                        value={currentEvent.time}
                                        onChange={(e) => setCurrentEvent({ ...currentEvent, time: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setIsEventModalOpen(false)}>Cancel</Button>
                                <Button type="submit">{currentEvent.id === 0 ? 'Add Event' : 'Save Changes'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Course Modal */}
            {isAddCourseModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden animate-fade-in-up max-h-[92vh] flex flex-col">
                        <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100 bg-slate-50 flex-shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Create New Course</h3>
                                <p className="text-sm text-slate-500">Fill in the details to start building your curriculum.</p>
                            </div>
                            <button type="button" title="Close" onClick={() => setIsAddCourseModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCourse} className="flex-1 overflow-y-auto px-8 py-6">
                            <div className="space-y-8">

                                {/* ── 1. Basic Information ── */}
                                <section>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">1. Basic Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Course Title <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                                placeholder="e.g. Advanced Microservices Patterns with Spring Boot"
                                                value={newCourse.title}
                                                onChange={e => setNewCourse({ ...newCourse, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">URL Slug</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none font-mono text-sm"
                                                placeholder="auto-generated-from-title"
                                                value={newCourse.slug}
                                                onChange={e => setNewCourse({ ...newCourse, slug: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Tagline</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                                placeholder="A short, catchy one-liner for the course"
                                                value={newCourse.tagline}
                                                onChange={e => setNewCourse({ ...newCourse, tagline: e.target.value })}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Short Description <span className="text-slate-400 text-xs">(max 300 chars, shown on course cards)</span></label>
                                            <textarea
                                                rows={2}
                                                maxLength={300}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none text-sm"
                                                placeholder="Brief overview of what students will learn..."
                                                value={newCourse.shortDescription}
                                                onChange={e => setNewCourse({ ...newCourse, shortDescription: e.target.value })}
                                            />
                                            <p className="text-xs text-slate-400 text-right mt-1">{newCourse.shortDescription.length}/300</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <RichTextEditor
                                                label="Full Description *"
                                                value={newCourse.description}
                                                onChange={(html) => setNewCourse({ ...newCourse, description: html })}
                                                placeholder="Describe your course in detail..."
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* ── 2. Course Settings ── */}
                                <section>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">2. Course Settings</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Course Type</label>
                                            <select
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                                                value={newCourse.courseType}
                                                onChange={e => setNewCourse({ ...newCourse, courseType: e.target.value as 'live' | 'self-paced' })}
                                            >
                                                <option value="self-paced">Self-Paced</option>
                                                <option value="live">Live</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Category <span className="text-red-500">*</span></label>
                                            <select
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                                                value={newCourse.category}
                                                onChange={e => setNewCourse({ ...newCourse, category: e.target.value })}
                                            >
                                                {COURSE_CATEGORIES.filter(c => c !== 'All').map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Sub-Category</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                                placeholder="e.g. Backend, DevOps"
                                                value={newCourse.subCategory}
                                                onChange={e => setNewCourse({ ...newCourse, subCategory: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty Level</label>
                                            <select
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                                                value={newCourse.level}
                                                onChange={e => setNewCourse({ ...newCourse, level: e.target.value })}
                                            >
                                                <option value="Beginner">Beginner</option>
                                                <option value="Intermediate">Intermediate</option>
                                                <option value="Advanced">Advanced</option>
                                                <option value="All">All Levels</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                                placeholder="English"
                                                value={newCourse.language}
                                                onChange={e => setNewCourse({ ...newCourse, language: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                                placeholder="e.g. 8 Weeks"
                                                value={newCourse.duration}
                                                onChange={e => setNewCourse({ ...newCourse, duration: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Total Hours</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                                placeholder="e.g. 40"
                                                value={newCourse.totalHours}
                                                onChange={e => setNewCourse({ ...newCourse, totalHours: e.target.value })}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Tags <span className="text-slate-400 text-xs">(comma-separated)</span></label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                                placeholder="e.g. Java, Spring Boot, Microservices, Docker"
                                                value={newCourse.tags}
                                                onChange={e => setNewCourse({ ...newCourse, tags: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* ── 3. Learning Details ── */}
                                <section>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">3. Learning Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Learning Objectives <span className="text-slate-400 text-xs">(one per line)</span></label>
                                            <textarea
                                                rows={4}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none text-sm"
                                                placeholder="Build REST APIs with Spring Boot&#10;Deploy apps on AWS&#10;Write unit & integration tests"
                                                value={newCourse.learningObjectives}
                                                onChange={e => setNewCourse({ ...newCourse, learningObjectives: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Course Highlights <span className="text-slate-400 text-xs">(one per line)</span></label>
                                            <textarea
                                                rows={4}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none text-sm"
                                                placeholder="Certificate of completion&#10;24x7 mentor support&#10;Real-world projects"
                                                value={newCourse.highlights}
                                                onChange={e => setNewCourse({ ...newCourse, highlights: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Prerequisites <span className="text-slate-400 text-xs">(one per line)</span></label>
                                            <textarea
                                                rows={3}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none text-sm"
                                                placeholder="Basic Java knowledge&#10;Familiarity with REST APIs"
                                                value={newCourse.prerequisites}
                                                onChange={e => setNewCourse({ ...newCourse, prerequisites: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Target Audience <span className="text-slate-400 text-xs">(one per line)</span></label>
                                            <textarea
                                                rows={3}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none text-sm"
                                                placeholder="Java developers&#10;Backend engineers"
                                                value={newCourse.targetAudience}
                                                onChange={e => setNewCourse({ ...newCourse, targetAudience: e.target.value })}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Tools & Technologies <span className="text-slate-400 text-xs">(comma-separated)</span></label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                                placeholder="e.g. Spring Boot, Docker, Kubernetes, PostgreSQL"
                                                value={newCourse.tools}
                                                onChange={e => setNewCourse({ ...newCourse, tools: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* ── 4. Pricing ── */}
                                <section>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">4. Pricing</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                                        <div className="flex items-center gap-3 pt-8">
                                            <input
                                                id="isFree"
                                                type="checkbox"
                                                className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
                                                checked={newCourse.isFree}
                                                onChange={e => setNewCourse({ ...newCourse, isFree: e.target.checked, price: '', discountedPrice: '' })}
                                            />
                                            <label htmlFor="isFree" className="text-sm font-medium text-slate-700">Free Course</label>
                                        </div>
                                        <div className={newCourse.isFree ? 'opacity-40 pointer-events-none' : ''}>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Price (INR) {!newCourse.isFree && <span className="text-red-500">*</span>}</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                                    placeholder="49999"
                                                    value={newCourse.price}
                                                    onChange={e => setNewCourse({ ...newCourse, price: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className={newCourse.isFree ? 'opacity-40 pointer-events-none' : ''}>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Discounted Price (INR)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                                    placeholder="39999"
                                                    value={newCourse.discountedPrice}
                                                    onChange={e => setNewCourse({ ...newCourse, discountedPrice: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* ── 5. Media ── */}
                                <section>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">5. Media</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Thumbnail / Course Image URL</label>
                                            <div className="flex gap-2">
                                                <div className="relative flex-grow">
                                                    <ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="url"
                                                        className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                                        placeholder="https://example.com/thumbnail.jpg"
                                                        value={newCourse.imageUrl}
                                                        onChange={e => setNewCourse({ ...newCourse, imageUrl: e.target.value })}
                                                    />
                                                </div>
                                                <Button type="button" variant="outline" size="sm"><Upload size={15} /></Button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Banner Image URL</label>
                                            <div className="relative">
                                                <ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="url"
                                                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                                    placeholder="https://example.com/banner.jpg"
                                                    value={newCourse.bannerUrl}
                                                    onChange={e => setNewCourse({ ...newCourse, bannerUrl: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Promo Video URL</label>
                                            <div className="relative">
                                                <Video size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="url"
                                                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                                    placeholder="https://youtube.com/watch?v=..."
                                                    value={newCourse.promoVideoUrl}
                                                    onChange={e => setNewCourse({ ...newCourse, promoVideoUrl: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* ── 6. Live Course Details (conditional) ── */}
                                {newCourse.courseType === 'live' && (
                                    <section>
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">6. Live Course Details</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Batch Name</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                                    placeholder="e.g. Batch 12 – Jan 2026"
                                                    value={newCourse.batchName}
                                                    onChange={e => setNewCourse({ ...newCourse, batchName: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                                <input
                                                    type="date"
                                                    title="Course Start Date"
                                                    placeholder="YYYY-MM-DD"
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                                    value={newCourse.startDate}
                                                    onChange={e => setNewCourse({ ...newCourse, startDate: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                                                <input
                                                    type="date"
                                                    title="Course End Date"
                                                    placeholder="YYYY-MM-DD"
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                                    value={newCourse.endDate}
                                                    onChange={e => setNewCourse({ ...newCourse, endDate: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Max Students</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                                    placeholder="50"
                                                    value={newCourse.maxStudents}
                                                    onChange={e => setNewCourse({ ...newCourse, maxStudents: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Meeting Platform</label>
                                                <select
                                                    title="Meeting Platform"
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                                                    value={newCourse.meetingPlatform}
                                                    onChange={e => setNewCourse({ ...newCourse, meetingPlatform: e.target.value })}
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

                                {/* ── 7. Certification ── */}
                                <section>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">{newCourse.courseType === 'live' ? '7' : '6'}. Certification</h4>
                                    <div className="flex items-center gap-3">
                                        <input
                                            id="hasCert"
                                            type="checkbox"
                                            className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
                                            checked={newCourse.hasCertification}
                                            onChange={e => setNewCourse({ ...newCourse, hasCertification: e.target.checked })}
                                        />
                                        <label htmlFor="hasCert" className="text-sm font-medium text-slate-700">Issue Certificate of Completion</label>
                                        {newCourse.hasCertification && (
                                            <span className="ml-2 text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Award size={12} /> Enabled
                                            </span>
                                        )}
                                    </div>
                                </section>

                                {/* ── Curriculum ── */}
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
                                                    <button type="button" title={week._expanded ? 'Collapse' : 'Expand'} onClick={() => updateWeek(wIdx, { _expanded: !week._expanded })} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                                                        <ChevronDown size={16} className={`transition-transform ${week._expanded ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    <button type="button" title="Remove week" onClick={() => removeWeek(wIdx)} className="p-1.5 text-red-400 hover:text-red-600 transition-colors">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                {week._expanded && (
                                                    <div className="p-4 border-t border-slate-100 space-y-4">
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-500 mb-1">Description (optional)</label>
                                                            <textarea rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none" placeholder="What students will cover this week..." value={week.description} onChange={e => updateWeek(wIdx, { description: e.target.value })} />
                                                        </div>
                                                        <div className="flex items-center gap-4 flex-wrap">
                                                            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
                                                                <input type="checkbox" className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500" checked={week.isLocked} onChange={e => updateWeek(wIdx, { isLocked: e.target.checked })} />
                                                                <Lock size={13} className="text-slate-400" /> Lock (drip content)
                                                            </label>
                                                            {week.isLocked && (
                                                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                                                    <span>Unlock after</span>
                                                                    <input type="number" min="0" className="w-16 px-2 py-1 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" placeholder="7" value={week.unlockAfterDays} onChange={e => updateWeek(wIdx, { unlockAfterDays: e.target.value })} />
                                                                    <span>days</span>
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
                                                                                <input type="checkbox" className="w-3.5 h-3.5 text-brand-600 border-slate-300 rounded" checked={concept.isPreview} onChange={e => updateWeekConcept(wIdx, cIdx, { isPreview: e.target.checked })} /> Preview
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
                                <Button type="button" variant="outline" onClick={() => { setIsAddCourseModalOpen(false); setCurriculum([]); }}>Cancel</Button>
                                <Button type="button" variant="secondary" className="bg-slate-200 text-slate-700 hover:bg-slate-300 border-none">Save Draft</Button>
                                <Button type="submit">Create Course</Button>
                            </div>
                        </form>
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
                            <span className="text-xl font-display font-bold">Instructor<span className="text-brand-500">.</span></span>
                        </div>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="px-6 py-2">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 border border-slate-700">
                            <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-lg font-bold">
                                {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full rounded-full" /> : (profile?.name ? profile.name.charAt(0) : 'I')}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-white truncate">{profile?.name || 'Instructor'}</p>
                                <p className="text-xs text-slate-400 truncate">{profile?.role || 'Lead Instructor'}</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
                        <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
                        <SidebarItem id="courses" icon={BookOpen} label="My Courses" />
                        <SidebarItem id="assignments" icon={FileText} label="Assignments" />
                        <SidebarItem id="students" icon={Users} label="Students" />
                        <SidebarItem id="schedule" icon={Calendar} label="Schedule" />
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

                {/* Header */}
                <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 lg:px-8 z-40 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-500">
                            <Menu size={24} />
                        </button>
                        <h2 className="text-xl font-bold text-slate-800 capitalize">
                            {activeTab === 'dashboard' ? 'Overview' : activeTab.replace('-', ' ')}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="relative hidden md:block">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-64"
                            />
                        </div>
                        <button
                            onClick={() => onNavigate('notifications')}
                            className="relative text-slate-500 hover:text-slate-700 transition-colors"
                        >
                            <Bell size={20} />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <Button size="sm" onClick={() => setIsAddCourseModalOpen(true)} className="hidden sm:flex">
                            <Plus size={16} className="mr-2" /> New Course
                        </Button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">

                    {/* Dashboard Tab */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6 animate-fade-in-up">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-green-50 text-green-600 rounded-lg"><DollarSign size={24} /></div>
                                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats?.revenue || "₹0"}</h3>
                                    <p className="text-sm text-slate-500">Total Revenue</p>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-brand-50 text-brand-600 rounded-lg"><Users size={24} /></div>
                                        <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-full">+45 new</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{(stats?.students || 0).toLocaleString()}</h3>
                                    <p className="text-sm text-slate-500">Total Students</p>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg"><Star size={24} /></div>
                                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">4.8 avg</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats?.rating || 0}</h3>
                                    <p className="text-sm text-slate-500">Instructor Rating</p>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><BookOpen size={24} /></div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats?.courses || 0}</h3>
                                    <p className="text-sm text-slate-500">Active Courses</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Course Performance */}
                                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-slate-900 text-lg">Course Performance</h3>
                                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('courses')}>View All</Button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-50 text-left">
                                                <tr>
                                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Course</th>
                                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Students</th>
                                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Revenue</th>
                                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {courses.map((course: InstructorCourse) => (
                                                    <tr key={course.id} className="hover:bg-slate-50">
                                                        <td className="px-4 py-3 font-medium text-slate-900 text-sm">{course.title}</td>
                                                        <td className="px-4 py-3 text-sm text-slate-600">{(course.students || 0).toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{course.revenue || "₹0"}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${course.status === 'Published' ? 'bg-green-100 text-green-700' :
                                                                course.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-slate-100 text-slate-600'
                                                                }`}>
                                                                {course.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Recent Tasks */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                                    <h3 className="font-bold text-slate-900 text-lg mb-6">Tasks & Schedule</h3>
                                    <div className="space-y-4">
                                        {scheduleItems.map((item) => (
                                            <div key={item.id} className="flex gap-4 items-start">
                                                <div className="flex-shrink-0 w-12 text-center bg-slate-50 rounded-lg border border-slate-100 p-1">
                                                    <div className="text-[10px] text-slate-500 uppercase font-bold">{item.date}</div>
                                                    <div className="text-sm font-bold text-slate-900">14</div>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${item.type === 'Live Class' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                                            }`}>{item.type}</span>
                                                        <span className="text-xs text-slate-500">{item.time}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button className="w-full mt-6" variant="outline" onClick={() => setActiveTab('schedule')}>View Full Schedule</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Courses Tab */}
                    {activeTab === 'courses' && (
                        <div className="space-y-6 animate-fade-in-up">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">My Courses</h2>
                                    <p className="text-slate-500">Manage your content, curriculum, and pricing.</p>
                                </div>
                                <Button onClick={() => setIsAddCourseModalOpen(true)}><Plus size={18} className="mr-2" /> Create New Course</Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {courses.map((course: InstructorCourse) => (
                                    <div key={course.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${course.status === 'Published' ? 'bg-green-100 text-green-700' :
                                                course.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                {course.status}
                                            </span>
                                            <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={20} /></button>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">{course.title}</h3>
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase font-bold">Students</p>
                                                <p className="font-bold text-slate-900">{(course.students || 0).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase font-bold">Revenue</p>
                                                <p className="font-bold text-slate-900">{course.revenue || "₹0"}</p>
                                            </div>
                                        </div>
                                        <div className="mt-auto flex gap-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => {
                                                    setSelectedCourseId(course.id);
                                                    setActiveTab('edit-course');
                                                }}
                                            >
                                                <Edit2 size={16} className="mr-2" /> Edit Content
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => {
                                                    setSelectedCourseId(course.id);
                                                    setActiveTab('course-analytics');
                                                }}
                                            >
                                                <TrendingUp size={16} className="mr-2" /> Analytics
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Edit Course Tab */}
                    {activeTab === 'edit-course' && selectedCourseId && (
                        <div className="animate-fade-in-up">
                            <div className="flex items-center gap-4 mb-6">
                                <button
                                    onClick={() => setActiveTab('courses')}
                                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">Edit Course Content</h2>
                                    <p className="text-slate-500">Editing: {getSelectedCourse().title}</p>
                                </div>
                                <div className="ml-auto flex gap-3">
                                    <Button variant="outline"><Eye size={18} className="mr-2" /> Preview</Button>
                                    <Button><Save size={18} className="mr-2" /> Save Changes</Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column: Course Details */}
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-fit">
                                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Settings size={20} className="text-slate-400" /> Course Settings
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Course Title</label>
                                            <input type="text" defaultValue={getSelectedCourse().title} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
                                        </div>

                                        {/* Rich Text Description */}
                                        <div>
                                            <RichTextEditor
                                                label="Course Description"
                                                value={editingCourseDescription}
                                                onChange={setEditingCourseDescription}
                                                placeholder="Detailed course description..."
                                                height="h-64"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                                            <input type="text" defaultValue={getSelectedCourse().price} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                                            <input type="text" defaultValue={getSelectedCourse().duration} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
                                            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white">
                                                <option>Beginner</option>
                                                <option>Intermediate</option>
                                                <option>Advanced</option>
                                            </select>
                                        </div>
                                        <div className="pt-4 border-t border-slate-100">
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Thumbnail</label>
                                            <div className="aspect-video bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition-all">
                                                <div className="text-center">
                                                    <ImageIcon className="mx-auto text-slate-400 mb-1" size={24} />
                                                    <span className="text-xs text-slate-500">Change Image</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Curriculum Builder */}
                                <div className="lg:col-span-2">
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                                <BookOpen size={20} className="text-slate-400" /> Curriculum
                                            </h3>
                                            <Button size="sm"><Plus size={16} className="mr-2" /> Add Module</Button>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            {/* Curriculum editing placeholder - implementation coming soon */}
                                            <div className="text-center py-8 text-slate-500">
                                                <p>Curriculum modules will appear here.</p>
                                            </div>
                                            {([] as any[]).map((module, mIdx) => (
                                                <div key={module.id} className="border border-slate-200 rounded-lg overflow-hidden">
                                                    <div className="bg-slate-50 p-3 flex items-center gap-3 border-b border-slate-200">
                                                        <GripVertical size={16} className="text-slate-400 cursor-grab" />
                                                        <span className="font-bold text-slate-700 text-sm">Module {mIdx + 1}: {module.title}</span>
                                                        <div className="ml-auto flex gap-2">
                                                            <button className="p-1 hover:bg-slate-200 rounded text-slate-500"><Edit2 size={14} /></button>
                                                            <button className="p-1 hover:bg-red-100 hover:text-red-500 rounded text-slate-500"><Trash2 size={14} /></button>
                                                        </div>
                                                    </div>
                                                    <div className="p-3 space-y-2">
                                                        {module.lessons.map((lesson: any) => (
                                                            <div key={lesson.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-100 transition-colors">
                                                                <GripVertical size={14} className="text-slate-300 cursor-grab" />
                                                                <div className={`p-1.5 rounded ${lesson.type === 'video' ? 'bg-blue-100 text-blue-600' :
                                                                    lesson.type === 'quiz' ? 'bg-purple-100 text-purple-600' :
                                                                        'bg-green-100 text-green-600'
                                                                    }`}>
                                                                    {lesson.type === 'video' ? <Video size={14} /> :
                                                                        lesson.type === 'quiz' ? <Award size={14} /> : <FileText size={14} />}
                                                                </div>
                                                                <span className="text-sm text-slate-700 font-medium">{lesson.title}</span>
                                                                <span className="text-xs text-slate-400 ml-auto">{lesson.duration}</span>
                                                                <button
                                                                    className="text-slate-300 hover:text-brand-600 p-1"
                                                                    onClick={() => openLessonEditor(lesson)}
                                                                    title="Edit Lesson Content"
                                                                >
                                                                    <Edit2 size={14} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <button className="w-full py-2 text-xs font-bold text-brand-600 border border-dashed border-brand-200 rounded hover:bg-brand-50 transition-colors flex items-center justify-center gap-1">
                                                            <Plus size={12} /> Add Lesson Content
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Course Analytics Tab */}
                    {activeTab === 'course-analytics' && selectedCourseId && (
                        <div className="animate-fade-in-up">
                            <div className="flex items-center gap-4 mb-6">
                                <button
                                    onClick={() => setActiveTab('courses')}
                                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">Course Analytics</h2>
                                    <p className="text-slate-500">Performance data for: {getSelectedCourse().title}</p>
                                </div>
                                <div className="ml-auto">
                                    <select className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block w-full p-2.5">
                                        <option>Last 30 Days</option>
                                        <option>Last 3 Months</option>
                                        <option>Last Year</option>
                                    </select>
                                </div>
                            </div>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Total Revenue</p>
                                    <h3 className="text-3xl font-bold text-slate-900 mb-1">{getSelectedCourse().revenue}</h3>
                                    <p className="text-xs text-green-600 font-bold flex items-center gap-1"><TrendingUp size={12} /> +12% vs last month</p>
                                </div>
                                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Total Students</p>
                                    <h3 className="text-3xl font-bold text-slate-900 mb-1">{getSelectedCourse().students.toLocaleString()}</h3>
                                    <p className="text-xs text-green-600 font-bold flex items-center gap-1"><Users size={12} /> +24 new this week</p>
                                </div>
                                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Avg. Rating</p>
                                    <h3 className="text-3xl font-bold text-slate-900 mb-1">{getSelectedCourse().rating}</h3>
                                    <div className="flex text-yellow-400 text-xs">
                                        <Star size={12} className="fill-current" />
                                        <Star size={12} className="fill-current" />
                                        <Star size={12} className="fill-current" />
                                        <Star size={12} className="fill-current" />
                                        <Star size={12} className="fill-current" />
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Completion Rate</p>
                                    <h3 className="text-3xl font-bold text-slate-900 mb-1">42%</h3>
                                    <p className="text-xs text-slate-400">Avg. industry is 15%</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Revenue Chart Placeholder */}
                                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                                    <h3 className="font-bold text-slate-900 mb-6">Revenue & Enrollments</h3>
                                    <div className="h-64 flex items-end justify-between gap-4">
                                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 80].map((h, i) => (
                                            <div key={i} className="w-full bg-slate-50 rounded-t-lg relative group">
                                                <div
                                                    className="absolute bottom-0 w-full bg-brand-600 rounded-t-lg transition-all duration-500 group-hover:bg-brand-500"
                                                    style={{ height: `${h}%` }}
                                                ></div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-4 text-xs text-slate-400 font-medium uppercase">
                                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                                        <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                                    </div>
                                </div>

                                {/* Engagement Metrics */}
                                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                                    <h3 className="font-bold text-slate-900 mb-6">Student Engagement</h3>
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-slate-600">Video Completion</span>
                                                <span className="font-bold text-slate-900">78%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2">
                                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-slate-600">Quiz Pass Rate</span>
                                                <span className="font-bold text-slate-900">92%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2">
                                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-slate-600">Assignment Submission</span>
                                                <span className="font-bold text-slate-900">65%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2">
                                                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-slate-100">
                                        <h4 className="font-bold text-slate-900 text-sm mb-4">Device Usage</h4>
                                        <div className="flex gap-4">
                                            <div className="flex-1 text-center p-3 bg-slate-50 rounded-lg">
                                                <span className="block text-xl font-bold text-slate-900">85%</span>
                                                <span className="text-xs text-slate-500">Desktop</span>
                                            </div>
                                            <div className="flex-1 text-center p-3 bg-slate-50 rounded-lg">
                                                <span className="block text-xl font-bold text-slate-900">15%</span>
                                                <span className="text-xs text-slate-500">Mobile</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Assignments Tab */}
                    {activeTab === 'assignments' && (
                        <div className="space-y-6 animate-fade-in-up">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">Student Assignments</h2>
                                    <p className="text-slate-500">Review and grade pending submissions.</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-left">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Student</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Course - Task</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Submitted</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {assignments.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 font-medium text-slate-900 text-sm">{item.student}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    <span className="font-bold">{item.course}</span> - {item.task}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500">{item.submitted}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                                        }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {item.status === 'Pending' ? (
                                                        <Button size="sm">Grade Now</Button>
                                                    ) : (
                                                        <span className="text-sm font-bold text-slate-900">{item.grade}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Students Tab */}
                    {activeTab === 'students' && (
                        <div className="animate-fade-in-up space-y-6">
                            {/* Header & Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                                    <h3 className="text-slate-500 font-medium text-sm mb-2">Total Students</h3>
                                    <div className="flex items-end gap-2">
                                        <span className="text-3xl font-bold text-slate-900">{students.length}</span>
                                        <span className="text-green-600 text-sm font-bold mb-1">+45 this week</span>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                                    <h3 className="text-slate-500 font-medium text-sm mb-2">Active Learners</h3>
                                    <div className="flex items-end gap-2">
                                        <span className="text-3xl font-bold text-slate-900">
                                            {students.filter(s => s.status === 'Active').length}
                                        </span>
                                        <span className="text-brand-600 text-sm font-bold mb-1">Currently enrolled</span>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                                    <h3 className="text-slate-500 font-medium text-sm mb-2">Avg. Completion</h3>
                                    <div className="flex items-end gap-2">
                                        <span className="text-3xl font-bold text-slate-900">
                                            <span className="text-3xl font-bold text-slate-900">
                                                {students.length > 0 ? Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length) : 0}%
                                            </span>
                                        </span>
                                        <span className="text-slate-400 text-sm font-medium mb-1">Across all courses</span>
                                    </div>
                                </div>
                            </div>

                            {/* Filters & Actions */}
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 w-full md:w-auto">
                                    <div className="relative flex-grow md:flex-grow-0">
                                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search student name or email..."
                                            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none w-full md:w-64"
                                            value={studentSearch}
                                            onChange={(e) => setStudentSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <select
                                            className="pl-10 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none appearance-none bg-white cursor-pointer"
                                            value={courseFilter}
                                            onChange={(e) => setCourseFilter(e.target.value)}
                                        >
                                            <option value="All">All Courses</option>
                                            {courses.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <Button variant="outline"><Mail size={16} className="mr-2" /> Message All</Button>
                                    <Button variant="outline"><Upload size={16} className="mr-2" /> Export CSV</Button>
                                </div>
                            </div>

                            {/* Students List */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 border-b border-slate-200 text-left">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Student Name</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Enrolled Course</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Progress</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Joined</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                                                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm font-bold border border-brand-200">
                                                                {student.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-slate-900 text-sm">{student.name}</div>
                                                                <div className="text-xs text-slate-500">{student.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600 font-medium max-w-xs truncate" title={student.course}>
                                                        {student.course}
                                                    </td>
                                                    <td className="px-6 py-4 w-40">
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className="font-bold text-slate-700">{student.progress}%</span>
                                                        </div>
                                                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                                                            <div
                                                                className={`h-1.5 rounded-full ${student.progress === 100 ? 'bg-green-500' : 'bg-brand-500'}`}
                                                                style={{ width: `${student.progress}%` }}
                                                            ></div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-500">{student.joined}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${student.status === 'Active' ? 'bg-blue-100 text-blue-700' :
                                                            student.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                                student.status === 'Dropped' ? 'bg-red-100 text-red-700' :
                                                                    'bg-slate-100 text-slate-600'
                                                            }`}>
                                                            {student.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => setSelectedStudent(student)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Message Student">
                                                                <MessageCircle size={18} />
                                                            </button>
                                                            <button onClick={() => setSelectedStudent(student)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" title="View Profile">
                                                                <Eye size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                                        <div className="flex flex-col items-center">
                                                            <div className="p-4 bg-slate-50 rounded-full mb-3">
                                                                <Users size={24} className="text-slate-300" />
                                                            </div>
                                                            <p className="font-medium">No students found matching your filters.</p>
                                                            <button
                                                                className="text-brand-600 hover:underline text-sm mt-2"
                                                                onClick={() => { setStudentSearch(''); setCourseFilter('All'); }}
                                                            >
                                                                Clear Filters
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
                                    <p className="text-sm text-slate-500">Showing <span className="font-bold text-slate-900">{filteredStudents.length}</span> results</p>
                                    <div className="flex gap-2">
                                        <button className="p-2 border border-slate-300 rounded-lg bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-50" disabled><ChevronLeft size={16} /></button>
                                        <button className="p-2 border border-slate-300 rounded-lg bg-white text-slate-600 hover:bg-slate-50"><ChevronRight size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Schedule Tab */}
                    {activeTab === 'schedule' && (
                        <div className="space-y-6 animate-fade-in-up">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-slate-900">My Schedule</h2>
                                <Button onClick={openAddEventModal}><Plus size={18} className="mr-2" /> Add Event</Button>
                            </div>
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="divide-y divide-slate-100">
                                    {scheduleItems.map((item) => (
                                        <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-50">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-16 text-center bg-slate-100 rounded-lg p-2 border border-slate-200">
                                                    <div className="text-xs font-bold text-slate-500 uppercase">{item.date}</div>
                                                    <div className="text-sm font-bold text-slate-900">14</div>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-lg">{item.title}</h3>
                                                    <p className="text-sm text-slate-500 flex items-center gap-2">
                                                        <Clock size={14} /> {item.time}
                                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                        <span className={`text-xs font-bold uppercase ${item.type === 'Live Class' ? 'text-red-600' : 'text-brand-600'
                                                            }`}>{item.type}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {item.type === 'Live Class' && <Button size="sm" className="bg-red-600 hover:bg-red-700 border-none"><Video size={16} className="mr-2" /> Start Class</Button>}
                                                <Button variant="outline" size="sm" onClick={() => openEditEventModal(item)}>Edit</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Settings Tab - Placeholder */}
                    {activeTab === 'settings' && (
                        <div className="max-w-2xl mx-auto animate-fade-in-up">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Instructor Profile</h2>
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-24 h-24 rounded-full bg-brand-600 text-white flex items-center justify-center text-3xl font-bold border-4 border-slate-50">
                                        {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full rounded-full" /> : (profile?.name ? profile.name.charAt(0) : 'I')}
                                    </div>
                                    <Button variant="outline">Change Photo</Button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Display Name</label>
                                        <input type="text" defaultValue={profile?.name} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Professional Headline</label>
                                        <input type="text" defaultValue={profile?.role} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                                        <textarea rows={4} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none" defaultValue="Experienced Java Architect with a passion for teaching..."></textarea>
                                    </div>
                                    <div className="pt-4 text-right">
                                        <Button>Save Profile</Button>
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
