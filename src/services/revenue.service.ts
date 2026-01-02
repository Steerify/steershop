import api, { getAuthHeaders } from '@/lib/api';
import { ApiResponse, RevenueTransaction } from '@/types/api';
import { handleApiError } from '@/lib/api-error-handler';

export const revenueService = {
  createTransaction: async (data: RevenueTransaction) => {
    try {
      const response = await api.post<ApiResponse<RevenueTransaction>>('/revenue/transactions', data, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
};
