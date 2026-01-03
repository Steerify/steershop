import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RoleSelectionDialog } from "@/components/auth/RoleSelectionDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import logo from "@/assets/steersolo-logo.jpg";
import authService, { SignupRequest, LoginRequest } from "@/services/auth.service";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { UserRole } from "@/types/api";

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  role: z.enum(["ENTREPRENEUR", "CUSTOMER", "ADMIN"])
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
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { signIn, signUp, setAuth, googleLogin, googleSignup, setGoogleCallback } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [googleCredentialIdToken, setGoogleCredentialIdToken] = useState<string | null>(null);
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);
  const googleLoginBtnRef = useRef<HTMLDivElement>(null);
  const googleSignupBtnRef = useRef<HTMLDivElement>(null);

  const signupForm = useForm<SignupRequest>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      role: UserRole.ENTREPRENEUR,
    },
  });

  const loginForm = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const getDashboardPath = (user: { role: UserRole; onboardingCompleted?: boolean }, isSignup: boolean) => {
    switch (user.role) {
      case UserRole.ADMIN:
        return "/admin";
      case UserRole.ENTREPRENEUR:
        if (isSignup && !user.onboardingCompleted) {
          return "/onboarding";
        }
        return "/dashboard";
      case UserRole.CUSTOMER:
        return "/customer_dashboard";
      default:
        return "/";
    }
  };

  const onSignupSubmit = async (data: SignupRequest) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const authData = await signUp(data);

      if (authData) {
        toast({
          title: "Account created!",
          description: "Welcome to SteerSolo. Redirecting to your dashboard...",
        });

        navigate(getDashboardPath(authData.user, true));
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Please try again";
      setAuthError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onLoginSubmit = async (data: LoginRequest) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const authData = await signIn(data);

      if (authData) {
        toast({
          title: "Welcome back!",
          description: "Successfully logged in",
        });

        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(redirectPath);
        } else {
          navigate(getDashboardPath(authData.user, false));
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Invalid credentials. Please check your email and password.";
      setAuthError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const emailValidation = z.string().email("Invalid email address").parse(forgotEmail);
      
      await authService.forgotPassword(emailValidation);

      toast({
        title: "Check your email",
        description: "We've sent you a password reset link",
      });
      setShowForgotPassword(false);
      setForgotEmail("");
    } catch (error: any) {
      // Errors handled by service or local validation
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleResponse = async (response: any) => {
    setAuthError(null);
    try {
      const googleCredential = response.credential;
      if (googleCredential) {
        setGoogleCredentialIdToken(googleCredential);
        
        if (activeTab === "signup") {
          setShowRoleSelection(true);
        } else {
          // Login Flow
          setIsLoading(true);
          try {
            const authData = await googleLogin(googleCredential);
            if (authData) {
              toast({
                title: "Welcome back!",
                description: "Successfully logged in with Google",
              });
              const redirectPath = sessionStorage.getItem('redirectAfterLogin');
              if (redirectPath) {
                sessionStorage.removeItem('redirectAfterLogin');
                navigate(redirectPath);
              } else {
                navigate(getDashboardPath(authData.user, false));
              }
            }
          } catch (error: any) {
             const statusCode = error.response?.status;
             if (statusCode === 404) {
               toast({
                 title: "Account not found",
                 description: "Please select a role to create a new account.",
               });
               setShowRoleSelection(true);
             } else {
               const errorMessage = error.response?.data?.message || "Google login failed. Please try again.";
               setAuthError(errorMessage);
               toast({
                 title: "Google Sign-in Failed",
                 description: errorMessage,
                 variant: "destructive"
               });
             }
          } finally {
            setIsLoading(false);
          }
        }
      }
    } catch (error: any) {
       console.error("Google Auth Error", error);
       setAuthError("Failed to initiate Google login");
    }
  };

  const handleRoleConfirm = async (role: UserRole) => {
    if (!googleCredentialIdToken) {
      toast({
        title: "Error",
        description: "Session invalid. Please try signing in with Google again.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const authData = await googleSignup(googleCredentialIdToken, role);

      if (authData) {
        toast({
          title: "Account created!",
          description: "Successfully signed up with Google",
        });

        const redirectPath = getDashboardPath(authData.user, true);
        navigate(redirectPath);
      }
    } catch (error: any) {
      console.error("googleSignup error:", error);
      const errorMessage = error.response?.data?.message || "Google signup failed. Please try again.";
      setAuthError(errorMessage);
      toast({
        title: "Google Sign-up Failed",
        description: errorMessage,
        variant: "destructive"
      });
      setShowRoleSelection(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Load Google Identity Services script
  useEffect(() => {
    const loadGoogleScript = () => {
      if (window.google || isGoogleScriptLoaded) return;

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsGoogleScriptLoaded(true);
      };
      document.head.appendChild(script);
    };

    loadGoogleScript();

    return () => {
      // Clean up Google button elements
      if (googleLoginBtnRef.current) {
        googleLoginBtnRef.current.innerHTML = '';
      }
      if (googleSignupBtnRef.current) {
        googleSignupBtnRef.current.innerHTML = '';
      }
    };
  }, []);

  // Initialize Google Identity Services when script is loaded and tab changes
  useEffect(() => {
    if (!window.google || !isGoogleScriptLoaded) return;

    try {
      window.google.accounts.id.initialize({
        client_id: process.env.VITE_GOOGLE_CLIENT_ID || "",
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: false,
        theme: document.documentElement.classList.contains('dark') ? 'filled_black' : 'outline',
        shape: 'rectangular',
        size: 'large',
        text: 'continue_with',
        locale: 'en',
        width: '100%',
      });

      // Render buttons based on current tab
      if (activeTab === 'login' && googleLoginBtnRef.current) {
        googleLoginBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(
          googleLoginBtnRef.current,
          {
            theme: document.documentElement.classList.contains('dark') ? 'filled_black' : 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            width: '100%',
            logo_alignment: 'center',
            type: 'standard'
          }
        );
      }

      if (activeTab === 'signup' && googleSignupBtnRef.current) {
        googleSignupBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(
          googleSignupBtnRef.current,
          {
            theme: document.documentElement.classList.contains('dark') ? 'filled_black' : 'outline',
            size: 'large',
            text: 'signup_with',
            shape: 'rectangular',
            width: '100%',
            logo_alignment: 'center',
            type: 'standard'
          }
        );
      }

      // Prompt is not needed for this flow as we have our own buttons
      window.google.accounts.id.prompt();
    } catch (error) {
      console.error('Failed to initialize Google Identity Services:', error);
    }
  }, [isGoogleScriptLoaded, activeTab]);

  // Watch for theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (window.google && isGoogleScriptLoaded) {
        // Reinitialize Google button with current theme
        const theme = document.documentElement.classList.contains('dark') ? 'filled_black' : 'outline';
        
        if (activeTab === 'login' && googleLoginBtnRef.current) {
          googleLoginBtnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(
            googleLoginBtnRef.current,
            {
              theme,
              size: 'large',
              text: 'continue_with',
              shape: 'rectangular',
              width: '100%',
              logo_alignment: 'center',
              type: 'standard'
            }
          );
        }

        if (activeTab === 'signup' && googleSignupBtnRef.current) {
          googleSignupBtnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(
            googleSignupBtnRef.current,
            {
              theme,
              size: 'large',
              text: 'signup_with',
              shape: 'rectangular',
              width: '100%',
              logo_alignment: 'center',
              type: 'standard'
            }
          );
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, [isGoogleScriptLoaded, activeTab]);

  const OrDivider = () => (
    <div className="relative my-6">
      <Separator className="bg-border/50" />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground font-medium">
        or continue with email
      </span>
    </div>
  );

  // Custom Google button component with proper styling - UPDATED FOR MOBILE RESPONSIVENESS
  const CustomGoogleButton = ({ isSignup = false, ref }: { isSignup?: boolean, ref: React.RefObject<HTMLDivElement> }) => (
    <div className="w-full mb-4">
      <div 
        ref={ref}
        className="w-full h-[44px] flex items-center justify-center bg-background border border-input rounded-md hover:bg-accent/50 transition-colors overflow-hidden"
        style={{
          minHeight: '44px',
        }}
      >
        {/* Loading placeholder */}
        {!isGoogleScriptLoaded && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground px-2 sm:px-4">
            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
            <span className="text-sm truncate text-center">
              Loading Google sign-in...
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Add CSS overrides for Google button responsiveness */}
      <style>
        {`
          iframe[src*="accounts.google.com"] {
            width: 100% !important;
            max-width: 100% !important;
          }
          
          @media (max-width: 640px) {
            .gsi-material-button {
              min-width: 100% !important;
              width: 100% !important;
            }
          }
        `}
      </style>
      
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Patterns */}
        <AdirePattern variant="geometric" className="absolute inset-0 opacity-5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl" />
        
        <Card className="w-full max-w-md relative z-10 border-primary/10 shadow-2xl backdrop-blur-sm bg-card/95 mx-4">
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
          
          <CardContent className="px-4 sm:px-6">
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
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                  <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-6">
                  <CustomGoogleButton ref={googleLoginBtnRef} />
                  <OrDivider />
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="you@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel>Password</FormLabel>
                              <Button
                                type="button"
                                variant="link"
                                className="px-0 text-xs text-primary hover:text-primary/80"
                                onClick={() => setShowForgotPassword(true)}
                              >
                                Forgot password?
                              </Button>
                            </div>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                  </Form>
                </TabsContent>

                <TabsContent value="signup" className="mt-6">
                  <CustomGoogleButton isSignup={true} ref={googleSignupBtnRef} />
                  <OrDivider />
                  <Form {...signupForm}>
                    <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={signupForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={signupForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+234..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signupForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="you@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signupForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="At least 8 characters" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signupForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>I want to:</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="space-y-2"
                              >
                                <div className="flex items-center space-x-3 p-3 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer">
                                  <RadioGroupItem value="ENTREPRENEUR" id="ENTREPRENEUR" className="text-primary" />
                                  <Label htmlFor="ENTREPRENEUR" className="font-normal cursor-pointer flex-1">
                                    Create and manage my own shop
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-3 p-3 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer">
                                  <RadioGroupItem value="CUSTOMER" id="CUSTOMER" className="text-primary" />
                                  <Label htmlFor="CUSTOMER" className="font-normal cursor-pointer flex-1">
                                    Browse and shop from stores
                                  </Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                  </Form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
        
        <RoleSelectionDialog 
          open={showRoleSelection} 
          onConfirm={handleRoleConfirm}
          isLoading={isLoading}
        />
      </div>
    </>
  );
};

export default Auth;