import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, ArrowLeft, Wrench } from "lucide-react";
import { z } from "zod";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import logo from "@/assets/steersolo-logo.jpg";

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name is required"),
  role: z.enum(["shop_owner", "customer"])
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

const Auth = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "login";
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "shop_owner" as "shop_owner" | "customer"
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validated = signupSchema.parse(signupData);
      
      const { data, error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: validated.fullName,
            role: validated.role
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Account created!",
        description: "Welcome to SteerSolo. Redirecting to your dashboard...",
      });

      navigate(validated.role === "shop_owner" ? "/dashboard" : "/customer_dashboard");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Signup failed",
          description: error.message || "Please try again",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validated = loginSchema.parse(loginData);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: validated.email,
        password: validated.password
      });

      if (error) throw error;

      // Fetch user role from user_roles table (authoritative source)
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .single();

      toast({
        title: "Welcome back!",
        description: "Successfully logged in",
      });

      // Navigate based on role
      if (roleData?.role === "admin") {
        navigate("/admin");
      } else if (roleData?.role === "shop_owner") {
        navigate("/dashboard");
      } else {
        navigate("/customer_dashboard");
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Login failed",
          description: error.message || "Invalid credentials",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const emailValidation = z.string().email("Invalid email address").parse(forgotEmail);
      
      const { error } = await supabase.auth.resetPasswordForEmail(emailValidation, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Check your email",
        description: "We've sent you a password reset link",
      });
      setShowForgotPassword(false);
      setForgotEmail("");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Failed to send reset email",
          description: error.message || "Please try again",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const GoogleButton = () => (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        className="w-full opacity-60 cursor-not-allowed border-border/50"
        disabled
      >
        <svg className="mr-2 h-4 w-4 opacity-50" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </Button>
      <Badge 
        variant="secondary" 
        className="absolute -top-2 -right-2 bg-gold/20 text-gold border-gold/30 text-[10px] px-2"
      >
        <Wrench className="w-3 h-3 mr-1" />
        Coming Soon
      </Badge>
    </div>
  );

  const OrDivider = () => (
    <div className="relative my-6">
      <Separator className="bg-border/50" />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground font-medium">
        or continue with email
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Patterns */}
      <AdirePattern variant="geometric" className="absolute inset-0 opacity-5" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl" />
      
      <Card className="w-full max-w-md relative z-10 border-primary/10 shadow-2xl backdrop-blur-sm bg-card/95">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16 border-l-4 border-t-4 border-primary/30 rounded-tl-lg" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-r-4 border-b-4 border-accent/30 rounded-br-lg" />
        
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg ring-4 ring-primary/20 animate-float">
              <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
            </div>
          </div>
          <CardTitle className="text-3xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome to SteerSolo
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Your business journey starts here
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Google Maintenance Notice */}
          <div className="mb-4 p-3 rounded-lg bg-gold/10 border border-gold/20">
            <p className="text-xs text-gold flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Google Sign-in is under maintenance. Please use email login.
            </p>
          </div>

          {showForgotPassword ? (
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForgotPassword(false)}
                className="mb-2 hover:bg-primary/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Button>
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold font-heading">Reset your password</h3>
                <p className="text-sm text-muted-foreground">
                  Enter your email and we'll send you a reset link
                </p>
              </div>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    className="border-primary/20 focus:border-primary focus:ring-primary/30"
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Reset Link
                    </>
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <GoogleButton />
                <OrDivider />
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      className="border-primary/20 focus:border-primary focus:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Password</Label>
                      <Button
                        type="button"
                        variant="link"
                        className="px-0 text-xs text-primary hover:text-primary/80"
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      className="border-primary/20 focus:border-primary focus:ring-primary/30"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <GoogleButton />
                <OrDivider />
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      placeholder="John Doe"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      required
                      className="border-primary/20 focus:border-primary focus:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                      className="border-primary/20 focus:border-primary focus:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                      className="border-primary/20 focus:border-primary focus:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="font-medium">I want to:</Label>
                    <RadioGroup
                      value={signupData.role}
                      onValueChange={(value: "shop_owner" | "customer") => 
                        setSignupData({ ...signupData, role: value })
                      }
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer">
                        <RadioGroupItem value="shop_owner" id="shop_owner" className="text-primary" />
                        <Label htmlFor="shop_owner" className="font-normal cursor-pointer flex-1">
                          Create and manage my own shop
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer">
                        <RadioGroupItem value="customer" id="customer" className="text-primary" />
                        <Label htmlFor="customer" className="font-normal cursor-pointer flex-1">
                          Browse and shop from stores
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
