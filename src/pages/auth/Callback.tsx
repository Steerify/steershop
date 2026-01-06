import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Processing OAuth callback...');
        
        // Get the session from the URL hash (Supabase OAuth redirect)
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('OAuth callback error:', error);
          navigate("/auth?tab=login");
          return;
        }

        if (session?.user) {
          // Fetch user profile to determine redirect
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          let redirectPath = '/';
          
          if (profile) {
            if (profile.role === 'admin') {
              redirectPath = '/admin';
            } else if (profile.role === 'shop_owner') {
              // Check if they have a shop (onboarding completed)
              const { data: shops } = await supabase
                .from('shops')
                .select('id')
                .eq('owner_id', session.user.id)
                .limit(1);
              
              redirectPath = (shops && shops.length > 0) ? '/dashboard' : '/onboarding';
            } else {
              redirectPath = '/customer_dashboard';
            }
          }

          navigate(redirectPath);
        } else {
          navigate("/auth?tab=login");
        }
      } catch (error) {
        console.error('Callback error:', error);
        navigate("/auth?tab=login");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-lg font-medium">Completing sign in...</p>
        <p className="text-sm text-muted-foreground mt-2">
          Please wait while we redirect you
        </p>
      </div>
    </div>
  );
};

export default Callback;
