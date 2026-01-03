// src/lib/api.ts
import axios from 'axios';

const API_BASE_URL = 'https://steershop-backend.onrender.com/api/v1';
// const API_BASE_URL = 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for token expiration handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname + window.location.search;
      // Don't redirect if already on auth pages
      if (!currentPath.startsWith('/auth')) {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
        // Clear auth data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        // Redirect to login
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default api;
