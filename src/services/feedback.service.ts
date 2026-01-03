import api, { getAuthHeaders } from '@/lib/api';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { handleApiError } from '@/lib/api-error-handler';

export interface Feedback {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
  createdAt: string;
}

const feedbackService = {
  submitFeedback: async (data: { 
    subject: string; 
    message: string;
    customer_name: string;
    customer_email: string;
    feedback_type: string;
  }) => {
    try {
      const response = await api.post<ApiResponse<Feedback>>('/feedback', data, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getAllFeedback: async (page = 1, limit = 10) => {
    try {
      const response = await api.get<PaginatedResponse<Feedback>>('/feedback', {
        params: { page, limit },
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  updateFeedbackStatus: async (id: string, status: Feedback['status']) => {
    try {
      const response = await api.patch<ApiResponse<Feedback>>(`/feedback/${id}/status`, { status }, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

export default feedbackService;
