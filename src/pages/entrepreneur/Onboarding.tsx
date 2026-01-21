import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import onboardingService, { OnboardingData } from "@/services/onboarding.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, SkipForward, Phone, Shield } from "lucide-react";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import logo from "@/assets/steersolo-logo.jpg";
import { cn } from "@/lib/utils";
import { PhoneVerification } from "@/components/auth/PhoneVerification";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/api"; // ADD THIS IMPORT

type OnboardingStep = "phone" | "questions" | "complete";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("phone");
  const [isCheckingPhone, setIsCheckingPhone] = useState(true);
  const [hasCheckedAccess, setHasCheckedAccess] = useState(false);
  
  // Guard: Redirect if not Entrepreneur or Customer
  useEffect(() => {
    const checkAccess = async () => {
      if (!user?.id) {
        console.log('No user ID available');
        return;
      }
      
      try {
        // Always check against the database directly
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        console.log('Database role for user:', profile?.role);
        
        // Allow both shop_owner and customer for onboarding survey
        if (profile?.role !== 'shop_owner' && profile?.role !== 'customer') {
          console.log('Access denied: User is not shop_owner or customer in database');
          toast({
            title: "Access Denied",
            description: "Onboarding is for registered users only.",
            variant: "destructive"
          });
          navigate("/");
        } else {
          console.log('Access granted:', profile?.role);
          setHasCheckedAccess(true);
        }
      } catch (error) {
        console.error("Error checking access:", error);
        toast({
          title: "Error",
          description: "Unable to verify your account.",
          variant: "destructive"
        });
        navigate("/");
      }
    };
    
    if (user && !hasCheckedAccess) {
      console.log('Checking access for user:', user.id);
      checkAccess();
    }
  }, [user, navigate, toast, hasCheckedAccess]);

  // Check if phone is already verified
  useEffect(() => {
    const checkPhoneVerification = async () => {
      if (user?.id && hasCheckedAccess) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('phone_verified, role')
            .eq('id', user.id)
            .single();
          
          // For customers, we might want to skip phone verification entirely and go to questions
          if (profile?.role === 'customer') {
            setCurrentStep("questions");
            return;
          }

          // Skip phone step if already verified
          if (profile?.phone_verified) {
            setCurrentStep("questions");
          }
        } catch (error) {
          console.error("Error checking phone verification:", error);
        } finally {
          setIsCheckingPhone(false);
        }
      } else {
        setIsCheckingPhone(false);
      }
    };
    
    if (user && hasCheckedAccess) {
      checkPhoneVerification();
    } else {
      setIsCheckingPhone(false);
    }
  }, [user, hasCheckedAccess]);

  const [formData, setFormData] = useState<OnboardingData>({
    businessType: "",
    customerSource: "",
    biggestStruggle: "",
    paymentMethod: "",
    perfectFeature: "",
  });

  const handleChange = (field: keyof OnboardingData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const answeredCount = [
    formData.businessType,
    formData.customerSource,
    formData.biggestStruggle,
    formData.paymentMethod,
  ].filter(Boolean).length;

  const isFormValid = () => answeredCount === 4;

  const handleSkipPhone = () => {
    toast({
      title: "Skipped for now",
      description: "You can verify your phone anytime from settings.",
    });
    setCurrentStep("questions");
  };

  const handlePhoneVerified = () => {
    setCurrentStep("questions");
  };

  const handleSkipQuestions = async () => {
    toast({
      title: "Skipped for now",
      description: "You can complete this anytime from settings.",
    });
    
    // Redirect based on actual database role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user?.id || '')
      .single();
      
    if (profile?.role === 'shop_owner') {
      navigate("/dashboard");
    } else {
      navigate("/customer_dashboard");
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsLoading(true);
    try {
      // Store to Supabase for analytics
      if (user?.id) {
        await onboardingService.storeOnboardingResponse(user.id, formData);
      }

      // Also submit to Render backend
      await onboardingService.submitOnboarding(formData);
      
      toast({
        title: "Setup Complete!",
        description: "Welcome to SteerSolo.",
      });

      // Redirect based on actual database role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id || '')
        .single();
        
      if (profile?.role === 'shop_owner') {
        navigate("/dashboard");
      } else {
        navigate("/customer_dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save onboarding details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show anything until access is checked
  if (!hasCheckedAccess && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Verifying access...</span>
      </div>
    );
  }

  // Show loading while checking phone status
  if (isCheckingPhone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4 relative overflow-hidden">
      <AdirePattern variant="geometric" className="absolute inset-0 opacity-5" />
      
      <Card className="w-full max-w-2xl relative z-10 border-primary/10 shadow-2xl backdrop-blur-sm bg-card/95">
        <CardHeader className="text-center border-b border-border/50 pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg ring-4 ring-primary/20">
              <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
            </div>
          </div>
          <CardTitle className="text-2xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {currentStep === "phone" ? "Secure Your Account" : "SteerSolo Quick Setup"}
          </CardTitle>
          <CardDescription className="text-lg">
            {currentStep === "phone" 
              ? "Verify your phone for order notifications & security"
              : "Help us tailor your store (2 mins)"}
          </CardDescription>

          {/* Progress Indicator */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center gap-2">
              {/* Phone verification step */}
              <div 
                className={cn(
                  "h-2 rounded-full transition-all duration-300 flex items-center justify-center",
                  currentStep !== "phone" ? "bg-primary w-10" : "bg-primary/50 w-10 animate-pulse"
                )}
              />
              {/* Questions steps */}
              {[1, 2, 3, 4].map((stepNum) => (
                <div 
                  key={stepNum}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    currentStep === "questions" && answeredCount >= stepNum 
                      ? "bg-primary w-10" 
                      : "bg-muted w-8"
                  )}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              {currentStep === "phone" ? (
                <>
                  <Phone className="w-4 h-4" />
                  Step 1: Verify your phone number
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 text-green-500" />
                  Step 2: {answeredCount} of 4 questions answered
                </>
              )}
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {currentStep === "phone" ? (
            <div className="space-y-6">
              <div className="text-center space-y-3 mb-6">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Receive order notifications via SMS</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Recover your account securely</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Build trust with verified seller badge</span>
                </div>
              </div>
              
              <PhoneVerification 
                onVerified={handlePhoneVerified}
                onSkip={handleSkipPhone}
              />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Question 1 */}
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Label className="text-base font-semibold">1. What best describes your business?</Label>
                <RadioGroup value={formData.businessType} onValueChange={(val) => handleChange("businessType", val)} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {["Fashion / Clothing", "Food / Bakery", "Beauty / Skincare", "Gadgets / Accessories", "Digital services", "Other"].map((opt) => (
                    <div key={opt}>
                      <RadioGroupItem value={opt} id={`q1-${opt}`} className="peer sr-only" />
                      <Label
                        htmlFor={`q1-${opt}`}
                        className="flex items-center justify-between p-4 rounded-lg border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                      >
                        {opt}
                        {formData.businessType === opt && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Question 2 */}
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                <Label className="text-base font-semibold">2. Where do most of your customers come from right now?</Label>
                <RadioGroup value={formData.customerSource} onValueChange={(val) => handleChange("customerSource", val)} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {["WhatsApp", "Instagram", "TikTok", "Facebook", "Offline / Referrals"].map((opt) => (
                    <div key={opt}>
                      <RadioGroupItem value={opt} id={`q2-${opt}`} className="peer sr-only" />
                      <Label
                         htmlFor={`q2-${opt}`}
                         className="flex items-center justify-between p-3 rounded-lg border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                      >
                        {opt}
                        {formData.customerSource === opt && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Question 3 */}
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                <Label className="text-base font-semibold">3. What's your biggest struggle with selling online?</Label>
                <RadioGroup value={formData.biggestStruggle} onValueChange={(val) => handleChange("biggestStruggle", val)} className="space-y-2">
                  {["Repeating prices & details", "Losing orders in chats", "Customers not trusting payment", "Too much back-and-forth", "Organizing products & orders"].map((opt) => (
                    <div key={opt} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt} id={`q3-${opt}`} />
                      <Label htmlFor={`q3-${opt}`} className="font-normal cursor-pointer">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

               {/* Question 4 */}
               <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                <Label className="text-base font-semibold">4. How do you currently collect payments?</Label>
                <RadioGroup value={formData.paymentMethod} onValueChange={(val) => handleChange("paymentMethod", val)} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {["Bank transfer only", "Paystack", "Cash on delivery", "I want all options"].map((opt) => (
                    <div key={opt}>
                      <RadioGroupItem value={opt} id={`q4-${opt}`} className="peer sr-only" />
                      <Label
                         htmlFor={`q4-${opt}`}
                         className="flex items-center justify-between p-3 rounded-lg border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                      >
                        {opt}
                        {formData.paymentMethod === opt && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Question 5 */}
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
                <Label className="text-base font-semibold">5. What would make SteerSolo perfect for your business? <span className="text-muted-foreground font-normal text-sm">(Optional)</span></Label>
                <Textarea 
                  placeholder="Tell us what you'd love to see" 
                  value={formData.perfectFeature}
                  onChange={(e) => handleChange("perfectFeature", e.target.value)}
                  className="resize-none min-h-[100px]"
                />
              </div>

              <div className="flex items-center justify-between gap-4 mt-4">
                <Button 
                  variant="ghost" 
                  onClick={handleSkipQuestions}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip for now
                </Button>

                <Button 
                  onClick={handleSubmit} 
                  className="flex-1 bg-gradient-to-r from-primary to-accent py-6 text-lg"
                  disabled={!isFormValid() || isLoading}
                >
                  {isLoading ? (
                     <>
                       <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                       Saving preferences...
                     </>
                  ) : "Complete Setup"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;