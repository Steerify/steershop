// src/services/upload.service.ts
import { supabase } from '@/integrations/supabase/client';

export interface UploadResponse {
  url: string;
}

export const uploadService = {
  uploadImage: async (
    file: File,
    bucket: 'shop-images' | 'product-images' = 'product-images',
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> => {
    try {
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
      if (!validExtensions.includes(fileExt)) {
        throw new Error('Invalid file type. Please upload JPG, PNG, or WebP.');
      }
      
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      
      onProgress?.(20);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Supabase storage error:', error);
        throw new Error(error.message || 'Failed to upload image');
      }

      onProgress?.(80);

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      onProgress?.(100);

      return { url: publicUrlData.publicUrl };
    } catch (error: any) {
      console.error('Upload error:', error);
      throw error;
    }
  },

  deleteImage: async (
    url: string,
    bucket: 'shop-images' | 'product-images' = 'product-images'
  ): Promise<void> => {
    try {
      // Extract filename from URL
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      if (!fileName) return;

      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName]);

      if (error) {
        console.error('Delete error:', error);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  },
};
