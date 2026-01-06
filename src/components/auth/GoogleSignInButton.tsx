import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  width?: string;
}

interface CredentialResponse {
  credential: string;
  select_by: string;
}

export const GoogleSignInButton = ({
  onSuccess,
  onError,
  text = 'continue_with',
  theme = 'outline',
  size = 'large',
  width = '100%',
}: GoogleSignInButtonProps) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const handleCredentialResponse = useCallback(async (response: CredentialResponse) => {
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      });

      if (error) {
        console.error('Google sign in error:', error);
        toast.error('Failed to sign in with Google');
        onError?.(error.message);
        return;
      }

      if (data.user) {
        toast.success('Signed in successfully!');
        onSuccess?.();
      }
    } catch (err) {
      console.error('Google sign in error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast.error('An error occurred during sign in');
      onError?.(errorMessage);
    }
  }, [onSuccess, onError]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId || !buttonRef.current || !window.google?.accounts?.id) {
      return;
    }

    // Prevent re-initialization
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Initialize Google Identity Services
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      use_fedcm_for_prompt: true,
    });

    // Render the personalized button
    window.google.accounts.id.renderButton(buttonRef.current, {
      type: 'standard',
      theme,
      size,
      text,
      shape: 'rectangular',
      logo_alignment: 'left',
      width: width === '100%' ? undefined : parseInt(width),
    });
  }, [handleCredentialResponse, text, theme, size, width]);

  return (
    <div 
      ref={buttonRef} 
      className="w-full flex justify-center [&>div]:w-full [&>div>div]:w-full"
      style={{ minHeight: size === 'large' ? '44px' : size === 'medium' ? '36px' : '28px' }}
    />
  );
};

export default GoogleSignInButton;
