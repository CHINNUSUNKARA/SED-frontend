import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Create axios instance with base config
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true, // For cookies/session-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      // Only redirect if not already on the login page to prevent loops
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Enhanced error logging
    if (error.response) {
      // Server responded with a status code outside 2xx range
      console.error('API Error - Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('API Error - No response received:', error.request);
    } else {
      // Error in request setup
      console.error('API Error - Request setup failed:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper functions for common HTTP methods
export const get = <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
  api.get<T>(url, config);

export const post = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
  api.post<T>(url, data, config);

export const put = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
  api.put<T>(url, data, config);

export const del = <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
  api.delete<T>(url, config);

export default api;
