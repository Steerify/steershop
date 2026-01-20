import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth, SignUpData } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import logo from "@/assets/steersolo-logo.jpg";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { UserRole } from "@/types/api";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearSessionExpired, setReturnUrl } from "@/store/slices/uiSlice";
import { resetSession, setRememberMe } from "@/store/slices/activitySlice";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

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
  role: z.enum(["ENTREPRENEUR", "CUSTOMER"]),
  referralCode: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

type SignupFormData = z.infer<typeof signupSchema>;
type LoginFormData = z.infer<typeof loginSchema>;

const Auth = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const defaultTab = searchParams.get("tab") || "login";
  const refCode = searchParams.get("ref") || "";
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { signIn, signUp, signInWithGoogle, resetPassword, user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [rememberMe, setRememberMeLocal] = useState(
    localStorage.getItem('rememberMe') === 'true'
  );

  // Get return URL from Redux or location state
  const returnUrl = useAppSelector((state) => state.ui.returnUrl);
  const lastRoute = useAppSelector((state) => state.ui.lastRoute);
  const sessionExpiredAt = useAppSelector((state) => state.ui.sessionExpiredAt);
  const locationState = location.state as { from?: { pathname: string } } | null;

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      role: "ENTREPRENEUR",
      referralCode: refCode,
    },
  });

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect if already logged in - restore previous route if available
  useEffect(() => {
    if (user && !authLoading) {
      // Determine redirect path: returnUrl (from session expiry) > location state > last route > default dashboard
      const defaultPath = getDashboardPath(user.role);
      const redirectPath = returnUrl || locationState?.from?.pathname || lastRoute || defaultPath;
      
      // Clear session-related state
      dispatch(clearSessionExpired());
      dispatch(setReturnUrl(null));
      dispatch(resetSession());
      
      navigate(redirectPath, { replace: true });
    }
  }, [user, authLoading, navigate, returnUrl, lastRoute, locationState, dispatch]);

  const getDashboardPath = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "/admin";
      case UserRole.ENTREPRENEUR:
        return "/dashboard";
      case UserRole.CUSTOMER:
        return "/customer_dashboard";
      default:
        return "/";
    }
  };

  const onSignupSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const signUpData: SignUpData = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role === "ENTREPRENEUR" ? UserRole.ENTREPRENEUR : UserRole.CUSTOMER,
      };

      const result = await signUp(signUpData);

      if (result.error) {
        setAuthError(result.error);
      } else {
        toast({
          title: "Account created!",
          description: "Welcome to SteerSolo. Redirecting to your dashboard...",
        });

        // User will be set by auth state change, which triggers redirect
        if (result.user) {
          const redirectPath = result.user.role === UserRole.ENTREPRENEUR && !result.user.onboardingCompleted
            ? "/onboarding"
            : getDashboardPath(result.user.role);
          navigate(redirectPath);
        }
      }
    } catch (error: any) {
      setAuthError(error.message || "Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const result = await signIn(data.email, data.password);

      if (result.error) {
        setAuthError(result.error);
      } else {
        toast({
          title: "Welcome back!",
          description: "Successfully logged in",
        });
        // Redirect handled by auth state change
      }
    } catch (error: any) {
      setAuthError(error.message || "Invalid credentials. Please check your email and password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const emailValidation = z.string().email("Invalid email address").parse(forgotEmail);
      
      const result = await resetPassword(emailValidation);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Check your email",
          description: "We've sent you a password reset link",
        });
        setShowForgotPassword(false);
        setForgotEmail("");
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid Email",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    const result = await signInWithGoogle();
    if (result.error) {
      setAuthError(result.error);
    }
    // If successful, user will be redirected by OAuth flow
  };

  const OrDivider = () => (
    <div className="relative my-6">
      <Separator className="bg-border/50" />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground font-medium">
        or continue with email
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
      {/* Background Patterns */}
      <AdirePattern variant="geometric" className="absolute inset-0 opacity-5" />
      <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 sm:w-96 h-48 sm:h-96 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl" />
      
      <Card className="w-full max-w-md relative z-10 border-primary/10 shadow-2xl backdrop-blur-sm bg-card/95 mx-2 sm:mx-0">
        <div className="absolute top-0 left-0 w-12 sm:w-16 h-12 sm:h-16 border-l-4 border-t-4 border-primary/30 rounded-tl-lg" />
        <div className="absolute bottom-0 right-0 w-12 sm:w-16 h-12 sm:h-16 border-r-4 border-b-4 border-accent/30 rounded-br-lg" />
        
        <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-lg ring-4 ring-primary/20 animate-float">
              <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome to SteerSolo
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm sm:text-base">
            Your business journey starts here
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-6">
          {authError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{authError}</AlertDescription>
            </Alert>
          )}

          {showForgotPassword ? (
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForgotPassword(false)}
                className="mb-2 hover:bg-primary/10 min-h-[44px]"
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
                  <Label htmlFor="forgot-email" className="text-sm">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    className="border-primary/20 focus:border-primary focus:ring-primary/30 min-h-[44px]"
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity min-h-[48px]" disabled={isLoading}>
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
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 min-h-[48px]">
                <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground min-h-[44px] text-sm sm:text-base">
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground min-h-[44px] text-sm sm:text-base">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <div className="mb-4">
                  <GoogleSignInButton 
                    text="continue_with" 
                    onSuccess={() => {
                      // Force navigation to callback for role-based routing
                      window.location.href = '/auth/callback';
                    }}
                  />
                </div>
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
                    
                    {/* Remember Me Checkbox */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => {
                          const value = checked === true;
                          setRememberMeLocal(value);
                          dispatch(setRememberMe(value));
                        }}
                      />
                      <Label 
                        htmlFor="remember" 
                        className="text-sm text-muted-foreground cursor-pointer"
                      >
                        Remember me for 30 days
                      </Label>
                    </div>
                    
                    <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity min-h-[48px] text-base" disabled={isLoading}>
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
                <div className="mb-4">
                  <GoogleSignInButton 
                    text="signup_with"
                    onSuccess={() => {
                      // Force navigation to callback for role-based routing
                      window.location.href = '/auth/callback';
                    }}
                  />
                </div>
                <OrDivider />
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <FormField
                        control={signupForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} className="min-h-[44px]" />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signupForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} className="min-h-[44px]" />
                            </FormControl>
                            <FormMessage className="text-xs" />
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
                    <FormField
                      control={signupForm.control}
                      name="referralCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Referral Code (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. SS-ABC123" {...field} className="uppercase" />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground">Have a friend's code? Enter it to earn 25 bonus points!</p>
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
    </div>
  );
};

export default Auth;
