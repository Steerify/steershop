import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Check, Sparkles, Clock, Palette, Package, MessageSquare, Loader2 } from "lucide-react";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/steersolo-logo.jpg";

const SetupService = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'info' | 'payment'>('info');
  const [formData, setFormData] = useState({
    businessName: '',
    businessDescription: '',
    instagramHandle: '',
    productsInfo: '',
    contactPhone: '',
    packageType: 'standard' as 'standard' | 'premium',
  });

  const packages = {
    standard: {
      name: 'Standard Setup',
      price: 5000,
      priceKobo: 500000,
      features: [
        'Professional store design',
        'Up to 10 products uploaded',
        'Logo placement',
        'Basic SEO optimization',
        'Delivery within 3 days',
      ],
    },
    premium: {
      name: 'Premium Setup',
      price: 10000,
      priceKobo: 1000000,
      features: [
        'Everything in Standard',
        'Custom banner design',
        'Up to 30 products uploaded',
        'Product descriptions written',
        'Social media optimization',
        'Priority delivery within 24 hours',
      ],
    },
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to request setup service.",
        variant: "destructive",
      });
      navigate('/auth/login');
      return;
    }

    if (!formData.businessName || !formData.contactPhone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const selectedPackage = packages[formData.packageType];

      // Initialize payment via Paystack
      const { data, error } = await supabase.functions.invoke('paystack-setup-service', {
        body: {
          business_name: formData.businessName,
          business_description: formData.businessDescription,
          instagram_handle: formData.instagramHandle,
          products_info: formData.productsInfo,
          contact_phone: formData.contactPhone,
          package_type: formData.packageType,
          amount: selectedPackage.priceKobo,
        },
      });

      if (error) throw error;

      if (data?.authorization_url) {
        localStorage.setItem('setup_reference', data.reference);
        window.location.href = data.authorization_url;
      } else {
        throw new Error('Failed to initialize payment');
      }
    } catch (error) {
      console.error('Setup service error:', error);
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPackage = packages[formData.packageType];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 relative">
      <AdirePattern variant="dots" className="fixed inset-0 opacity-5 pointer-events-none" />
      
      {/* Header */}
      <nav className="bg-card/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50">
        <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(-1)}
                className="mr-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-md ring-2 ring-primary/20">
                <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl sm:text-2xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SteerSolo
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10 max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Premium Service
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Done-For-You Store Setup
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Too busy to set up your store? Let our expert team create a professional, 
            conversion-optimized storefront for your business.
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-10 sm:mb-12">
          {[
            { icon: MessageSquare, title: "Tell Us About You", desc: "Share your business details" },
            { icon: Clock, title: "We Get To Work", desc: "Our team sets up your store" },
            { icon: Palette, title: "Review & Approve", desc: "We show you the result" },
            { icon: Package, title: "Go Live!", desc: "Your store is ready to sell" },
          ].map((step, idx) => (
            <div key={idx} className="text-center p-4 rounded-xl bg-card/50 border border-border/50">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-xs text-muted-foreground mb-1">Step {idx + 1}</div>
              <h3 className="font-semibold text-sm">{step.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Tell Us About Your Business</CardTitle>
                <CardDescription>We'll use this info to create your perfect store</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    placeholder="e.g., Adaeze Fashion House"
                    value={formData.businessName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessDescription">What does your business sell?</Label>
                  <Textarea
                    id="businessDescription"
                    name="businessDescription"
                    placeholder="Tell us about your products/services, target customers, and what makes you unique..."
                    value={formData.businessDescription}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagramHandle">Instagram Handle (optional)</Label>
                    <Input
                      id="instagramHandle"
                      name="instagramHandle"
                      placeholder="@yourbusiness"
                      value={formData.instagramHandle}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">WhatsApp Number *</Label>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      placeholder="08012345678"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productsInfo">Product Information</Label>
                  <Textarea
                    id="productsInfo"
                    name="productsInfo"
                    placeholder="Share your product list, prices, and any photos (you can send photos to our WhatsApp after payment)"
                    value={formData.productsInfo}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>

                {/* Package Selection */}
                <div className="space-y-4">
                  <Label>Select Package</Label>
                  <RadioGroup 
                    value={formData.packageType} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, packageType: v as 'standard' | 'premium' }))}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    {Object.entries(packages).map(([key, pkg]) => (
                      <div key={key} className="relative">
                        <RadioGroupItem value={key} id={key} className="peer sr-only" />
                        <Label
                          htmlFor={key}
                          className="flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-primary/50"
                        >
                          <span className="font-semibold">{pkg.name}</span>
                          <span className="text-2xl font-heading font-bold text-primary mt-1">
                            ₦{pkg.price.toLocaleString()}
                          </span>
                          <ul className="mt-3 space-y-1">
                            {pkg.features.slice(0, 3).map((f, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                                <Check className="w-3 h-3 text-green-500" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="font-heading">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-xl">
                  <h4 className="font-semibold">{selectedPackage.name}</h4>
                  <p className="text-3xl font-heading font-bold text-primary mt-2">
                    ₦{selectedPackage.price.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">One-time payment</p>
                </div>

                <div className="space-y-2">
                  <h5 className="text-sm font-medium">What's included:</h5>
                  <ul className="space-y-2">
                    {selectedPackage.features.map((f, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isLoading || !formData.businessName || !formData.contactPhone}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay ₦${selectedPackage.price.toLocaleString()} Now`
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Secure payment via Paystack. We'll contact you within 24 hours to start.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupService;
