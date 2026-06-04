import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
}

interface CredentialResponse {
  credential: string;
  select_by: string;
}

// Google's button max width is 400px
const GOOGLE_MAX_WIDTH = 400;
const GOOGLE_MIN_WIDTH = 200;

export const GoogleSignInButton = ({
  onSuccess,
  onError,
  text = 'continue_with',
  theme = 'outline',
  size = 'large',
}: GoogleSignInButtonProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [renderWidth, setRenderWidth] = useState<number>(0);

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
        onSuccess?.();
      }
    } catch (err) {
      console.error('Google sign in error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast.error('An error occurred during sign in');
      onError?.(errorMessage);
    }
  }, [onSuccess, onError, navigate]);

  // Measure parent width and observe resize
  useEffect(() => {
    if (!wrapperRef.current) return;
    const el = wrapperRef.current;
    const measure = () => {
      const w = el.clientWidth;
      if (w > 0) {
        setRenderWidth(Math.max(GOOGLE_MIN_WIDTH, Math.min(GOOGLE_MAX_WIDTH, Math.floor(w))));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Render (and re-render) Google button when width changes
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !buttonRef.current || !window.google?.accounts?.id || !renderWidth) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      use_fedcm_for_prompt: false,
    });

    // Clear previous render before re-rendering
    buttonRef.current.innerHTML = '';

    window.google.accounts.id.renderButton(buttonRef.current, {
      type: 'standard',
      theme,
      size,
      text,
      shape: 'rectangular',
      logo_alignment: 'center',
      width: renderWidth,
    });
  }, [handleCredentialResponse, text, theme, size, renderWidth]);

  return (
    <div ref={wrapperRef} className="w-full flex justify-center">
      <div ref={buttonRef} className="google-sign-in-container" />
    </div>
  );
};

export default GoogleSignInButton;
