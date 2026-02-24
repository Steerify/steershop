import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
import { Loader2, Mail, ArrowLeft, Store, ShoppingBag, Eye, EyeOff } from "lucide-react";
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

// Password input component with eye toggle
const PasswordInput = ({ field, placeholder }: { field: any; placeholder?: string }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        {...field}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
};

// Simplified signup - only email, password, role
const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  role: z.enum(["ENTREPRENEUR", "CUSTOMER"]),
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
  const { type } = useParams();
  const defaultTab = type === 'signup' ? 'signup' : (searchParams.get("tab") || "login");
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
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const returnUrl = useAppSelector((state) => state.ui.returnUrl);
  const lastRoute = useAppSelector((state) => state.ui.lastRoute);
  const locationState = location.state as { from?: { pathname: string } } | null;

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "ENTREPRENEUR",
    },
  });

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (user && !authLoading) {
      const checkRoleSelection = async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('needs_role_selection')
          .eq('id', user.id)
          .single();

        if (profile?.needs_role_selection) {
          navigate('/select-role', { replace: true });
          return;
        }

        // Entrepreneurs who haven't completed onboarding go to /onboarding
        let defaultPath = getDashboardPath(user.role);
        if (user.role === UserRole.ENTREPRENEUR && user.onboardingCompleted === false) {
          defaultPath = '/onboarding';
        }
        const redirectPath = returnUrl || locationState?.from?.pathname || lastRoute || defaultPath;

        dispatch(clearSessionExpired());
        dispatch(setReturnUrl(null));
        dispatch(resetSession());

        navigate(redirectPath, { replace: true });
      };

      checkRoleSelection();
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
        firstName: "", // Will be collected in onboarding
        lastName: "",
        phone: "",
        role: data.role === "ENTREPRENEUR" ? UserRole.ENTREPRENEUR : UserRole.CUSTOMER,
      };

      const result = await signUp(signUpData);

      if (result.error) {
        setAuthError(result.error);
      } else {
        // Show email verification notice instead of immediate redirect
        // Supabase requires email confirmation before user can log in
        setRegisteredEmail(data.email);
        setShowEmailVerification(true);
        
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
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
      }
    } catch (error: any) {
      setAuthError(error.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const emailValidation = z.string().email().parse(forgotEmail);
      const result = await resetPassword(emailValidation);

      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "Check your email", description: "We've sent you a reset link" });
        setShowForgotPassword(false);
        setForgotEmail("");
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({ title: "Invalid Email", description: error.errors[0].message, variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left brand panel (hidden on mobile) ──────────── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden flex-col justify-between bg-gradient-to-br from-primary via-primary/95 to-[hsl(145,55%,28%)] p-12">
        {/* Background pattern */}
        <AdirePattern variant="geometric" className="absolute inset-0 opacity-10" />
        {/* Blob decorations */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-1/2 right-8 w-32 h-32 rounded-full bg-accent/30 blur-2xl -translate-y-1/2" />

        {/* Logo + tagline */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl overflow-hidden ring-4 ring-white/25 shadow-xl">
              <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-bold text-white">SteerSolo</span>
          </div>

          <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4 text-balance">
            Turn your WhatsApp into a real business.
          </h2>
          <p className="text-white/70 text-lg mb-10 leading-relaxed max-w-md">
            Professional store, order tracking, and AI-powered marketing — all in one place.
          </p>

          {/* Feature highlights */}
          <ul className="space-y-4">
            {[
              { emoji: "🏪", text: "Store ready in 10 minutes" },
              { emoji: "📦", text: "Automated order management" },
              { emoji: "🤖", text: "AI ad copy generation" },
              { emoji: "💰", text: "Instant payouts to your bank" },
              { emoji: "✅", text: "15-day free trial — no card needed" },
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-white/90 animate-slide-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-xl shadow-inner shrink-0">
                  {item.emoji}
                </span>
                <span className="text-sm font-medium">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom trust pill */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 max-w-sm">
            <div className="flex -space-x-2">
              {["🛍️","👗","🍔","💄","👟"].map((e, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-sm">{e}</div>
              ))}
            </div>
            <div>
              <p className="text-white font-bold text-sm">2,000+ active vendors</p>
              <p className="text-white/60 text-xs">Growing every day</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/3">
        <AdirePattern variant="dots" className="absolute inset-0 opacity-4 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Mobile logo (shown only on small screens) */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-primary/20 shadow-md">
            <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">SteerSolo</span>
        </div>

        <div className="w-full max-w-md relative z-10 animate-bounce-in">
          {/* Accent stripe */}
          <div className="h-1 w-full rounded-t-3xl bg-gradient-to-r from-primary via-accent to-primary mb-0" />

          <div className="bg-card/95 backdrop-blur-xl rounded-b-3xl rounded-tr-3xl border border-border/60 shadow-2xl p-8">

          {authError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          {showEmailVerification ? (
            <div className="text-center space-y-6 py-4">
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Check Your Email</h3>
                <p className="text-muted-foreground">
                  We've sent a verification link to
                </p>
                <p className="font-medium text-foreground">{registeredEmail}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground space-y-2">
                <p>Click the link in the email to activate your account.</p>
                <p className="text-xs">Check your spam folder if you don't see it within a few minutes.</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEmailVerification(false);
                  setActiveTab("login");
                }}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          ) : showForgotPassword ? (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={() => setShowForgotPassword(false)} className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Button>
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Reset Password</h3>
                <p className="text-sm text-muted-foreground">Enter your email for a reset link</p>
              </div>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                  Send Reset Link
                </Button>
              </form>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* ================= LOGIN TAB ================= */}
              <TabsContent value="login" className="space-y-4">
                <GoogleSignInButton text="continue_with" />
                
                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                    or
                  </span>
                </div>
                
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
                          <div className="flex justify-between">
                            <FormLabel>Password</FormLabel>
                            <Button type="button" variant="link" className="px-0 text-xs" onClick={() => setShowForgotPassword(true)}>
                              Forgot password?
                            </Button>
                          </div>
                          <FormControl>
                            <PasswordInput field={field} placeholder="••••••••" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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
                      <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                        Remember me
                      </Label>
                    </div>
                    
                    <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent" disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Login
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              {/* ================= SIGNUP TAB ================= */}
              <TabsContent value="signup" className="space-y-4">
                <GoogleSignInButton text="signup_with" />
                
                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                    or
                  </span>
                </div>
                
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
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
                            <PasswordInput field={field} placeholder="Min 8 chars, 1 upper, 1 number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Role Selection - Visual Cards */}
                    <FormField
                      control={signupForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>I want to:</FormLabel>
                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-3">
                              <div className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${field.value === 'ENTREPRENEUR' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}`}>
                                <RadioGroupItem value="ENTREPRENEUR" id="entrepreneur" className="sr-only" />
                                <Label htmlFor="entrepreneur" className="cursor-pointer text-center">
                                  <Store className={`w-8 h-8 mx-auto mb-2 ${field.value === 'ENTREPRENEUR' ? 'text-primary' : 'text-muted-foreground'}`} />
                                  <span className="font-semibold block">Sell</span>
                                  <span className="text-xs text-muted-foreground">Create my shop</span>
                                </Label>
                              </div>
                              <div className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${field.value === 'CUSTOMER' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}`}>
                                <RadioGroupItem value="CUSTOMER" id="customer" className="sr-only" />
                                <Label htmlFor="customer" className="cursor-pointer text-center">
                                  <ShoppingBag className={`w-8 h-8 mx-auto mb-2 ${field.value === 'CUSTOMER' ? 'text-primary' : 'text-muted-foreground'}`} />
                                  <span className="font-semibold block">Shop</span>
                                  <span className="text-xs text-muted-foreground">Browse stores</span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent" disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Create Account
                    </Button>
                    
                    <p className="text-xs text-center text-muted-foreground">
                      By signing up, you agree to our Terms of Service
                    </p>
                    </form>
                </Form>
              </TabsContent>
            </Tabs>
          )}
          </div>{/* /form card */}
        </div>{/* /max-w-md */}
      </div>{/* /right panel */}
    </div>
  );
};

export default Auth;