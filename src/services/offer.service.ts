import api, { getAuthHeaders } from '@/lib/api';
import { ApiResponse } from '@/types/api';
import { handleApiError } from '@/lib/api-error-handler';

export interface Offer {
  id: string;
  title: string;
  description: string;
  code?: string;
  discount_percentage?: number;
  valid_until?: string;
  target_audience: string;
  button_text: string;
  button_link: string;
  is_active: boolean;
  image_url?: string;
}

const offerService = {
  getOffers: async () => {
    try {
      const response = await api.get<ApiResponse<Offer[]>>('/offers');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  createOffer: async (data: Omit<Offer, 'id'>) => {
    try {
      const response = await api.post<ApiResponse<Offer>>('/offers', data, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  updateOffer: async (id: string, data: Partial<Offer>) => {
    try {
      const response = await api.put<ApiResponse<Offer>>(`/offers/${id}`, data, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  deleteOffer: async (id: string) => {
    try {
      const response = await api.delete<ApiResponse<null>>(`/offers/${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

export default offerService;
