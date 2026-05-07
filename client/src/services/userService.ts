import api, { get, clearCache } from '../lib/api';

export interface UserProfile {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
    enrolledCourses: any[];
    savedCourses: string[];
}

export interface Assignment {
    id: string;
    title: string;
    course: string;
    dueDate: string;
    status: 'Pending' | 'Submitted' | 'Overdue' | 'Graded';
    grade: string | number;
}

export interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    read: boolean;
    createdAt: string;
    link?: string;
}

export interface Certificate {
    id: string;
    course: string;
    date: string;
    id_code: string;
    url: string;
}

export interface ScheduleEvent {
    id: string;
    title: string;
    type: 'Deadline' | 'Live Class' | 'Meeting';
    date: string;
    time: string;
    instructor?: string;
    link?: string;
}

export const userService = {
    getProfile: async (skipCache = false): Promise<UserProfile> => {
        const response = await get('/user/profile', {
            skipCache,
            timeout: 8000
        });
        return response.data;
    },

    getEnrolledCourses: async (skipCache = false): Promise<any[]> => {
        const response = await get('/user/enrolled-courses', {
            skipCache,
            timeout: 10000
        });
        return response.data;
    },

    getAssignments: async (skipCache = false): Promise<Assignment[]> => {
        const response = await get('/user/assignments', {
            skipCache,
            timeout: 8000
        });
        return response.data;
    },

    getNotifications: async (skipCache = false): Promise<Notification[]> => {
        const response = await get('/user/notifications', {
            skipCache,
            timeout: 8000
        });
        return response.data;
    },

    markNotificationAsRead: async (id: string) => {
        const response = await api.put(`/user/notifications/${id}/read`, {}, { timeout: 5000 });
        
        // Clear notifications cache
        clearCache('notifications');
        
        return response.data;
    },

    deleteNotification: async (id: string) => {
        const response = await api.delete(`/user/notifications/${id}`, { timeout: 5000 });
        
        // Clear notifications cache
        clearCache('notifications');
        
        return response.data;
    },

    getSchedule: async (skipCache = false): Promise<ScheduleEvent[]> => {
        const response = await get('/user/schedule', {
            skipCache,
            timeout: 8000
        });
        return response.data;
    },

    getCertificates: async (skipCache = false): Promise<Certificate[]> => {
        const response = await get('/user/certificates', {
            skipCache,
            timeout: 8000
        });
        return response.data;
    },

    submitAssignment: async (id: string, textSubmission: string, fileUrl?: string) => {
        const response = await api.post(`/assignments/${id}/submit`, { 
            textSubmission, 
            fileUrl 
        }, { timeout: 15000 });
        
        // Clear assignments cache
        clearCache('assignments');
        
        return response.data;
    },

    updateProfile: async (profileData: Partial<UserProfile>) => {
        const response = await api.put('/user/profile', profileData, { timeout: 10000 });
        
        // Clear profile cache
        clearCache('profile');
        
        return response.data;
    }
};
