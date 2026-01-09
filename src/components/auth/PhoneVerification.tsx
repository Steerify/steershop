import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Phone, CheckCircle, ArrowRight, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface PhoneVerificationProps {
  onVerified?: () => void;
  onSkip?: () => void;
}

export const PhoneVerification = ({ onVerified, onSkip }: PhoneVerificationProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<"phone" | "otp" | "verified">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const formatPhoneInput = (value: string): string => {
    // Remove non-digits except +
    const cleaned = value.replace(/[^\d+]/g, '');
    
    // Format for display
    if (cleaned.startsWith('+234')) {
      return cleaned;
    } else if (cleaned.startsWith('234')) {
      return '+' + cleaned;
    } else if (cleaned.startsWith('0')) {
      return '+234' + cleaned.slice(1);
    }
    return cleaned;
  };

  const handleSendOTP = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to verify your phone",
        variant: "destructive",
      });
      return;
    }

    const formattedPhone = formatPhoneInput(phone);
    if (!/^\+234[0-9]{10}$/.test(formattedPhone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Nigerian phone number (e.g., 08012345678)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-phone-otp", {
        body: { phone: formattedPhone, userId: user.id },
      });

      if (error) throw error;

      if (data.success) {
        // Store dev OTP for testing (remove in production)
        if (data.devOtp) {
          setDevOtp(data.devOtp);
        }
        
        setStep("otp");
        setCooldown(60);
        toast({
          title: "Code Sent!",
          description: "Check your phone for the 6-digit verification code",
        });
      } else {
        throw new Error(data.error || "Failed to send code");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!user) return;

    if (otp.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the complete 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("verify-phone-otp", {
        body: { otp, userId: user.id },
      });

      if (error) throw error;

      if (data.success) {
        setStep("verified");
        toast({
          title: "Phone Verified!",
          description: "Your phone number has been verified successfully",
        });
        
        setTimeout(() => {
          onVerified?.();
        }, 1500);
      } else {
        throw new Error(data.error || "Verification failed");
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (cooldown > 0) return;
    await handleSendOTP();
  };

  if (step === "verified") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-semibold">Phone Verified!</h3>
          <p className="text-muted-foreground">Your phone number has been verified successfully.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-14 h-14 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-2">
          <Phone className="w-7 h-7 text-primary" />
        </div>
        <CardTitle className="text-xl">
          {step === "phone" ? "Verify Your Phone" : "Enter Verification Code"}
        </CardTitle>
        <CardDescription>
          {step === "phone" 
            ? "Add your Nigerian phone number for account security"
            : "We sent a 6-digit code to your phone"
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {step === "phone" ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  🇳🇬
                </span>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="08012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                  maxLength={15}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your Nigerian phone number
              </p>
            </div>

            <Button 
              onClick={handleSendOTP} 
              className="w-full" 
              disabled={isLoading || !phone}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Code
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            {onSkip && (
              <Button 
                variant="ghost" 
                onClick={onSkip} 
                className="w-full text-muted-foreground"
              >
                Skip for now
              </Button>
            )}
          </>
        ) : (
          <>
            {/* Dev mode OTP display */}
            {devOtp && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-center">
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  [DEV MODE] Your OTP: <span className="font-mono text-lg">{devOtp}</span>
                </p>
              </div>
            )}

            <div className="flex flex-col items-center space-y-4">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
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

            <Button 
              onClick={handleVerifyOTP} 
              className="w-full" 
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify
                </>
              )}
            </Button>

            <div className="flex items-center justify-between text-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("phone")}
                className="text-muted-foreground"
              >
                Change number
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResendOTP}
                disabled={cooldown > 0 || isLoading}
                className="text-muted-foreground"
              >
                {cooldown > 0 ? (
                  `Resend in ${cooldown}s`
                ) : (
                  <>
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Resend code
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
