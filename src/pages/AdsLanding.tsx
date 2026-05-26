import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, ArrowRight, Check, Sparkles, Megaphone, 
  Target, TrendingUp, Users, ShieldCheck, CheckCircle2, MessageCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PageThemeShell } from "@/components/PageThemeShell";
import logo from "@/assets/steersolo-logo.jpg";
import { openWhatsAppContact } from "@/utils/whatsapp";

interface AdPackage {
  id: string;
  name: string;
  price: string;
  desc: string;
  features: string[];
}

const TRAFFIC_PACKAGES: AdPackage[] = [
  {
    id: "spark",
    name: "Spark Plan",
    price: "₦12,000",
    desc: "Perfect for new stores testing the waters.",
    features: [
      "1 Professional Campaign setup",
      "Facebook & Instagram Ads Placement",
      "Managed ad budget up to ₦50K/mo",
      "Weekly performance reports",
      "Standard WhatsApp checkout setup",
    ],
  },
  {
    id: "boost",
    name: "Boost Plan",
    price: "₦28,000",
    desc: "For active sellers wanting consistent daily orders.",
    features: [
      "3 Campaign split-testing",
      "Meta + TikTok Ads Placement",
      "Managed ad budget up to ₦150K/mo",
      "Bi-weekly detailed analytics",
      "Retargeting custom audiences",
      "Dedicated account manager",
    ],
  },
  {
    id: "scale",
    name: "Scale Plan",
    price: "₦55,000",
    desc: "High volume tier for established brands expanding fast.",
    features: [
      "Unlimited campaign setup & split testing",
      "Meta + TikTok + Google Ads integration",
      "Managed ad budget up to ₦400K/mo",
      "Real-time lookalike audience matching",
      "Ad creative optimization & copy assets",
      "Direct Priority Support line",
    ],
  },
  {
    id: "dominate",
    name: "Dominate Plan",
    price: "₦95,000",
    desc: "Ultimate market takeover with comprehensive Omnichannel ads.",
    features: [
      "Full Omni-channel coverage (Meta, TikTok, Google, YouTube)",
      "Continuous optimization & custom creatives",
      "Managed budget above ₦400K/mo",
      "Advanced custom database matching & custom audiences",
      "Dedicated senior growth partner",
      "Daily real-time performance dashboard",
    ],
  },
];

const FOLLOW_PACKAGES: AdPackage[] = [
  {
    id: "starter",
    name: "Starter Growth",
    price: "₦18,000",
    desc: "Boost your social page's authority and follower trust.",
    features: [
      "Grow 300 - 800+ targeted local followers",
      "Real, active Nigerian profiles",
      "Meta follower campaign setup",
      "Audience interest targeting matching",
    ],
  },
  {
    id: "active",
    name: "Active Growth",
    price: "₦35,000",
    desc: "Accelerate social proof and establish market authority.",
    features: [
      "Grow 1,500 - 3,500+ targeted local followers",
      "Real, active Nigerian profiles",
      "Split-tested Meta & TikTok profile campaigns",
      "Competitor audience target hijacking",
      "Social profile content audit & advice",
    ],
  },
  {
    id: "viral",
    name: "Viral Push",
    price: "₦65,000",
    desc: "Rapidly expand your brand presence across multiple platforms.",
    features: [
      "Grow 4,000 - 8,000+ targeted local followers",
      "Premium Meta, Instagram & TikTok placement",
      "Aggressive video engagement boosting",
      "Influencer format mimic testing",
      "Content strategy & caption writing",
    ],
  },
  {
    id: "domination",
    name: "Full Domination",
    price: "₦120,000",
    desc: "Dominate your niche and gain massive celebrity-tier social presence.",
    features: [
      "Grow 10,000+ local targeted followers monthly",
      "Full omnipresent brand takeover",
      "Viral reel/video distribution push",
      "Dedicated content advisor",
      "Guaranteed profile authority upgrade",
    ],
  },
];

