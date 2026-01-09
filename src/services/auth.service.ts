import { supabase } from '@/integrations/supabase/client';

export interface SignupRequest {
  email: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

const authService = {
  // Forgot password - sends reset email
  forgotPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
     
    if (error) {
      throw new Error(error.message);
    }
    
    return { success: true, message: 'Password reset email sent' };
  },

  // Reset password with new password
  resetPassword: async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { success: true, message: 'Password updated successfully' };
  },

  // Clear auth data (handled by Supabase, but keeping for compatibility)
  clearAuthData: () => {
    // Supabase handles this automatically
    console.log('Auth data cleared');
  },
};

export default authService;
