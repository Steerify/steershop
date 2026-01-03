// src/hooks/useFileUpload.ts
import { useState, useCallback } from 'react';
import { uploadService } from '@/services/upload.service';

interface UseFileUploadReturn {
  upload: (file: File, userId?: string) => Promise<string | null>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  reset: () => void;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  const upload = useCallback(async (file: File, userId?: string): Promise<string | null> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const response = await uploadService.uploadImage(file, userId, (p) => {
        setProgress(p);
      });
      setIsUploading(false);
      return response.url;
    } catch (err: unknown) {
      setIsUploading(false);
      let errorMessage = 'Upload failed. Please try again.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      // Check for axios error specifically if needed, or stick to a general approach
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }
      setError(errorMessage);
      return null;
    }
  }, []);

  return {
    upload,
    isUploading,
    progress,
    error,
    reset,
  };
};
