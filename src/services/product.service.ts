import api, { getAuthHeaders } from '@/lib/api';
import { ApiResponse, PaginatedResponse, Product, ProductImage } from '@/types/api';
import { handleApiError } from '@/lib/api-error-handler';

export interface CreateProductRequest {
  shopId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  inventory: number;
  images: ProductImage[];
}

const productService = {
  createProduct: async (data: CreateProductRequest) => {
    try {
      const response = await api.post<ApiResponse<{ id: string }>>('/products', data, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getProducts: async (params?: { shopId?: string; page?: number; limit?: number }) => {
    try {
      const response = await api.get<PaginatedResponse<Product>>('/products', {
        params,
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getProductById: async (id: string) => {
    try {
      const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  updateProduct: async (id: string, data: Partial<CreateProductRequest>) => {
    try {
      const response = await api.patch<ApiResponse<Product>>(`/products/${id}`, data, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  deleteProduct: async (id: string) => {
    try {
      const response = await api.delete<ApiResponse<null>>(`/products/${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

export default productService;
