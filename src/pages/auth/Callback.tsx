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
        
        // This will parse the OAuth tokens from the URL
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          navigate("/auth?tab=login");
          return;
        }

        console.log('Session data:', session);

        if (session) {
          // Create or update user role
          const { error: roleError } = await supabase
            .from("user_roles")
            .upsert({
              user_id: session.user.id,
              role: "customer", // Default role for OAuth users
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });

          if (roleError) {
            console.error('Role update error:', roleError);
          }

          // Check if user has a profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          // If no profile exists, create one
          if (!profile) {
            const { error: profileError } = await supabase
              .from("profiles")
              .insert({
                id: session.user.id,
                full_name: session.user.user_metadata?.full_name || 
                          session.user.user_metadata?.name || 
                          'Google User',
                email: session.user.email,
                created_at: new Date().toISOString(),
                is_subscribed: false,
                subscription_expires_at: null
              });

            if (profileError) {
              console.error('Profile creation error:', profileError);
            }
          }

          // Redirect based on role (default to customer dashboard)
          navigate("/customer_dashboard");
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