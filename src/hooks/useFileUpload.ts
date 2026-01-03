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
    } catch (err: any) {
      setIsUploading(false);
      
      // Error is already handled by uploadService calling handleApiError
      // We just capture the message for local UI display if needed
      const errorMessage = err.response?.data?.message || err.message || 'Upload failed';
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
