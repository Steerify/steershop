import { useState, useEffect, type ChangeEvent, type FormEvent, type ReactNode } from "react";
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
import { Loader2, Mail, ArrowLeft, Store, ShoppingBag, Eye, EyeOff, Lock, Sparkles, CircleCheck, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import logoLight from "@/assets/steersolo-logo.jpg";
import logoDark from "@/assets/steersolo-logo-dark.jpg";
import { useTheme } from "next-themes";
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

type AuthPersona = "default" | "vendor" | "shopper";

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

const InputWithIcon = ({
  icon,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  icon: ReactNode;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
    <Input type={type} placeholder={placeholder} value={value} onChange={onChange} className="pl-10 min-h-11" />
  </div>
);

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

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "yopmail.com",
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "trashmail.com",
  "sharklasers.com",
]);

const isDisposableEmail = (email: string) => {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  return Boolean(domain && DISPOSABLE_EMAIL_DOMAINS.has(domain));
};

const Auth = () => {
  const { theme } = useTheme();
  const logo = theme === 'dark' ? logoDark : logoLight;
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { type } = useParams();
  const isVendorSignupPath = location.pathname === "/vendor-signup";
  const isShopperSignupPath = location.pathname === "/shopper-signup";
  const persona: AuthPersona = location.pathname.startsWith("/vendor")
    ? "vendor"
    : location.pathname.startsWith("/shopper")
      ? "shopper"
      : "default";
  const defaultTab = (isVendorSignupPath || isShopperSignupPath)
    ? "signup"
    : type === 'signup'
      ? 'signup'
      : (searchParams.get("tab") || "login");
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { signIn, signUp, resetPassword, user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [rememberMe, setRememberMeLocal] = useState(
    localStorage.getItem('rememberMe') === 'true'
  );
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [magicLinkEmail, setMagicLinkEmail] = useState("");

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

  useEffect(() => {
    if (persona === "vendor") {
      signupForm.setValue("role", "ENTREPRENEUR");
    } else if (persona === "shopper") {
      signupForm.setValue("role", "CUSTOMER");
    }
  }, [persona, signupForm]);

  const personaContent = persona === "vendor"
    ? {
      title: "Launch and grow your store.",
      subtitle: "Built for vendors: structured storefront, orders, payments, and marketing.",
      chips: [
        { emoji: "🏪", text: "Create your storefront fast" },
        { emoji: "📦", text: "Upload products and services" },
        { emoji: "💳", text: "Set up payment collection" },
        { emoji: "📈", text: "Track growth and performance" },
      ],
      ctaLabel: "Vendor Portal",
    }
    : persona === "shopper"
      ? {
        title: "Discover trusted shops in one place.",
        subtitle: "Built for shoppers: explore verified sellers, compare products, and buy with confidence.",
        chips: [
          { emoji: "🛍️", text: "Browse multiple categories" },
          { emoji: "✅", text: "Find verified sellers" },
          { emoji: "🔎", text: "Compare stores quickly" },
          { emoji: "⚡", text: "Shop faster and safer" },
        ],
        ctaLabel: "Shopper Portal",
      }
      : {
        title: "Turn your WhatsApp into a real business.",
        subtitle: "Professional store, order tracking, and AI-powered marketing — all in one place.",
        chips: [
          { emoji: "🏪", text: "Store ready in 10 minutes" },
          { emoji: "📦", text: "Automated order management" },
          { emoji: "🤖", text: "AI ad copy generation" },
          { emoji: "💰", text: "Instant payouts to your bank" },
          { emoji: "✅", text: "Free forever — no card needed" },
        ],
        ctaLabel: "SteerSolo",
      };

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
      const normalizedEmail = data.email.trim().toLowerCase();
      if (isDisposableEmail(normalizedEmail)) {
        setAuthError("Please use a real email provider (e.g. Gmail/Outlook). Disposable inboxes often block verification emails.");
        return;
      }

      const signUpData: SignUpData = {
        email: normalizedEmail,
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
        // Check if Supabase auto-logged them in (occurs if "Confirm Email" is disabled in settings)
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          toast({
            title: "Welcome to SteerSolo!",
            description: "Logging you in seamlessly...",
          });
          // The useEffect at the top of Auth.tsx will catch the session and navigate automatically.
        } else {
          // Fallback UI if "Confirm Email" is left enabled in Supabase
          setRegisteredEmail(normalizedEmail);
          setShowEmailVerification(true);
          
          toast({
            title: "Account created!",
            description: "Please check your email to verify your account.",
          });
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
      const normalizedEmail = data.email.trim().toLowerCase();
      const result = await signIn(normalizedEmail, data.password);

      if (result.error) {
        const normalizedError = result.error.toLowerCase();
        if (normalizedError.includes("invalid login credentials")) {
          setAuthError("Invalid email or password. If you just signed up, verify your email first, then try again.");
        } else {
          setAuthError(result.error);
        }
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

  const handleMagicLinkLogin = async () => {
    const email = (magicLinkEmail || loginForm.getValues("email") || "").trim();
    if (!email) {
      toast({ title: "Enter your email", description: "We need your email to send a secure login link.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });

      if (error) {
        setAuthError(error.message);
      } else {
        toast({
          title: "Magic link sent",
          description: "Check your email and tap the login link to continue.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const emailValidation = z.string().email().parse(forgotEmail.trim().toLowerCase());
      if (isDisposableEmail(emailValidation)) {
        toast({
          title: "Use a real inbox",
          description: "Disposable inboxes may not receive password reset emails.",
          variant: "destructive",
        });
        return;
      }
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
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden flex-col justify-between bg-gradient-to-br from-[hsl(215,65%,18%)] via-primary to-[hsl(145,55%,26%)] p-12">
        {/* Background pattern */}
        <AdirePattern variant="geometric" className="absolute inset-0 opacity-10" />
        {/* Blob decorations */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-1/2 right-8 w-32 h-32 rounded-full bg-accent/30 blur-2xl -translate-y-1/2" />

        {/* Logo + tagline */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-14 h-14 rounded-2xl overflow-hidden ring-4 ring-white/25 shadow-xl">
              <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-bold text-white">SteerSolo</span>
          </div>

          <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4 text-balance">
            {personaContent.title}
          </h2>
          <p className="text-white/70 text-lg mb-10 leading-relaxed max-w-md">
            {personaContent.subtitle}
          </p>

          {/* Feature highlights */}
          <ul className="space-y-4">
            {personaContent.chips.map((item, i) => (
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
              <p className="text-white font-bold text-sm">Join growing vendors</p>
              <p className="text-white/60 text-xs">{personaContent.ctaLabel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 md:p-10 relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/3">
        <AdirePattern variant="dots" className="absolute inset-0 opacity-4 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Mobile logo (shown only on small screens) */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className={`w-12 h-12 rounded-xl overflow-hidden ring-2 ring-primary/20 shadow-md ${theme === 'dark' ? '' : 'bg-white'}`}>
            <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">SteerSolo</span>
        </div>

        <div className="w-full max-w-md relative z-10 animate-bounce-in">
          <div className="mb-3 rounded-2xl border border-primary/15 bg-primary/5 p-3 sm:p-4">
            <p className="text-sm font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />Quick start</p>
            <ul className="mt-2 space-y-1.5 text-xs sm:text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><CircleCheck className="h-3.5 w-3.5 text-primary" />Use Google for the fastest sign-in.</li>
              <li className="flex items-center gap-2"><CircleCheck className="h-3.5 w-3.5 text-primary" />Use Magic Link if you don't want a password.</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-primary" />Your login is secured with encrypted authentication.</li>
            </ul>
          </div>
          {(persona === "vendor" || persona === "shopper") && (
            <div className="mb-3 grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={persona === "vendor" ? "default" : "outline"}
                className="h-9"
                onClick={() => navigate("/vendor")}
              >
                Vendor
              </Button>
              <Button
                type="button"
                variant={persona === "shopper" ? "default" : "outline"}
                className="h-9"
                onClick={() => navigate("/shopper")}
              >
                Shopper
              </Button>
            </div>
          )}
          {/* Accent stripe */}
          <div className="h-1 w-full rounded-t-3xl bg-gradient-to-r from-primary via-accent to-primary mb-0" />

          <div className="bg-card/95 backdrop-blur-xl rounded-b-3xl rounded-tr-3xl border border-border/60 shadow-2xl p-4 sm:p-6 md:p-8">

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
                <p className="text-xs">Some temporary/disposable inboxes may delay or block auth emails.</p>
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
                            <div className="relative">
                              <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                              <Input placeholder="you@example.com" {...field} className="pl-10 min-h-11" />
                            </div>
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
                            <FormLabel className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-muted-foreground" />Password</FormLabel>
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
                    
                    <Button type="submit" className="w-full min-h-11 bg-gradient-to-r from-primary to-accent" disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Login
                    </Button>
                  </form>
                </Form>

                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                    easier login
                  </span>
                </div>

                <div className="space-y-2">
                  <InputWithIcon
                    type="email"
                    value={magicLinkEmail}
                    onChange={(e) => setMagicLinkEmail(e.target.value)}
                    placeholder="Email for magic login link"
                    icon={<Mail className="h-4 w-4" />}
                  />
                  <Button type="button" variant="outline" className="w-full min-h-11" onClick={handleMagicLinkLogin} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                    Send me a magic link
                  </Button>
                </div>
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
                            <div className="relative">
                              <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                              <Input placeholder="you@example.com" {...field} className="pl-10 min-h-11" />
                            </div>
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
                          <FormLabel className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-muted-foreground" />Password</FormLabel>
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
                          {persona === "default" ? (
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="grid grid-cols-2 gap-3"
                              >
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
                          ) : (
                            <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm">
                              {persona === "vendor"
                                ? "Vendor flow selected: your account will be created as an entrepreneur."
                                : "Shopper flow selected: your account will be created as a customer."}
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full min-h-11 bg-gradient-to-r from-primary to-accent" disabled={isLoading}>
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
