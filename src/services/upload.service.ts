// src/services/upload.service.ts
import { supabase } from '@/integrations/supabase/client';

export interface UploadResponse {
  url: string;
  publicId?: string;
}

// Convert WebP to JPEG using Canvas API
const convertWebPToJpeg = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (ctx) {
        // Draw white background for transparency
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFileName = file.name.replace(/\.webp$/i, '.jpg');
              const convertedFile = new File([blob], newFileName, { type: 'image/jpeg' });
              resolve(convertedFile);
            } else {
              reject(new Error('Failed to convert image'));
            }
          },
          'image/jpeg',
          0.92
        );
      } else {
        reject(new Error('Could not get canvas context'));
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image for conversion'));
    img.src = URL.createObjectURL(file);
  });
};

export const uploadService = {
  uploadImage: async (
    file: File,
    folder: 'shop-images' | 'product-images' = 'product-images',
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> => {
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload JPG, PNG, or WebP.');
    }

    onProgress?.(5);

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Please log in to upload images');
    }

    onProgress?.(10);

    // Get user's shop for file path organization
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (shopError) {
      console.error('Error fetching shop:', shopError);
      throw new Error('Failed to verify shop ownership');
    }

    // For shop-images, use user.id (as per RLS policy)
    // For product-images, use shop.id (as per RLS policy)
    let pathPrefix: string;
    if (folder === 'shop-images') {
      pathPrefix = user.id;
    } else {
      if (!shop?.id) {
        throw new Error('You need to create a shop first before uploading product images');
      }
      pathPrefix = shop.id;
    }

    onProgress?.(15);

    // Convert WebP to JPEG before uploading for better compatibility
    let fileToUpload = file;
    if (file.type === 'image/webp') {
      try {
        fileToUpload = await convertWebPToJpeg(file);
        onProgress?.(25);
      } catch (error) {
        console.warn('WebP conversion failed, attempting direct upload:', error);
        // Continue with original file if conversion fails
      }
    } else {
      onProgress?.(25);
    }

    // Create unique file path: {shop_id or user_id}/{timestamp}_{sanitized_filename}
    const timestamp = Date.now();
    const sanitizedName = fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${pathPrefix}/${timestamp}_${sanitizedName}`;

    onProgress?.(30);

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(folder)
      .upload(filePath, fileToUpload, {
        cacheControl: '3600',
        upsert: false
      });

    onProgress?.(80);

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw new Error(uploadError.message || 'Failed to upload image');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(folder)
      .getPublicUrl(data.path);

    onProgress?.(100);

    return {
      url: publicUrl,
      publicId: data.path,
    };
  },

  deleteImage: async (publicId: string, folder: 'shop-images' | 'product-images' = 'product-images'): Promise<void> => {
    if (!publicId) return;

    try {
      const { error } = await supabase.storage
        .from(folder)
        .remove([publicId]);

      if (error) {
        console.error('Failed to delete image:', error);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  },

  // Helper to compress image before upload (optional)
  compressImage: async (
    file: File, 
    maxWidth: number = 1920, 
    quality: number = 0.8
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to create canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Compression failed'));
                return;
              }
              
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              
              console.log(`Compressed ${file.name}: ${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB`);
              resolve(compressedFile);
            },
            'image/jpeg',
            quality
          );
        };
        
        img.onerror = () => reject(new Error('Failed to load image for compression'));
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  },
};