export default function AdsLanding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"traffic" | "followers">("traffic");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [myShop, setMyShop] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    businessName: "",
    whatsappNumber: "",
    storeUrl: "",
    packageId: "spark",
    targetAudience: "",
    estimatedBudget: "₦10,000 - ₦50,000",
  });

  // Prefill user data if logged in
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        // Load user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("id", user.id)
          .single();
          
        // Load user shop
        const { data: shop } = await supabase
          .from("shops")
          .select("id, shop_name, shop_slug, whatsapp_number")
          .eq("owner_id", user.id)
          .eq("is_active", true)
          .maybeSingle();

        if (shop) {
          setMyShop(shop);
        }

        setFormData(prev => ({
          ...prev,
          businessName: shop?.shop_name || profile?.full_name || "",
          whatsappNumber: shop?.whatsapp_number || profile?.phone || "",
          storeUrl: shop?.shop_slug ? `https://steersolo.com/shop/${shop.shop_slug}` : "",
        }));
      } catch (error) {
        console.error("Error loading user profile for ads:", error);
      }
    };
    loadUserData();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const currentPackages = activeTab === "traffic" ? TRAFFIC_PACKAGES : FOLLOW_PACKAGES;
  const selectedPackage = currentPackages.find(p => p.id === formData.packageId) || currentPackages[0];

  // Auto-switch packageId when switching tabs
  const handleTabChange = (tab: "traffic" | "followers") => {
    setActiveTab(tab);
    setFormData(prev => ({
      ...prev,
      packageId: tab === "traffic" ? "spark" : "starter",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.whatsappNumber) {
      toast({
        title: "Required Fields Missing",
        description: "Please enter your business name and active WhatsApp number.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      let serviceId = "";
      // Save consultation entry into marketing_services table in Supabase
      if (user && myShop) {
        const notes = `Package: ${selectedPackage.name} (${selectedPackage.price}/mo). Target Audience: ${formData.targetAudience || "Not specified"}. Estimated Monthly Budget: ${formData.estimatedBudget}. Store: ${formData.storeUrl || "None"}.`;
        
        const { data, error } = await supabase
          .from("marketing_services")
          .insert({
            shop_id: myShop.id,
            service_type: activeTab === "traffic" ? "meta_ads" : "consultation",
            consultation_notes: notes,
            status: "pending",
            payment_status: "pending",
          })
          .select("id")
          .single();
          
        if (error) throw error;
        if (data) serviceId = data.id;
      }

      // Format price for Paystack (remove ₦ and commas, multiply by 100 for kobo)
      const numericPrice = parseInt(selectedPackage.price.replace(/[^0-9]/g, ''), 10);
      const amountInKobo = numericPrice * 100;
      
      // Initialize Paystack Checkout
      import('@paystack/inline-js').then((module) => {
        const PaystackPop = module.default;
        const paystack = new PaystackPop();
        
        paystack.newTransaction({
          key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_placeholder", // Replace with your actual Paystack public key
          email: user?.email || "customer@steersolo.com",
          amount: amountInKobo,
          currency: "NGN",
          metadata: {
            custom_fields: [
              {
                display_name: "Service ID",
                variable_name: "service_id",
                value: serviceId
              },
              {
                display_name: "Package",
                variable_name: "package_name",
                value: selectedPackage.name
              }
            ]
          },
          onSuccess: async (transaction: any) => {
            if (serviceId) {
              await supabase
                .from("marketing_services")
                .update({ payment_status: "paid" })
                .eq("id", serviceId);
            }
            
            setIsSuccess(true);
            toast({
              title: "Payment Successful! 🎉",
              description: "Your Steerify Ads package is now active. Let's start the onboarding.",
            });
            setIsLoading(false);
          },
          onCancel: () => {
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment. Please try again when you are ready.",
              variant: "destructive",
            });
            setIsLoading(false);
          }
        });
      }).catch(err => {
        console.error("Failed to load Paystack:", err);
        setIsLoading(false);
        toast({
          title: "Payment Gateway Error",
          description: "Could not load the payment gateway. Please check your internet connection.",
          variant: "destructive",
        });
      });

    } catch (err: any) {
      console.error("Error submitting ads form:", err);
      toast({
        title: "Submission Error",
        description: err.message || "Something went wrong saving your request.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <PageThemeShell
      header={
        <nav className="bg-card/85 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50">
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
                  <img src={logo} alt="SteerSolo Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-xl sm:text-2xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  SteerSolo
                </span>
              </div>
              <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-xs font-bold py-1 px-3 rounded-full">
                Steerify Ads
              </Badge>
            </div>
          </div>
        </nav>
      }
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 relative z-10 max-w-6xl">
        {/* Success Screen */}
        {isSuccess ? (
          <Card className="max-w-2xl mx-auto border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-3xl overflow-hidden shadow-xl p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">
              Consultation Requested!
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              Outstanding! Your intake profile has been logged and we've opened our WhatsApp chat. 
              Our ad copywriters and target specialists will design, test, and coordinate your first ad flight within 24 hours.
            </p>
            <div className="p-4 bg-muted/60 rounded-2xl max-w-sm mx-auto border border-border/80 text-left space-y-1">
              <p className="text-xs text-muted-foreground">Chosen Tier:</p>
              <h3 className="font-extrabold text-sm text-foreground">{selectedPackage.name} — {selectedPackage.price}/mo</h3>
              <p className="text-[10px] text-primary font-medium">Auto-synced with merchant admin panel</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button 
                onClick={() => {
                  const whatsappMsg = `Hi SteerSolo! I requested ads for my business *${formData.businessName}* (WhatsApp: ${formData.whatsappNumber}). Ready to setup!`;
                  openWhatsAppContact("08012345678", "SteerSolo Ads", whatsappMsg);
                }} 
                className="bg-primary hover:bg-primary/95 text-white font-bold rounded-xl"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Resume WhatsApp Chat
              </Button>
              <Button variant="outline" onClick={() => navigate(user ? '/dashboard' : '/')} className="rounded-xl">
                Go to Dashboard
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-12">
            {/* Elegant Premium Hero */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/25 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                Steerify Ads Growth Portal
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-foreground leading-tight">
                Flood Your Store <br />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">With Buyers.</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                You built a premium storefront. Now get the audience you deserve. 
                Steerify Ads launches conversion campaigns on Facebook, Instagram, and TikTok to drive shoppers straight to your WhatsApp checkout in under 24 hours.
              </p>
            </div>

            {/* Platform Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Target, title: "Hyper-Targeted", desc: "Reach buyers matched by exact age, location, and verified interests." },
                { icon: TrendingUp, title: "4–8× Average ROAS", desc: "Our conversion-focused copy turns views into immediate WhatsApp checkouts." },
                { icon: Users, title: "Done-For-You Setup", desc: "No tech skills needed. We design your creatives, write copy, and test targets." }
              ].map((stat, i) => (
                <Card key={i} className="rounded-2xl border-border/80 bg-card/60 backdrop-blur-md">
                  <CardContent className="p-5 flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm text-foreground">{stat.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{stat.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Split packages section */}
            <div className="space-y-6">
              {/* Tab Selector */}
              <div className="flex justify-center">
                <div className="bg-muted p-1 rounded-2xl flex gap-1 border">
                  <button 
                    onClick={() => handleTabChange("traffic")}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                      activeTab === "traffic" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Megaphone className="w-3.5 h-3.5 inline mr-1.5" />
                    Drive Store Sales
                  </button>
                  <button 
                    onClick={() => handleTabChange("followers")}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                      activeTab === "followers" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 inline mr-1.5" />
                    Follower Growth
                  </button>
                </div>
              </div>

              {/* Package cards & Intake form layout */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Package Cards List */}
                <div className="lg:col-span-3 space-y-4">
                  {currentPackages.map(pkg => (
                    <Card 
                      key={pkg.id} 
                      onClick={() => setFormData(prev => ({ ...prev, packageId: pkg.id }))}
                      className={`rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                        formData.packageId === pkg.id 
                          ? "border-primary bg-primary/[0.02]" 
                          : "border-border/80 hover:border-primary/40 bg-card/40"
                      }`}
                    >
                      <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-base text-foreground">{pkg.name}</span>
                            {formData.packageId === pkg.id && (
                              <Badge className="bg-primary text-white border-0 text-[10px] uppercase font-black tracking-wider px-2 py-0.5">
                                Selected
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground max-w-md">{pkg.desc}</p>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                            {pkg.features.map((feature, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/60">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Management Fee</p>
                          <h3 className="text-2xl sm:text-3xl font-black text-primary mt-1">{pkg.price}</h3>
                          <p className="text-[9px] text-muted-foreground mt-0.5">/ month plus ad spend</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Card className="rounded-3xl border-border/80 bg-neutral-900 text-white p-5 sm:p-6 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex gap-4 items-start relative z-10">
                      <ShieldCheck className="w-8 h-8 text-primary shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-sm uppercase tracking-wide">SteerSolo Growth Protection</h4>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                          Your peace of mind is guaranteed. If we don't successfully launch and display active campaign impressions within 3 days of budget clearance, we refund your management fee 100% instantly.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Intake Form */}
                <div className="lg:col-span-2">
                  <Card className="rounded-3xl border-border/80 shadow-md bg-card/65 sticky top-24">
                    <CardHeader className="pb-3">
                      <CardTitle className="font-black text-lg uppercase tracking-tight">Onboarding Request</CardTitle>
                      <CardDescription className="text-xs">Complete your details to start campaign planning</CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 sm:p-6 pt-0">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="businessName" className="text-xs font-bold uppercase tracking-wide">Business / Store Name *</Label>
                          <Input
                            id="businessName"
                            name="businessName"
                            placeholder="e.g., Kemi Cosmetics"
                            value={formData.businessName}
                            onChange={handleInputChange}
                            required
                            className="rounded-xl h-10"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="whatsappNumber" className="text-xs font-bold uppercase tracking-wide">Active WhatsApp Number *</Label>
                          <Input
                            id="whatsappNumber"
                            name="whatsappNumber"
                            placeholder="08031234567"
                            value={formData.whatsappNumber}
                            onChange={handleInputChange}
                            required
                            className="rounded-xl h-10"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="storeUrl" className="text-xs font-bold uppercase tracking-wide">SteerSolo URL <span className="text-muted-foreground font-normal">(optional)</span></Label>
                          <Input
                            id="storeUrl"
                            name="storeUrl"
                            placeholder="e.g., steersolo.com/shop/kemi-makeup"
                            value={formData.storeUrl}
                            onChange={handleInputChange}
                            className="rounded-xl h-10"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="targetAudience" className="text-xs font-bold uppercase tracking-wide">Who is your target buyer?</Label>
                          <Textarea
                            id="targetAudience"
                            name="targetAudience"
                            placeholder="e.g., Abuja ladies seeking organic skincare solutions for glowing skin"
                            value={formData.targetAudience}
                            onChange={handleInputChange}
                            rows={3}
                            className="rounded-xl resize-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold uppercase tracking-wide">Estimated Monthly Ad Spend</Label>
                          <RadioGroup 
                            value={formData.estimatedBudget} 
                            onValueChange={(v) => setFormData(prev => ({ ...prev, estimatedBudget: v }))}
                            className="grid grid-cols-2 gap-2"
                          >
                            {[
                              "₦10,000 - ₦50,000",
                              "₦50,000 - ₦150,000",
                              "₦150,000 - ₦400,000",
                              "₦400,000+",
                            ].map(option => (
                              <div key={option} className="relative">
                                <RadioGroupItem value={option} id={option} className="peer sr-only" />
                                <Label
                                  htmlFor={option}
                                  className="flex items-center justify-center p-2.5 rounded-xl border text-center text-xs font-semibold cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-primary/40 transition-all"
                                >
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Ad spend is paid directly to Facebook/TikTok. You maintain complete budget control.
                          </p>
                        </div>

                        <Button 
                          type="submit" 
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 active:scale-[0.98] transition-all text-white font-black text-xs uppercase tracking-widest h-11 rounded-xl shadow-md mt-2"
                        >
                          Submit Setup Request
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageThemeShell>
  );
}
