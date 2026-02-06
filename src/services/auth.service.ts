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
  // Forgot password - sends reset email via fast Resend edge function
  forgotPassword: async (email: string) => {
    const { error } = await supabase.functions.invoke('send-password-reset', {
      body: { email },
    });
     
    if (error) {
      throw new Error('Failed to send reset email. Please try again.');
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
