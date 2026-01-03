import api, { getAuthHeaders } from '@/lib/api';
import { ApiResponse, Course, Enrollment } from '@/types/api';
import { handleApiError } from '@/lib/api-error-handler';

export const courseService = {
  getCourses: async () => {
    try {
      const response = await api.get<ApiResponse<Course[]>>('/courses');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getCourseById: async (id: string) => {
    try {
      const response = await api.get<ApiResponse<Course>>(`/courses/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getEnrollments: async () => {
    try {
      const response = await api.get<ApiResponse<Enrollment[]>>('/courses/enrollments', {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  enrollInCourse: async (courseId: string) => {
    try {
      const response = await api.post<ApiResponse<Enrollment>>('/courses/enrollments', { courseId }, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  markCourseComplete: async (enrollmentId: string) => {
    try {
      const response = await api.patch<ApiResponse<Enrollment>>(`/courses/enrollments/${enrollmentId}/complete`, {}, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Admin methods
  createCourse: async (data: Omit<Course, 'id'>) => {
    try {
      const response = await api.post<ApiResponse<Course>>('/courses', data, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  updateCourse: async (id: string, data: Partial<Course>) => {
    try {
      const response = await api.patch<ApiResponse<Course>>(`/courses/${id}`, data, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  deleteCourse: async (id: string) => {
    try {
      const response = await api.delete<ApiResponse<null>>(`/courses/${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};
