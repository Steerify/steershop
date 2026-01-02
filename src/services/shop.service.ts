import api, { getAuthHeaders } from '@/lib/api';
import { ApiResponse, PaginatedResponse, Shop } from '@/types/api';
import { handleApiError } from '@/lib/api-error-handler';

export interface CreateShopRequest {
  name: string;
  slug: string;
  description: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
}

const shopService = {
  createShop: async (data: CreateShopRequest) => {
    try {
      const response = await api.post<ApiResponse<{ id: string; slug: string }>>('/shops', data, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getShops: async (page = 1, limit = 10) => {
    try {
      const response = await api.get<PaginatedResponse<Shop>>('/shops', {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getShopBySlug: async (slug: string) => {
    try {
      const response = await api.get<ApiResponse<Shop>>(`/shops/${slug}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

export default shopService;
