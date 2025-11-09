import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Store, Loader2, Mail } from "lucide-react";
import { z } from "zod";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  fullName: z.string().trim().min(2, "Full name is required").max(100, "Full name must be less than 100 characters"),
  role: z.enum(["shop_owner", "customer"])
});

const emailSchema = z.object({
  email: z.string().email("Invalid email address")
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits")
});

const Auth = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "login";
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // OTP verification state
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isSignupFlow, setIsSignupFlow] = useState(false);
  const [pendingSignupData, setPendingSignupData] = useState<{
    fullName: string;
    role: "shop_owner" | "customer";
  } | null>(null);
  
  const [signupData, setSignupData] = useState({
    email: "",
    fullName: "",
    role: "shop_owner" as "shop_owner" | "customer"
  });

  const [loginData, setLoginData] = useState({
    email: ""
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validated = signupSchema.parse(signupData);
      
      // Send OTP to email
      const { error } = await supabase.auth.signInWithOtp({
        email: validated.email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: validated.fullName,
            role: validated.role
          }
        }
      });

      if (error) throw error;

      // Store signup data for later use after OTP verification
      setPendingSignupData({
        fullName: validated.fullName,
        role: validated.role
      });
      setOtpEmail(validated.email);
      setIsSignupFlow(true);
      setShowOtpVerification(true);

      toast({
        title: "Verification code sent",
        description: "Please check your email for the 6-digit code",
      });
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
      const validated = emailSchema.parse(loginData);
      
      // Send OTP to email
      const { error } = await supabase.auth.signInWithOtp({
        email: validated.email,
        options: {
          shouldCreateUser: false
        }
      });

      if (error) throw error;

      setOtpEmail(validated.email);
      setIsSignupFlow(false);
      setShowOtpVerification(true);

      toast({
        title: "Verification code sent",
        description: "Please check your email for the 6-digit code",
      });
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
          description: error.message || "Invalid email or user not found",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsLoading(true);

    try {
      otpSchema.parse({ otp });

      const { data, error } = await supabase.auth.verifyOtp({
        email: otpEmail,
        token: otp,
        type: 'email'
      });

      if (error) throw error;

      if (!data.user) throw new Error("Verification failed");

      // Fetch user role from user_roles table
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .single();

      toast({
        title: isSignupFlow ? "Account created!" : "Welcome back!",
        description: isSignupFlow ? "Welcome to SteerSolo" : "Successfully logged in",
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
          title: "Verification failed",
          description: error.message || "Invalid or expired code",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    if (showOtpVerification && otp.length === 6 && !isLoading) {
      handleVerifyOtp();
    }
  }, [otp, showOtpVerification]);

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: otpEmail,
        options: isSignupFlow && pendingSignupData ? {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: pendingSignupData.fullName,
            role: pendingSignupData.role
          }
        } : {
          shouldCreateUser: false
        }
      });

      if (error) throw error;

      toast({
        title: "Code resent",
        description: "Please check your email for a new verification code",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend code",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show OTP verification screen
  if (showOtpVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
                <Mail className="w-10 h-10 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
            <CardDescription>
              We sent a 6-digit code to<br />
              <span className="font-semibold text-foreground">{otpEmail}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-center block">Enter verification code</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    autoFocus
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Code will be verified automatically when complete
                </p>
              </div>

              <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading || otp.length !== 6}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </Button>

              <div className="text-center space-y-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-sm"
                >
                  Resend code
                </Button>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    setShowOtpVerification(false);
                    setOtp("");
                    setOtpEmail("");
                    setPendingSignupData(null);
                  }}
                  className="text-sm"
                >
                  Back to {isSignupFlow ? "signup" : "login"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
              <Store className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Welcome to SteerSolo</CardTitle>
          <CardDescription>Your business journey starts here</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
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
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  We'll send a verification code to your email
                </p>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending code...
                    </>
                  ) : (
                    "Continue with Email"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    placeholder="John Doe"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                    required
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
                  />
                </div>
                <div className="space-y-2">
                  <Label>I want to:</Label>
                  <RadioGroup
                    value={signupData.role}
                    onValueChange={(value: "shop_owner" | "customer") => 
                      setSignupData({ ...signupData, role: value })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="shop_owner" id="shop_owner" />
                      <Label htmlFor="shop_owner" className="font-normal">
                        Create and manage my own shop
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="customer" id="customer" />
                      <Label htmlFor="customer" className="font-normal">
                        Browse and shop from stores
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <p className="text-sm text-muted-foreground">
                  We'll send a verification code to your email
                </p>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending code...
                    </>
                  ) : (
                    "Continue with Email"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
