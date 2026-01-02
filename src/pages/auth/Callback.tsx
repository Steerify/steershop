import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const Callback = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Processing Mock OAuth callback...');
        
        // Simulate OAuth delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Log in the mock user
        await signIn({ email: "google-user@example.com", password: "mock-password" });

        // Redirect based on role (default to customer dashboard)
        navigate("/customer_dashboard");
      } catch (error) {
        console.error('Callback error:', error);
        navigate("/auth?tab=login");
      }
    };

    handleCallback();
  }, [navigate, signIn]);

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