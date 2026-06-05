import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  type FocusEvent,
} from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
  useLocation,
  useParams,
} from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, SignUpData } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Mail,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
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
import { UserRole } from "@/types/api";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearSessionExpired, setReturnUrl } from "@/store/slices/uiSlice";
import { resetSession } from "@/store/slices/activitySlice";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { cn } from "@/lib/utils";

type AuthPersona = "default" | "merchant" | "shopper";

type AuthTextField = {
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement> | string) => void;
  onBlur: () => void;
  ref: (instance: HTMLInputElement | null) => void;
  disabled?: boolean;
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const handleFieldChange = (
  field: AuthTextField,
  event: ChangeEvent<HTMLInputElement>,
) => {
  field.onChange(event);
};

const useSyncedAuthField = (field: AuthTextField) => {
  const [inputValue, setInputValue] = useState(field.value ?? "");
  const inputValueRef = useRef(inputValue);

  useEffect(() => {
    const nextValue = field.value ?? "";

    if (nextValue !== inputValueRef.current) {
      inputValueRef.current = nextValue;
      setInputValue(nextValue);
    }
  }, [field.value]);

  const updateValue = useCallback(
    (nextValue: string) => {
      inputValueRef.current = nextValue;
      setInputValue(nextValue);
      field.onChange(nextValue);
    },
    [field],
  );

  const syncAutofillValue = useCallback(
    (nextValue: string) => {
      if (nextValue && nextValue !== inputValueRef.current) {
        updateValue(nextValue);
      }
    },
    [updateValue],
  );

  const scheduleAutofillSync = useCallback(
    (input: HTMLInputElement | null) => {
      if (!input) return;

      [0, 100, 500].forEach((delay) => {
        window.setTimeout(() => syncAutofillValue(input.value), delay);
      });
    },
    [syncAutofillValue],
  );

  return { inputValue, updateValue, scheduleAutofillSync };
};

// Password input component with eye toggle (Redesigned)
const PasswordInput = ({
  field,
  placeholder,
  autoComplete,
}: {
  field: AuthTextField;
  placeholder?: string;
  autoComplete?: string;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { inputValue, updateValue, scheduleAutofillSync } =
    useSyncedAuthField(field);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        name={field.name}
        value={inputValue}
        onBlur={field.onBlur}
        disabled={field.disabled}
        placeholder={placeholder}
        ref={(input) => {
          field.ref(input);
          scheduleAutofillSync(input);
        }}
        autoComplete={autoComplete}
        onChange={(event) => updateValue(event.currentTarget.value)}
        onFocus={(event: FocusEvent<HTMLInputElement>) => {
          scheduleAutofillSync(event.currentTarget);
        }}
        className="pr-10 min-h-[52px] rounded-2xl bg-background border-border shadow-sm text-base text-foreground caret-foreground"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5" />
        ) : (
          <Eye className="h-5 w-5" />
        )}
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
    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
      {icon}
    </span>
    <Input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="pl-12 min-h-[52px] rounded-2xl bg-background border-border shadow-sm text-base"
    />
  </div>
);

