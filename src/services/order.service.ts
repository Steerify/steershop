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



  getOrders: async (shopId: string) => {
    try {
      const response = await api.get<ApiResponse<Order[]>>(`/orders`, {
        headers: getAuthHeaders(),
        params: { shopId },
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getOrdersByCustomer: async (customerId: string) => {
    try {
      const response = await api.get<ApiResponse<Order[]>>('/orders', {
        headers: getAuthHeaders(),
        params: { customerId },
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  updateOrderStatus: async (id: string, status: string, additionalData?: any) => {
    try {
      const response = await api.patch<ApiResponse<null>>(`/orders/${id}/status`, { status, ...additionalData }, {
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
