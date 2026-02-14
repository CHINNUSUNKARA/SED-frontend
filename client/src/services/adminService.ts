import api from '../lib/api';
import { realtimeService } from './realtimeService';

// Get auth token from localStorage
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Add token to requests
api.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Get dashboard statistics
export const getDashboardStats = async () => {
    try {
        const response = await api.get('/admin/dashboard/stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
};

// Get recent enrollments
export const getRecentEnrollments = async (limit = 10) => {
    try {
        const response = await api.get(`/admin/dashboard/enrollments/recent?limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching recent enrollments:', error);
        throw error;
    }
};

// Get all students
export const getAllStudents = async () => {
    try {
        const response = await api.get('/admin/dashboard/students');
        return response.data;
    } catch (error) {
        console.error('Error fetching students:', error);
        throw error;
    }
};

// Get all instructors
export const getAllInstructors = async () => {
    try {
        const response = await api.get('/admin/dashboard/instructors');
        return response.data;
    } catch (error) {
        console.error('Error fetching instructors:', error);
        throw error;
    }
};

// Get all courses
export const getAllCourses = async () => {
    try {
        const response = await api.get('/admin/dashboard/courses');
        return response.data;
    } catch (error) {
        console.error('Error fetching courses:', error);
        throw error;
    }
};

// Get analytics data
export const getAnalytics = async () => {
    try {
        const response = await api.get('/admin/dashboard/analytics');
        return response.data;
    } catch (error) {
        console.error('Error fetching analytics:', error);
        throw error;
    }
};

// --- Action Methods ---

// Create a new course
export const createCourse = async (courseData: any) => {
    try {
        const response = await api.post('/courses', courseData);
        
        // Trigger real-time update
        realtimeService.triggerRefresh('courses');
        
        return response.data;
    } catch (error) {
        console.error('Error creating course:', error);
        throw error;
    }
};

// Update an existing course
export const updateCourse = async (slug: string, courseData: any) => {
    try {
        const response = await api.put(`/courses/${slug}`, courseData);
        
        // Trigger real-time update
        realtimeService.triggerRefresh('courses');
        
        return response.data;
    } catch (error) {
        console.error('Error updating course:', error);
        throw error;
    }
};

// Bulk delete courses
export const deleteCourses = async (ids: (string | number)[]) => {
    try {
        const response = await api.delete('/courses/bulk', { data: { ids } });
        
        // Trigger real-time update
        realtimeService.triggerRefresh('courses');
        
        return response.data;
    } catch (error) {
        console.error('Error deleting courses:', error);
        throw error;
    }
};

// Suspend students
export const suspendStudents = async (ids: (string | number)[]) => {
    try {
        const response = await api.post('/admin/users/suspend', { ids, status: 'Inactive' });
        return response.data;
    } catch (error) {
        console.error('Error suspending students:', error);
        throw error;
    }
};

// Delete students
export const deleteStudents = async (ids: (string | number)[]) => {
    try {
        const response = await api.delete('/admin/users', { data: { ids } });
        return response.data;
    } catch (error) {
        console.error('Error deleting students:', error);
        throw error;
    }
};

// Create a new user (Instructor/Student)
export const createUser = async (userData: any) => {
    try {
        const response = await api.post('/admin/users', userData);
        return response.data;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

// Get Settings
export const getSettings = async () => {
    try {
        const response = await api.get('/admin/settings');
        return response.data;
    } catch (error) {
        console.error('Error fetching settings:', error);
        throw error;
    }
};

// Update Settings
export const updateSettings = async (settingsData: any) => {
    try {
        const response = await api.put('/admin/settings', settingsData);
        return response.data;
    } catch (error) {
        console.error('Error updating settings:', error);
        throw error;
    }
};

// Get Notifications
export const getNotifications = async () => {
    try {
        const response = await api.get('/notifications');
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

// Mark all notifications as read
export const markAllNotificationsRead = async () => {
    try {
        const response = await api.put('/notifications/mark-read');
        return response.data;
    } catch (error) {
        console.error('Error marking notifications read:', error);
        throw error;
    }
};

// Mark single notification as read
export const markNotificationAsRead = async (id: string) => {
    try {
        const response = await api.put(`/notifications/${id}/read`);
        return response.data;
    } catch (error) {
        console.error('Error marking notification read:', error);
        throw error;
    }
};

export default {
    getDashboardStats,
    getRecentEnrollments,
    getAllStudents,
    getAllInstructors,
    getAllCourses,
    getAnalytics,
    createCourse,
    updateCourse,
    createUser,
    deleteCourses,
    suspendStudents,
    deleteStudents,
    getSettings,
    updateSettings,
    getNotifications,
    markAllNotificationsRead,
    markNotificationAsRead
};
