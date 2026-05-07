import api, { get, clearCache } from '../lib/api';
import { realtimeService } from './realtimeService';

// Get dashboard statistics with caching
export const getDashboardStats = async (skipCache = false) => {
    try {
        const response = await get('/admin/dashboard/stats', { 
            skipCache,
            timeout: 10000 
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
};

// Get recent enrollments with caching
export const getRecentEnrollments = async (limit = 10, skipCache = false) => {
    try {
        const response = await get(`/admin/dashboard/enrollments/recent`, {
            params: { limit },
            skipCache,
            timeout: 8000
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching recent enrollments:', error);
        throw error;
    }
};

// Get all students with caching
export const getAllStudents = async (skipCache = false) => {
    try {
        const response = await get('/admin/dashboard/students', {
            skipCache,
            timeout: 10000
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching students:', error);
        throw error;
    }
};

// Get all instructors with caching
export const getAllInstructors = async (skipCache = false) => {
    try {
        const response = await get('/admin/dashboard/instructors', {
            skipCache,
            timeout: 10000
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching instructors:', error);
        throw error;
    }
};

// Get all courses with caching
export const getAllCourses = async (skipCache = false) => {
    try {
        const response = await get('/admin/dashboard/courses', {
            skipCache,
            timeout: 10000
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching courses:', error);
        throw error;
    }
};

// Get analytics data with caching
export const getAnalytics = async (skipCache = false) => {
    try {
        const response = await get('/admin/dashboard/analytics', {
            skipCache,
            timeout: 10000
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching analytics:', error);
        throw error;
    }
};

// --- Action Methods with Optimistic Updates ---

// Create a new course
export const createCourse = async (courseData: any) => {
    try {
        const response = await api.post('/courses', courseData, { timeout: 15000 });
        
        // Clear cache and trigger real-time update
        clearCache('courses');
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
        const response = await api.put(`/courses/${slug}`, courseData, { timeout: 15000 });
        
        // Clear cache and trigger real-time update
        clearCache('courses');
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
        const response = await api.delete('/courses/bulk', { 
            data: { ids },
            timeout: 15000 
        });
        
        // Clear cache and trigger real-time update
        clearCache('courses');
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
        const response = await api.post('/admin/users/suspend', { 
            ids, 
            status: 'Inactive' 
        }, { timeout: 10000 });
        
        // Clear students cache
        clearCache('students');
        
        return response.data;
    } catch (error) {
        console.error('Error suspending students:', error);
        throw error;
    }
};

// Delete students
export const deleteStudents = async (ids: (string | number)[]) => {
    try {
        const response = await api.delete('/admin/users', { 
            data: { ids },
            timeout: 10000 
        });
        
        // Clear students cache
        clearCache('students');
        
        return response.data;
    } catch (error) {
        console.error('Error deleting students:', error);
        throw error;
    }
};

// Create a new user (Instructor/Student)
export const createUser = async (userData: any) => {
    try {
        const response = await api.post('/admin/users', userData, { timeout: 10000 });
        
        // Clear users cache
        clearCache('users');
        
        return response.data;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

// Get Settings with caching
export const getSettings = async (skipCache = false) => {
    try {
        const response = await get('/admin/settings', {
            skipCache,
            timeout: 8000
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching settings:', error);
        throw error;
    }
};

// Update Settings
export const updateSettings = async (settingsData: any) => {
    try {
        const response = await api.put('/admin/settings', settingsData, { timeout: 10000 });
        
        // Clear settings cache
        clearCache('settings');
        
        return response.data;
    } catch (error) {
        console.error('Error updating settings:', error);
        throw error;
    }
};

// Get Notifications with caching
export const getNotifications = async (skipCache = false) => {
    try {
        const response = await get('/notifications', {
            skipCache,
            timeout: 8000
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

// Mark all notifications as read
export const markAllNotificationsRead = async () => {
    try {
        const response = await api.put('/notifications/mark-read', {}, { timeout: 5000 });
        
        // Clear notifications cache
        clearCache('notifications');
        
        return response.data;
    } catch (error) {
        console.error('Error marking notifications read:', error);
        throw error;
    }
};

// Mark single notification as read
export const markNotificationAsRead = async (id: string) => {
    try {
        const response = await api.put(`/notifications/${id}/read`, {}, { timeout: 5000 });
        
        // Clear notifications cache
        clearCache('notifications');
        
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
