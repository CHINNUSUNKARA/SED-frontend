import api from '../lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Instructor' | 'Admin';
  isEmailVerified: boolean;
  avatar?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role: 'student' | 'mentor';
  acceptTerms: boolean;
  confirmpassword?: string;
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register/student', userData);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const forgotPassword = async (email: string): Promise<void> => {
  await api.post('/auth/forgot-password', { email });
};

export const resetPassword = async (token: string, password: string): Promise<void> => {
  await api.post(`/auth/reset-password/${token}`, { password });
};

export const verifyEmail = async (token: string): Promise<void> => {
  await api.post(`/auth/verify-email/${token}`);
};

export const resendVerificationEmail = async (email: string): Promise<void> => {
  await api.post('/auth/resend-verification', { email });
};

export const googleLogin = async (idToken: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/google-login', { idToken });
  return response.data;
};

export const getCsrfToken = async (): Promise<void> => {
  await api.get('/auth/csrf-token');
};
