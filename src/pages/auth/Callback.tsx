import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { AdirePattern } from "@/components/patterns/AdirePattern";

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const next = params.get("next");

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error("Auth code exchange error:", exchangeError);
            navigate("/auth/login");
            return;
          }
        }

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("OAuth callback error:", error);
          navigate("/auth/login");
          return;
        }

        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role, phone_verified, needs_role_selection')
            .eq('id', session.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            navigate("/select-role");
            return;
          }

          if (profile?.needs_role_selection) {
            navigate("/select-role");
            return;
          }

          const { data: onboardingResponses } = await supabase
            .from('onboarding_responses')
            .select('id')
            .eq('user_id', session.user.id)
            .limit(1);

          const needsOnboarding = !onboardingResponses || onboardingResponses.length === 0;

          let redirectPath = '/';

          if (profile.role === 'admin') {
            redirectPath = '/admin';
          } else if (profile.role === 'shop_owner') {
            const { data: shops } = await supabase
              .from('shops')
              .select('id')
              .eq('owner_id', session.user.id)
              .limit(1);

            if (needsOnboarding) {
              redirectPath = '/onboarding';
            } else {
              redirectPath = (shops && shops.length > 0) ? '/dashboard' : '/onboarding';
            }
          } else if (profile.role === 'customer') {
            redirectPath = '/customer_dashboard';
          } else {
            redirectPath = '/customer_dashboard';
          }

          if (next && next.startsWith("/") && !next.startsWith("//")) {
            navigate(next);
            return;
          }

          navigate(redirectPath);
        } else {
          navigate("/auth/login");
        }
      } catch (error: any) {
        console.error("Callback error:", error);
        navigate("/auth/login");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
      <AdirePattern variant="geometric" className="text-primary" opacity={0.05} />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="text-center space-y-6 relative z-10">
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
