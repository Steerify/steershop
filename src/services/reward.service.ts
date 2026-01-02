import api, { getAuthHeaders } from '@/lib/api';
import { ApiResponse, Prize, PrizeClaim } from '@/types/api';
import { handleApiError } from '@/lib/api-error-handler';

export const rewardService = {
  getPrizes: async () => {
    try {
      const response = await api.get<ApiResponse<Prize[]>>('/rewards/prizes', {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getClaims: async () => {
    try {
      const response = await api.get<ApiResponse<PrizeClaim[]>>('/rewards/claims', {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getUserPoints: async () => {
    try {
      const response = await api.get<ApiResponse<{ total_points: number }>>('/rewards/points', {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  claimPrize: async (prizeId: string) => {
    try {
      const response = await api.post<ApiResponse<any>>('/rewards/claims', { prizeId }, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
};
