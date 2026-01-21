import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface CredentialResponse {
  credential: string;
  select_by: string;
}

export const GoogleOneTap = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCredentialResponse = useCallback(async (response: CredentialResponse) => {
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      });

      if (error) {
        console.error('Google One Tap sign in error:', error);
        toast.error('Failed to sign in with Google');
        return;
      }

      if (data.user) {
        // Check if this is a new Google user needing role selection
        const { data: profile } = await supabase
          .from('profiles')
          .select('needs_role_selection')
          .eq('id', data.user.id)
          .single();

        if (profile?.needs_role_selection) {
          toast.success('Welcome! Please select your account type.');
          navigate('/select-role');
          return;
        }

        toast.success('Signed in successfully!');
        // Navigation will be handled by auth state change
      }
    } catch (err) {
      console.error('Google One Tap error:', err);
      toast.error('An error occurred during sign in');
    }
  }, [navigate]);

  useEffect(() => {
    // Don't show One Tap if user is already logged in
    if (user) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google?.accounts?.id) return;

    // Initialize Google One Tap
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      auto_select: true,
      cancel_on_tap_outside: true,
      use_fedcm_for_prompt: true,
    });

    // Show the One Tap prompt
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        console.log('One Tap not displayed:', notification.getNotDisplayedReason());
      }
      if (notification.isSkippedMoment()) {
        console.log('One Tap skipped:', notification.getSkippedReason());
      }
    });

    return () => {
      // Cancel the One Tap prompt when component unmounts
      window.google?.accounts?.id?.cancel();
    };
  }, [user, handleCredentialResponse]);

  // This component doesn't render anything visible
  // The One Tap popup is handled by Google's SDK
  return null;
};

export default GoogleOneTap;
