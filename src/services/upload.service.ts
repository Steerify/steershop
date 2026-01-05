// src/services/upload.service.ts

const CLOUDINARY_CLOUD_NAME = 'dipfltl37';
const CLOUDINARY_UPLOAD_PRESET = 'Steersolo';

export interface UploadResponse {
  url: string;
  publicId?: string;
}

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

    onProgress?.(10);

    // Create FormData for Cloudinary upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);

    // Use XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 80) + 10;
          onProgress?.(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            onProgress?.(100);
            resolve({
              url: response.secure_url,
              publicId: response.public_id,
            });
          } catch (error) {
            reject(new Error('Failed to parse upload response'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.error?.message || 'Upload failed'));
          } catch {
            reject(new Error('Upload failed'));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`);
      xhr.send(formData);
    });
  },

  deleteImage: async (publicId: string): Promise<void> => {
    // Note: Cloudinary deletion requires signed API (server-side)
    // This is a no-op for now - images will remain in Cloudinary
    // To properly delete, implement an edge function with Cloudinary API secret
    console.log('Image deletion requires server-side implementation:', publicId);
  },
};
