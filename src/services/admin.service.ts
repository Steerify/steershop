import api, { getAuthHeaders } from '@/lib/api';
import { ApiResponse, PaginatedResponse, User, Shop, Order, Product, UserRole } from '@/types/api';
import { handleApiError } from '@/lib/api-error-handler';

export interface AdminAnalytics {
  totalUsers: number;
  totalShops: number;
  activeShops: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
}

const adminService = {
  getAnalytics: async () => {
    try {
      const response = await api.get<ApiResponse<AdminAnalytics>>('/admin/analytics', {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getUsers: async (page = 1, limit = 10) => {
    try {
      const response = await api.get<PaginatedResponse<User>>('/admin/users', {
        params: { page, limit },
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
      const response = await api.get<PaginatedResponse<Shop>>('/admin/shops', {
        params: { page, limit },
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getOrders: async (page = 1, limit = 10) => {
    try {
      const response = await api.get<PaginatedResponse<Order>>('/admin/orders', {
        params: { page, limit },
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getProducts: async (page = 1, limit = 10) => {
    try {
      const response = await api.get<PaginatedResponse<Product>>('/admin/products', {
        params: { page, limit },
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  updateUserRole: async (id: string, role: UserRole) => {
    try {
      const response = await api.patch<ApiResponse<User>>(`/admin/users/${id}/role`, { role }, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

export default adminService;
