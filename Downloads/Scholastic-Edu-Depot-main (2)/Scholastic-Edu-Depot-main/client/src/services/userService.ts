import api from '../lib/api';

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
    getProfile: async (): Promise<UserProfile> => {
        const response = await api.get('/user/profile');
        return response.data;
    },

    getEnrolledCourses: async (): Promise<any[]> => {
        const response = await api.get('/user/enrolled-courses');
        return response.data;
    },

    getAssignments: async (): Promise<Assignment[]> => {
        const response = await api.get('/user/assignments');
        return response.data;
    },

    getNotifications: async (): Promise<Notification[]> => {
        const response = await api.get('/user/notifications');
        return response.data;
    },

    markNotificationAsRead: async (id: string) => {
        const response = await api.put(`/user/notifications/${id}/read`);
        return response.data;
    },

    deleteNotification: async (id: string) => {
        const response = await api.delete(`/user/notifications/${id}`);
        return response.data;
    },

    getSchedule: async (): Promise<ScheduleEvent[]> => {
        const response = await api.get('/user/schedule');
        return response.data;
    },

    getCertificates: async (): Promise<Certificate[]> => {
        const response = await api.get('/user/certificates');
        return response.data;
    },

    submitAssignment: async (id: string, textSubmission: string, fileUrl?: string) => {
        const response = await api.post(`/assignments/${id}/submit`, { textSubmission, fileUrl });
        return response.data;
    }
};
