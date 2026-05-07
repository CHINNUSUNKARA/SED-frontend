import api from '../lib/api';

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: 'Student' | 'Instructor' | 'Admin' | 'MarketingAgent';
  isVerified?: boolean;
  isEmailVerified?: boolean;
  avatar?: string;
  avatarUrl?: string;
  enrolledCourses?: any[];
  savedCourses?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user: User;
  token: string;
  role?: string;
  redirectTo?: string;
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

const AUTH_STORAGE_KEYS = [
  'token', 'user', 'userId',
  'authToken', 'auth-storage',
  'sessionId', 'sed_chatbot_history',
] as const;

export const clearAuthStorage = (): void => {
  AUTH_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
};

// Cancellable request controllers
let loginController: AbortController | null = null;
let registerController: AbortController | null = null;

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  if (loginController) loginController.abort();
  loginController = new AbortController();
  try {
    const response = await api.post<AuthResponse>(
      '/auth/login',
      credentials,
      { signal: loginController.signal, timeout: 10000 }
    );
    return response.data;
  } finally {
    loginController = null;
  }
};

export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  if (registerController) registerController.abort();
  registerController = new AbortController();

  // Route to the correct registration endpoint based on role.
  // 'mentor' maps to the instructor registration path.
  const endpoint =
    userData.role === 'mentor' || userData.role === 'instructor' as any
      ? '/auth/register/instructor'
      : '/auth/register/student';

  try {
    const response = await api.post<AuthResponse>(
      endpoint,
      userData,
      { signal: registerController.signal, timeout: 10000 }
    );
    return response.data;
  } finally {
    registerController = null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout', {}, { timeout: 5000 });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearAuthStorage();
  }
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<{ success: boolean; user: User }>('/auth/me', { timeout: 8000 });
  // Backend returns { success: true, user: {...} }
  return response.data.user ?? (response.data as any);
};

export const forgotPassword = async (email: string): Promise<void> => {
  await api.post('/auth/forgot-password', { email }, { timeout: 10000 });
};

export const resetPassword = async (token: string, password: string): Promise<void> => {
  await api.post(`/auth/reset-password/${token}`, { password }, { timeout: 10000 });
};

export const verifyEmail = async (token: string): Promise<void> => {
  await api.post(`/auth/verify-email/${token}`, {}, { timeout: 10000 });
};

export const resendVerificationEmail = async (email: string): Promise<void> => {
  await api.post('/auth/resend-verification', { email }, { timeout: 10000 });
};

// Accepts the credential ID token returned by @react-oauth/google's GoogleLogin component.
export const googleLogin = async (idToken: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    '/auth/google-login',
    { idToken },
    { timeout: 10000 }
  );
  return response.data;
};

export const cancelAllAuthRequests = () => {
  if (loginController) { loginController.abort(); loginController = null; }
  if (registerController) { registerController.abort(); registerController = null; }
};
