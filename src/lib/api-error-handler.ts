// src/lib/api-error-handler.ts
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/types/api";

export const handleApiError = (error: unknown) => {
  if (error instanceof AxiosError) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;

    // 401 / 403: Authentication or Authorization Errors
    if (status === 401 || status === 403) {
      const message = data?.message || "Authentication failed. Please login again.";
      toast.error("Authentication Error", {
        description: message,
      });
      
      // Auto-logout for auth errors
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
        window.location.href = '/auth/login';
      }
      return;
    }

    // 400: Validation or Bad Request
    if (status === 400) {
      const message = data?.message || "Invalid request parameters.";
      
      // Handle structured validation errors (assuming data.error could be an object/array)
      if (data?.error && typeof data.error === 'object') {
        const validationErrors = data.error;
        
        // If it's an array of errors (like Zod)
        if (Array.isArray(validationErrors)) {
          validationErrors.forEach((err: any) => {
            const field = err.path ? `${err.path.join('.')}: ` : "";
            toast.error("Validation Error", {
              description: `${field}${err.message}`,
            });
          });
          return;
        }
        
        // If it's a key-value object of errors
        const errorEntries = Object.entries(validationErrors);
        if (errorEntries.length > 0) {
          errorEntries.forEach(([field, msg]: [string, any]) => {
            toast.error("Validation Error", {
              description: `${field}: ${msg}`,
            });
          });
          return;
        }
      }

      toast.error("Request Error", {
        description: message,
      });
      return;
    }

    // 500: Generic Server Error
    if (status && status >= 500) {
      toast.error("Server Error", {
        description: "A server error occurred. Please try again later.",
      });
      return;
    }

    // Fallback for other status codes with data.message
    if (data?.message) {
      toast.error("Error", {
        description: data.message,
      });
      return;
    }
  }

  // Generic Fallback
  toast.error("Connection Error", {
    description: "Unable to connect to the server. Please check your internet connection.",
  });
};
