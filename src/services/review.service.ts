import api, { getAuthHeaders } from '@/lib/api';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { handleApiError } from '@/lib/api-error-handler';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

export interface ReviewResponse extends ApiResponse<Review> {}

const reviewService = {
  createReview: async (data: { productId: string; rating: number; comment: string }) => {
    try {
      const response = await api.post<ReviewResponse>('/reviews', data, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getProductReviews: async (productId: string, page = 1, limit = 10) => {
    try {
      const response = await api.get<PaginatedResponse<Review>>(`/reviews/product/${productId}`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

export default reviewService;
