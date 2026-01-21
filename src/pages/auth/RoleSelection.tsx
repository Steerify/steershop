import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, Store, ShoppingBag, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import logo from "@/assets/steersolo-logo.jpg";
import { UserRole } from "@/types/api";

const RoleSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/auth?tab=login");
          return;
        }
      } catch (error) {
        console.error("Error checking session:", error);
        navigate("/auth?tab=login");
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, [navigate]);

  const handleRoleSelect = async () => {
    if (!selectedRole) return;

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error("No user session found");
      }

      // Map UserRole enum to database role string
      let dbRole: "admin" | "customer" | "shop_owner";
      switch (selectedRole) {
        case UserRole.ENTREPRENEUR:
          dbRole = 'shop_owner';
          break;
        case UserRole.CUSTOMER:
          dbRole = 'customer';
          break;
        case UserRole.ADMIN:
          dbRole = 'admin';
          break;
        default:
          dbRole = 'customer';
      }

      // Update the user's profile with the selected role and clear the flag
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: dbRole,
          needs_role_selection: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }

      toast({
        title: "Role selected!",
        description: `Welcome as ${selectedRole === UserRole.ENTREPRENEUR ? "an Entrepreneur" : "a Customer"}`,
      });

      // Redirect based on role
      if (selectedRole === UserRole.ENTREPRENEUR) {
        navigate("/onboarding");
      } else {
        navigate("/customer_dashboard");
      }

    } catch (error: any) {
      console.error("Error setting role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to set role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4 relative overflow-hidden">
      <AdirePattern variant="geometric" className="absolute inset-0 opacity-5" />
      
      <Card className="w-full max-w-md relative z-10 border-primary/10 shadow-2xl backdrop-blur-sm bg-card/95">
        <CardHeader className="text-center border-b border-border/50 pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg ring-4 ring-primary/20">
              <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
            </div>
          </div>
          <CardTitle className="text-2xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome to SteerSolo!
          </CardTitle>
          <CardDescription className="text-lg">
            Choose how you want to use our platform
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-4">
            <div
              onClick={() => setSelectedRole(UserRole.ENTREPRENEUR)}
              className={cn(
                "relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-muted/50",
                selectedRole === UserRole.ENTREPRENEUR
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-muted hover:border-primary/50"
              )}
            >
              <div className={cn(
                "p-3 rounded-lg transition-colors",
                selectedRole === UserRole.ENTREPRENEUR ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                <Store className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground">Entrepreneur</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create and manage my own shop. Sell products and grow your business.
                </p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-primary" />
                    <span>Create your own store</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-primary" />
                    <span>Sell products & services</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-primary" />
                    <span>Manage orders & customers</span>
                  </li>
                </ul>
              </div>
              {selectedRole === UserRole.ENTREPRENEUR && (
                <div className="absolute top-4 right-4 text-primary animate-in zoom-in spin-in-180">
                  <Check className="w-5 h-5" />
                </div>
              )}
            </div>

            <div
              onClick={() => setSelectedRole(UserRole.CUSTOMER)}
              className={cn(
                "relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-muted/50",
                selectedRole === UserRole.CUSTOMER
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-muted hover:border-primary/50"
              )}
            >
              <div className={cn(
                "p-3 rounded-lg transition-colors",
                selectedRole === UserRole.CUSTOMER ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground">Customer</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Browse and shop from a variety of unique stores.
                </p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-primary" />
                    <span>Discover unique products</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-primary" />
                    <span>Secure checkout</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-primary" />
                    <span>Track your orders</span>
                  </li>
                </ul>
              </div>
              {selectedRole === UserRole.CUSTOMER && (
                <div className="absolute top-4 right-4 text-primary animate-in zoom-in spin-in-180">
                  <Check className="w-5 h-5" />
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <Button
              className="w-full bg-gradient-to-r from-primary to-accent py-6 text-lg"
              onClick={handleRoleSelect}
              disabled={!selectedRole || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Setting up account...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleSelection;