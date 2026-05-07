import api, { get, clearCache } from '../lib/api';

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
    getStats: async (skipCache = false): Promise<InstructorStats> => {
        const response = await get('/instructor/stats', {
            skipCache,
            timeout: 8000
        });
        return response.data;
    },

    getCourses: async (skipCache = false): Promise<InstructorCourse[]> => {
        const response = await get('/instructor/courses', {
            skipCache,
            timeout: 10000
        });
        return response.data;
    },

    getStudents: async (skipCache = false): Promise<InstructorStudent[]> => {
        const response = await get('/instructor/students', {
            skipCache,
            timeout: 10000
        });
        return response.data;
    },

    getSchedule: async (skipCache = false): Promise<any[]> => {
        const response = await get('/instructor/schedule', {
            skipCache,
            timeout: 8000
        });
        return response.data;
    },

    getAssignments: async (skipCache = false): Promise<any[]> => {
        const response = await get('/instructor/assignments', {
            skipCache,
            timeout: 8000
        });
        return response.data;
    },

    createCourse: async (courseData: Partial<InstructorCourse>) => {
        const response = await api.post('/instructor/courses', courseData, { timeout: 15000 });
        
        // Clear courses cache
        clearCache('courses');
        
        return response.data;
    },

    updateCourse: async (id: string, courseData: Partial<InstructorCourse>) => {
        const response = await api.put(`/instructor/courses/${id}`, courseData, { timeout: 15000 });
        
        // Clear courses cache
        clearCache('courses');
        
        return response.data;
    },

    deleteCourse: async (id: string) => {
        const response = await api.delete(`/instructor/courses/${id}`, { timeout: 10000 });
        
        // Clear courses cache
        clearCache('courses');
        
        return response.data;
    },

    gradeAssignment: async (assignmentId: string, grade: number, feedback: string) => {
        const response = await api.post(`/instructor/assignments/${assignmentId}/grade`, {
            grade,
            feedback
        }, { timeout: 10000 });
        
        // Clear assignments cache
        clearCache('assignments');
        
        return response.data;
    }
};
