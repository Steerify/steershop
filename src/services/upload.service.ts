// src/services/upload.service.ts
import api, { getAuthHeaders } from '@/lib/api';
import { ApiResponse } from '@/types/api';
import { handleApiError } from '@/lib/api-error-handler';

export interface UploadResponse {
  url: string;
}

export const uploadService = {
  uploadImage: async (
    file: File,
    userId?: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      if (userId) {
        formData.append('userId', userId);
      }

      const response = await api.post<ApiResponse<UploadResponse>>('/upload', formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': undefined, // Allow Axios to set boundary automatically
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });

      return response.data.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};
