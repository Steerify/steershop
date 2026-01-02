import api, { getAuthHeaders } from '@/lib/api';
import { ApiResponse, Order, OrderItem } from '@/types/api';
import { handleApiError } from '@/lib/api-error-handler';

export interface CreateOrderRequest {
  shopId: string;
  items: OrderItem[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryFee: number;
  notes?: string;
}

const orderService = {
  createOrder: async (data: CreateOrderRequest) => {
    try {
      const response = await api.post<ApiResponse<{ id: string; status: string }>>('/orders', data, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  updateOrderStatus: async (id: string, status: string) => {
    try {
      const response = await api.patch<ApiResponse<null>>(`/orders/${id}/status`, { status }, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

export default orderService;
