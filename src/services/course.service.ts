import api, { getAuthHeaders } from '@/lib/api';
import { ApiResponse, Course, Enrollment } from '@/types/api';
import { handleApiError } from '@/lib/api-error-handler';

export const courseService = {
  getCourses: async () => {
    try {
      const response = await api.get<ApiResponse<Course[]>>('/courses', {
        headers: getAuthHeaders(),
      });
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
  }
};