const AuthIdentifierInput = ({
  field,
  autoComplete,
}: {
  field: AuthTextField;
  autoComplete: string;
}) => {
  const { inputValue, updateValue, scheduleAutofillSync } =
    useSyncedAuthField(field);

  return (
    <Input
      type="text"
      name={field.name}
      value={inputValue}
      onBlur={field.onBlur}
      disabled={field.disabled}
      inputMode="email"
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      autoComplete={autoComplete}
      enterKeyHint="next"
      placeholder="email@example.com or 08012345678"
      ref={(input) => {
        field.ref(input);
        scheduleAutofillSync(input);
      }}
      onChange={(event) => updateValue(event.currentTarget.value)}
      onFocus={(event: FocusEvent<HTMLInputElement>) => {
        scheduleAutofillSync(event.currentTarget);
      }}
      className="min-h-[52px] rounded-2xl bg-background border-border shadow-sm text-base text-foreground caret-foreground pl-4"
    />
  );
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NIGERIAN_PHONE_REGEX = /^(?:0\d{10}|234\d{10})$/;

const getPhoneDigits = (value: string) => value.replace(/\D/g, "");

const isValidEmail = (value: string) => EMAIL_REGEX.test(value.trim());
const isValidPhone = (value: string) =>
  NIGERIAN_PHONE_REGEX.test(getPhoneDigits(value));
const normalizeIdentifier = (value: string) => {
  const normalized = value.trim();
  if (isValidPhone(normalized)) {
    const digits = getPhoneDigits(normalized);
    if (digits.startsWith("0")) return `+234${digits.slice(1)}`;
    if (digits.startsWith("234")) return `+${digits}`;
    return `+${digits}`;
  }
  return normalized.toLowerCase();
};

const identifierSchema = z
  .string()
  .trim()
  .min(1, "Email or phone is required")
  .refine((value) => isValidEmail(value) || isValidPhone(value), {
    message: "Enter a valid email or Nigerian phone number",
  });

const signupSchema = z.object({
  identifier: identifierSchema,
  password: z.string().min(8, "At least 8 characters"),
  role: z.enum(["ENTREPRENEUR", "CUSTOMER"]),
});

const loginSchema = z.object({
  identifier: identifierSchema,
  password: z.string().min(1, "Password is required"),
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
  const logo = theme === "dark" ? logoDark : logoLight;
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { type } = useParams();
  
  const isVendorSignupPath = location.pathname === "/merchant-signup";
  const isShopperSignupPath = location.pathname === "/shopper-signup";
  
  const persona: AuthPersona = location.pathname.startsWith("/merchant")
    ? "merchant"
    : location.pathname.startsWith("/shopper")
      ? "shopper"
      : "default";
      
  const defaultTab =
    isVendorSignupPath || isShopperSignupPath
      ? "signup"
      : type === "signup"
        ? "signup"
        : searchParams.get("tab") || "login";
        
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  
  const [activeTab, setActiveTab] = useState(defaultTab);
  const {
    signIn,
    signUp,
    resetPassword,
    user,
    isLoading: authLoading,
  } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [magicLinkEmail, setMagicLinkEmail] = useState("");

  const returnUrl = useAppSelector((state) => state.ui.returnUrl);
  const lastRoute = useAppSelector((state) => state.ui.lastRoute);
  const locationState = location.state as {
    from?: { pathname: string };
  } | null;

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      identifier: "",
      password: "",
      // Default to ENTREPRENEUR if not specified, but this isn't shown on the UI anymore
      role: persona === "shopper" ? "CUSTOMER" : "ENTREPRENEUR",
    },
  });

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  useEffect(() => {
    if (user && !authLoading) {
      const checkRoleSelection = async () => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("needs_role_selection, role")
          .eq("id", user.id)
          .single();

        // Admins skip onboarding/role-selection entirely
        const isAdmin = (user.role as string) === "ADMIN" || (profile?.role as string) === "admin" || (profile?.role as string) === "ADMIN";

        if (profile?.needs_role_selection && !isAdmin) {
          navigate("/select-role", { replace: true });
          return;
        }

        const defaultPath = getDashboardPath(user.role);
        const redirectPath =
          returnUrl ||
          locationState?.from?.pathname ||
          lastRoute ||
          defaultPath;

        dispatch(clearSessionExpired());
        dispatch(setReturnUrl(null));
        dispatch(resetSession());

        if (redirectPath !== defaultPath) {
          navigate(defaultPath, { replace: true });
          navigate(redirectPath, { state: { restoredFromLogin: true } });
        } else {
          navigate(defaultPath, { replace: true });
        }
      };

      checkRoleSelection();
    }
  }, [
    user,
    authLoading,
    navigate,
    returnUrl,
    lastRoute,
    locationState,
    dispatch,
  ]);

  const getDashboardPath = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "/admin";
      case "ENTREPRENEUR":
        return "/dashboard";
      case "CUSTOMER":
        return "/customer_dashboard";
      default:
        return "/";
    }
  };

  const onSignupSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const normalizedIdentifier = normalizeIdentifier(data.identifier);
      const isEmail = isValidEmail(normalizedIdentifier);

      if (isEmail && isDisposableEmail(normalizedIdentifier)) {
        setAuthError(
          "Please use a real email provider (e.g. Gmail/Outlook). Disposable inboxes often block verification emails."
        );
        return;
      }

      const signUpData: SignUpData = {
        identifier: normalizedIdentifier,
        password: data.password,
        firstName: "",
        lastName: "",
        phone: isEmail ? "" : normalizedIdentifier,
        role: data.role,
      };

      const result = await signUp(signUpData);

      if (result.error) {
        setAuthError(result.error);
      } else {
        const { data: sessionData } = await supabase.auth.getSession();

        if (sessionData.session) {
          toast({
            title: "Welcome to SteerSolo!",
            description: "Logging you in seamlessly...",
          });
        } else {
          setRegisteredEmail(normalizedIdentifier);
          setShowEmailVerification(true);

          toast({
            title: "Account created!",
            description: isEmail
              ? "Please check your email to verify your account."
              : "Please check your phone for a verification code.",
          });
        }
      }
    } catch (error: unknown) {
      setAuthError(getErrorMessage(error, "Please try again"));
    } finally {
      setIsLoading(false);
    }
  };

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const normalizedIdentifier = normalizeIdentifier(data.identifier);
      const result = await signIn(normalizedIdentifier, data.password);

      if (result.error) {
        const normalizedError = result.error.toLowerCase();
        if (normalizedError.includes("invalid login credentials")) {
          setAuthError(
            "Invalid credentials. If you just signed up, verify your account first, then try again."
          );
        } else {
          setAuthError(result.error);
        }
      } else {
        toast({
          title: "Welcome back!",
          description: "Successfully logged in",
        });
      }
    } catch (error: unknown) {
      setAuthError(getErrorMessage(error, "Invalid credentials"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkLogin = async () => {
    const email = (magicLinkEmail || loginForm.getValues("identifier") || "")
      .trim()
      .toLowerCase();
    if (!email || !isValidEmail(email)) {
      toast({
        title: "Enter a valid email",
        description: "We need a verified email to send a secure login link.",
        variant: "destructive",
      });
      return;
    }

    if (isDisposableEmail(email)) {
      toast({
        title: "Use a real inbox",
        description: "Disposable email services may block magic links.",
        variant: "destructive",
      });
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
      const normalizedEmail = forgotEmail.trim().toLowerCase();
      const emailValidation = z.string().email().parse(normalizedEmail);
      if (!isValidEmail(emailValidation)) {
        throw new Error("Please enter a valid email address.");
      }
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
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Check your email",
          description: "We've sent you a reset link",
        });
        setShowForgotPassword(false);
        setForgotEmail("");
      }
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid Email",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Invalid Email",
          description: getErrorMessage(error, "Please enter a valid email address."),
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 font-sans px-4 sm:px-6 py-6 sm:py-10 relative overflow-hidden">
      {/* Background pattern */}
      <AdirePattern variant="dots" className="absolute inset-0 opacity-[0.06] pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Two-column layout: brand panel (desktop only) + form card */}
      <div className="w-full max-w-6xl relative z-10 grid md:grid-cols-[1fr_500px] lg:grid-cols-[1.1fr_500px] gap-8 lg:gap-16 items-center">
        {/* Brand Panel — desktop only */}
        <aside className="hidden md:flex flex-col gap-8 px-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> Back Home
          </Link>
          <div>
            <p className="text-[11px] font-bold tracking-[0.25em] text-primary uppercase mb-4">
              SteerSolo · Nigeria
            </p>
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.05] mb-5">
              Sell with the<br />trust your<br />buyers expect.
            </h2>
            <p className="text-[15px] text-muted-foreground max-w-md leading-relaxed">
              Join verified Nigerian merchants running real businesses on WhatsApp, Instagram, and TikTok — with escrow-protected payments and SafeBeauty verification built in.
            </p>
          </div>
          <ul className="space-y-3 text-sm">
            {[
              { t: "SafeBeauty verified merchants", d: "NAFDAC-checked beauty products only" },
              { t: "Escrow-protected payments", d: "Buyers pay, funds held until delivery" },
              { t: "NGN-native, Nigeria-first", d: "Built for Naira and local logistics" },
            ].map((b) => (
              <li key={b.t} className="flex items-start gap-3">
                <span className="mt-1.5 inline-block w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <div>
                  <div className="font-semibold text-foreground">{b.t}</div>
                  <div className="text-muted-foreground text-[13px]">{b.d}</div>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground italic">
            "SteerSolo made my business look professional from day one."
          </p>
        </aside>

        <div className="w-full max-w-[500px] mx-auto md:mx-0">
        {/* Top Nav: Back Home — mobile only (desktop has it in the brand panel) */}
        <div className="flex md:hidden items-center justify-between mb-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back Home
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-card/95 backdrop-blur-xl rounded-3xl border border-border/60 shadow-2xl p-6 sm:p-8 md:p-10">
        
        {showEmailVerification ? (
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">Check Your Email</h3>
              <p className="text-muted-foreground">
                We've sent a verification link to
              </p>
              <p className="font-semibold text-foreground text-lg">
                {registeredEmail}
              </p>
            </div>
            <div className="bg-muted/50 rounded-2xl p-6 text-sm text-muted-foreground space-y-3">
              <p>Click the link in the email to activate your account.</p>
              <p className="text-[13px]">
                Check your spam folder if you don't see it within a few minutes.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setShowEmailVerification(false);
                setActiveTab("login");
              }}
              className="w-full min-h-[52px] rounded-full text-base font-semibold"
            >
              Back to Login
            </Button>
          </div>
        ) : showForgotPassword ? (
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={() => setShowForgotPassword(false)}
              className="mb-2 px-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Button>
            <div className="mb-6">
              <h3 className="text-3xl font-bold tracking-tight text-foreground mb-2">Reset Password</h3>
              <p className="text-[15px] text-muted-foreground">
                Enter your email for a reset link
              </p>
            </div>
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground ml-1">Email Address</Label>
                <Input
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="name@company.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  className="min-h-[52px] rounded-2xl bg-background border-border shadow-sm text-base text-foreground caret-foreground pl-4"
                />
              </div>
              <Button
                type="submit"
                className="w-full min-h-[52px] rounded-full bg-primary text-primary-foreground font-semibold text-base mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-5 w-5" />
                )}
                Send Reset Link
              </Button>
            </form>
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="mb-8 sm:mb-10">
              <div className="flex items-center gap-2 mb-3">
                <img
                  src={logo}
                  alt="SteerSolo"
                  className="w-5 h-5 rounded-[4px] object-cover ring-1 ring-border shadow-sm"
                />
                <span className="text-[11px] font-bold tracking-[0.25em] text-muted-foreground uppercase">
                  Steersolo
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 sm:gap-4">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.05] whitespace-pre-line">
                  {activeTab === "login" ? "Welcome\nback" : "Get\nstarted"}
                </h1>

                {/* Pill Tab Toggle */}
                <div className="flex items-center p-1 bg-muted/60 rounded-full border border-border/40 shadow-sm self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className={cn(
                      "px-5 py-2 rounded-full text-[14px] font-semibold transition-all duration-300",
                      activeTab === "login"
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("signup")}
                    className={cn(
                      "px-5 py-2 rounded-full text-[14px] font-semibold transition-all duration-300",
                      activeTab === "signup"
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Sign up
                  </button>
                </div>
              </div>
            </div>

            {authError && (
              <Alert variant="destructive" className="mb-6 rounded-2xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            {/* Form Section */}
            <div className="space-y-6">
              {activeTab === "login" ? (
                <Form key="login-form" {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                    className="space-y-5"
                  >
                    <FormField
                      control={loginForm.control}
                      name="identifier"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-sm font-semibold text-foreground ml-1">
                            Email Address or Phone
                          </FormLabel>
                          <FormControl>
                            <AuthIdentifierInput
                              field={field}
                              autoComplete="username"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <div className="flex justify-between items-center ml-1">
                            <FormLabel className="text-sm font-semibold text-foreground">
                              Password
                            </FormLabel>
                            <button
                              type="button"
                              onClick={() => setShowForgotPassword(true)}
                              className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                              Forgot password?
                            </button>
                          </div>
                          <FormControl>
                            <PasswordInput
                              field={field}
                              placeholder="••••••••"
                              autoComplete="current-password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full min-h-[52px] rounded-full bg-foreground hover:bg-foreground/90 text-background font-semibold text-base mt-4 transition-all"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : null}
                      Sign in
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form key="signup-form" {...signupForm}>
                  <form
                    onSubmit={signupForm.handleSubmit(onSignupSubmit)}
                    className="space-y-5"
                  >
                    <FormField
                      control={signupForm.control}
                      name="identifier"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-sm font-semibold text-foreground ml-1">
                            Email Address or Phone
                          </FormLabel>
                          <FormControl>
                            <AuthIdentifierInput
                              field={field}
                              autoComplete="username"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-sm font-semibold text-foreground ml-1">
                            Password
                          </FormLabel>
                          <FormControl>
                            <PasswordInput
                              field={field}
                              placeholder="••••••••"
                              autoComplete="new-password"
                            />
                          </FormControl>
                          <p className="text-[13px] text-muted-foreground ml-1 mt-1.5">
                            At least 8 characters
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full min-h-[52px] rounded-full bg-foreground hover:bg-foreground/90 text-background font-semibold text-base mt-4 transition-all"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : null}
                      Create account
                    </Button>
                  </form>
                </Form>
              )}

              {/* OR Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/60"></div>
                </div>
                <div className="relative flex justify-center text-[11px] font-bold tracking-widest uppercase">
                  <span className="bg-background px-4 text-muted-foreground">Or</span>
                </div>
              </div>

              {/* Alternative Auth Methods */}
              <div className="space-y-4">
                <div className="w-full">
                  <GoogleSignInButton 
                    text={activeTab === "login" ? "continue_with" : "signup_with"}
                  />
                </div>

                {activeTab === "login" && (
                  <div className="space-y-3 pt-2">
                    <p className="text-center text-[13px] font-medium text-muted-foreground">
                      Prefer a magic link?
                    </p>
                    <div className="relative flex items-center">
                      <Input
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        value={magicLinkEmail}
                        onChange={(e) => setMagicLinkEmail(e.target.value)}
                        placeholder="Enter email for magic link"
                        className="min-h-[52px] rounded-2xl bg-background border-border shadow-sm text-[14px] pl-4 pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 rounded-xl text-muted-foreground hover:text-foreground h-9 w-9"
                        onClick={handleMagicLinkLogin}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer text */}
              <p className="text-center text-[13px] text-muted-foreground pt-6 pb-4">
                By continuing, you agree to our{" "}
                <Link to="/terms" className="underline hover:text-foreground transition-colors">terms</Link>{" "}
                and{" "}
                <Link to="/privacy" className="underline hover:text-foreground transition-colors">privacy policy</Link>.
              </p>
            </div>
          </>
        )}
        </div>
        {/* /Form Card */}
      </div>
      {/* /Card Container */}
    </div>
  );
};

export default Auth;
