// src/services/auth.service.ts
import api, { getAuthHeaders } from '@/lib/api';
import { ApiResponse, AuthData, User, UserRole } from '@/types/api';
import { handleApiError } from '@/lib/api-error-handler';

export interface SignupRequest {
  email: string;
  password: string;
  role: UserRole | string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

const authService = {
  signup: async (data: SignupRequest) => {
    try {
      const response = await api.post<ApiResponse<AuthData>>('/auth/signup', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  login: async (data: LoginRequest) => {
    try {
      const response = await api.post<ApiResponse<AuthData>>('/auth/login', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  googleLogin: async (idToken: string) => {
    try {
      console.log('Attempting Google Login at /api/v1/auth/google/login');
      const response = await api.post<ApiResponse<any>>('/auth/google/login', { idToken });
      
      // Normalize response to match AuthData interface if needed
      if (response.data.success && response.data.data && !response.data.data.tokens) {
        const rawData = response.data.data;
        response.data.data = {
          user: rawData.user,
          tokens: {
            accessToken: rawData.accessToken,
            refreshToken: rawData.refreshToken
          }
        };
      }
      
      console.log('Google Login successful:', response.data);
      return response.data as ApiResponse<AuthData>;
    } catch (error) {
      handleApiError(error);
      console.error('Google Login failed:', error);
      throw error;
    }
  },

  googleSignup: async (idToken: string, role: UserRole) => {
    try {
      console.log('Attempting Google Signup at /api/v1/auth/google/signup');
      const response = await api.post<ApiResponse<any>>('/auth/google/signup', { idToken, role });
      
      // Normalize response to match AuthData interface if needed
      if (response.data.success && response.data.data && !response.data.data.tokens) {
        const rawData = response.data.data;
        response.data.data = {
          user: rawData.user,
          tokens: {
            accessToken: rawData.accessToken,
            refreshToken: rawData.refreshToken
          }
        };
      }
      
      console.log('Google Signup successful:', response.data);
      return response.data as ApiResponse<AuthData>;
    } catch (error) {
      handleApiError(error);
      console.error('Google Signup failed:', error);
      throw error;
    }
  },

  refreshToken: async (refreshToken: string) => {
    try {
      const response = await api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', {
        refreshToken,
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await api.post<ApiResponse<null>>('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  resetPassword: async (data: ResetPasswordRequest) => {
    try {
      const response = await api.post<ApiResponse<null>>('/auth/reset-password', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  clearAuthData: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
};

export default authService;
