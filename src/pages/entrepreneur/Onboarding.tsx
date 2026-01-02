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
import { Loader2, CheckCircle2 } from "lucide-react";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import logo from "@/assets/steersolo-logo.jpg";
import { cn } from "@/lib/utils";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, setAuth } = useAuth(); // Assuming setAuth can update user state
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // Optional: if we want multi-step animation, but keeping single page for simplicity as per request "single-page form" option
  
  // Guard: Redirect if not Entrepreneur
  useEffect(() => {
    if (user && user.role !== "ENTREPRENEUR") {
      toast({
        title: "Access Denied",
        description: "Onboarding is for entrepreneurs only.",
        variant: "destructive"
      });
      navigate("/customer_dashboard");
    }
  }, [user, navigate, toast]);

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

  const isFormValid = () => {
    return (
      formData.businessType &&
      formData.customerSource &&
      formData.biggestStruggle &&
      formData.paymentMethod
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsLoading(true);
    try {
      await onboardingService.submitOnboarding(formData);
      
      toast({
        title: "Setup Compelte!",
        description: "Your store dashboard is ready.",
      });

      // Update local user state to reflect onboarding completion if possible, 
      // or just navigate and let next dashboard load fetch fresh user data if needed.
      // Ideally, we update the context. Here we assume backend updates the user record.
      if (user && setAuth) {
           // Refetch or manually update local user object to prevent redirect loop if context relies on it
           // For now, prompt navigation. The AuthContext might need a refresh mechanism or we rely on page reload/navigation.
           const updatedUser = { ...user, onboardingCompleted: true };
           // We might need a way to update just the user in context without full login response, 
           // but `setAuth` expects AuthData. If we can't easily update context, we navigate.
           // Assuming dashboard check might re-validate or we trust the navigation.
      }

      navigate("/dashboard");
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
            SteerSolo Quick Setup
          </CardTitle>
          <CardDescription className="text-lg">
            Help us tailor your store (2 mins)
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          
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
            <Label className="text-base font-semibold">3. What’s your biggest struggle with selling online?</Label>
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

          <Button 
            onClick={handleSubmit} 
            className="w-full bg-gradient-to-r from-primary to-accent py-6 text-lg mt-4"
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? (
               <>
                 <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                 Saving preferences...
               </>
            ) : "Complete Setup"}
          </Button>

        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
