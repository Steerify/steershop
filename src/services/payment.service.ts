import api, { getAuthHeaders } from '@/lib/api';
import { ApiResponse, PaymentInitialization, PaymentVerification } from '@/types/api';
import { handleApiError } from '@/lib/api-error-handler';

const paymentService = {
  initializePayment: async (orderId: string) => {
    try {
      const response = await api.post<ApiResponse<PaymentInitialization>>('/payments/initialize', { orderId }, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  verifyPayment: async (reference: string) => {
    try {
      const response = await api.get<ApiResponse<PaymentVerification>>(`/payments/verify/${reference}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

export default paymentService;
