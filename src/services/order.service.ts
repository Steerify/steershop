import api, { getAuthHeaders } from '@/lib/api';
import { ApiResponse, Order, OrderItem, PaginatedResponse } from '@/types/api';
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



  getOrders: async (params?: { page?: number, limit?: number, shopId?: string, status?: string }) => {
    try {
      const response = await api.get<PaginatedResponse<Order>>(`/orders`, {
        headers: getAuthHeaders(),
        params,
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getOrderById: async (id: string) => {
    try {
      const response = await api.get<ApiResponse<Order>>(`/orders/${id}`, {
        headers: getAuthHeaders(),
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

  getWhatsAppLink: async (id: string) => {
    try {
      const response = await api.get<ApiResponse<{ whatsappLink: string; message: string }>>(`/orders/${id}/whatsapp-link`, {
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
