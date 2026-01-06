// src/services/upload.service.ts

const CLOUDINARY_CLOUD_NAME = 'dipfltl37';
const CLOUDINARY_UPLOAD_PRESET = 'Steersolo';

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

    // Convert WebP to JPEG before uploading (Cloudinary preset may not support WebP)
    let fileToUpload = file;
    if (file.type === 'image/webp') {
      try {
        onProgress?.(10);
        fileToUpload = await convertWebPToJpeg(file);
        onProgress?.(20);
      } catch (error) {
        console.warn('WebP conversion failed, attempting direct upload:', error);
        // Continue with original file if conversion fails
      }
    } else {
      onProgress?.(10);
    }

    // Create FormData for Cloudinary upload
    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);

    // Use XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 70) + 20;
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
            const errorMessage = errorResponse.error?.message || 'Upload failed';
            console.error('Cloudinary upload error:', errorResponse);
            reject(new Error(errorMessage));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload. Please check your connection and try again.'));
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
