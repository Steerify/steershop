import api, { getAuthHeaders } from '@/lib/api';
import { ApiResponse, Prize, PrizeClaim } from '@/types/api';
import { handleApiError } from '@/lib/api-error-handler';

export const rewardService = {
  getPrizes: async () => {
    try {
      const response = await api.get<ApiResponse<Prize[]>>('/rewards/prizes');
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
  },

  // Admin methods
  getRewards: async () => {
    try {
      const response = await api.get<ApiResponse<Prize[]>>('/rewards', {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  createPrize: async (data: Omit<Prize, 'id'>) => {
    try {
      const response = await api.post<ApiResponse<Prize>>('/rewards/prizes', data, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  updatePrize: async (id: string, data: Partial<Prize>) => {
    try {
      const response = await api.patch<ApiResponse<Prize>>(`/rewards/prizes/${id}`, data, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  deleteReward: async (id: string) => {
    try {
      const response = await api.delete<ApiResponse<null>>(`/rewards/${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};
