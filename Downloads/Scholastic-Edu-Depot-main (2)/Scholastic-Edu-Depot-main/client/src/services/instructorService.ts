import api from '../lib/api';

export interface InstructorStats {
    revenue: number;
    students: number;
    courses: number;
    rating: number;
}

export interface InstructorCourse {
    id: string;
    title: string;
    status: 'Published' | 'Draft' | 'Archived';
    price: number;
    students: number;
    rating: number;
    revenue: number;
    image?: string;
    description?: string;
    duration?: string;
}

export interface InstructorStudent {
    id: string;
    name: string;
    email: string;
    course: string;
    progress: number;
    joined: string;
    status: 'Active' | 'Completed' | 'Dropped';
    avatar?: string;
}

export const instructorService = {
    getStats: async (): Promise<InstructorStats> => {
        const response = await api.get('/instructor/stats');
        return response.data;
    },

    getCourses: async (): Promise<InstructorCourse[]> => {
        const response = await api.get('/instructor/courses');
        return response.data;
    },

    getStudents: async (): Promise<InstructorStudent[]> => {
        const response = await api.get('/instructor/students');
        return response.data;
    },

    getSchedule: async (): Promise<any[]> => {
        const response = await api.get('/instructor/schedule');
        return response.data;
    },

    getAssignments: async (): Promise<any[]> => {
        const response = await api.get('/instructor/assignments');
        return response.data;
    }
};
