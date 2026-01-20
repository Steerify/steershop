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
          console.log('User authenticated:', session.user.id);
          
          // Check if this is a new user by looking at their profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role, phone_verified')
            .eq('id', session.user.id)
            .single();

          console.log('Profile fetch result:', { profile, profileError });

          // If no profile exists (PGRST116 = no rows returned), it's a new user
          if (profileError && profileError.code === 'PGRST116') {
            console.log('New Google user detected, redirecting to role selection');
            
            // Create a basic profile for the new Google user
            const { error: createProfileError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                email: session.user.email,
                full_name: session.user.user_metadata?.full_name || '',
                avatar_url: session.user.user_metadata?.avatar_url || '',
                role: null, // Set role as null initially - THIS IS KEY!
                phone_verified: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (createProfileError) {
              console.error('Error creating profile for Google user:', createProfileError);
            }
            
            // Redirect to role selection page for Google signups
            navigate("/select-role");
            return;
          }

          // If profile exists but role is not set (null), redirect to role selection
          if (!profile?.role || profile.role === null) {
            console.log('Google user needs role selection (role is null/empty)');
            navigate("/select-role");
            return;
          }

          // Existing user with role set - proceed with normal flow
          console.log('Existing user with role:', profile.role);
          
          let redirectPath = '/';
          
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
          } else if (profile.role === 'customer') {
            redirectPath = '/customer_dashboard';
          } else {
            // Unknown role, default to customer dashboard
            console.warn('Unknown role, defaulting to customer dashboard');
            redirectPath = '/customer_dashboard';
          }

          console.log('Redirecting to:', redirectPath);
          navigate(redirectPath);
        } else {
          console.log('No session found, redirecting to login');
          navigate("/auth?tab=login");
        }
      } catch (error: any) {
        console.error('Callback error:', error);
        
        // More detailed error logging
        if (error.message) {
          console.error('Error message:', error.message);
        }
        if (error.stack) {
          console.error('Error stack:', error.stack);
        }
        
        navigate("/auth?tab=login");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-primary/20 to-accent/20 rounded-full" />
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-primary relative z-10" />
        </div>
        <div className="space-y-2 relative z-10">
          <h2 className="text-2xl font-bold font-heading bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Completing Sign In
          </h2>
          <p className="text-lg font-medium text-foreground">
            Almost there...
          </p>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            Setting up your account and preparing your dashboard
          </p>
        </div>
        <div className="pt-4">
          <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-primary to-accent animate-pulse w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Callback;