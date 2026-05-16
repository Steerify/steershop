import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import shopService from "@/services/shop.service";
import marketingServicesService, { MarketingService } from "@/services/marketing-services.service";
import { ConsultationBooking } from "@/components/ConsultationBooking";
import { PageWrapper } from "@/components/PageWrapper";
import {
  ArrowLeft,
  Globe,
  Search,
  TrendingUp,
  Video,
  Calendar,
  ExternalLink,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  Megaphone,
  Target,
  BarChart,
  Instagram,
  Music2,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";

const MarketingServices = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [shop, setShop] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [services, setServices] = useState<MarketingService[]>([]);
  const [googleProfileUrl, setGoogleProfileUrl] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showConsultation, setShowConsultation] = useState(false);
  const [isBusinessPlan, setIsBusinessPlan] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Get profile and check subscription
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*, subscription_plans(*)')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setIsBusinessPlan(profileData.subscription_plans?.slug === 'business');
      }

      // Get shop
      const shopResponse = await shopService.getShopByOwner(user.id);
      const shopData = Array.isArray(shopResponse.data) ? shopResponse.data[0] : shopResponse.data;
      
      if (shopData) {
        setShop(shopData);

        // Get marketing services
        const servicesResponse = await marketingServicesService.getServicesByShop(shopData.id);
        if (servicesResponse.success) {
          setServices(servicesResponse.data || []);
          
          // Find existing Google profile URL
          const googleService = servicesResponse.data?.find(s => s.service_type === 'google_my_business');
          if (googleService?.google_profile_url) {
            setGoogleProfileUrl(googleService.google_profile_url);
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGoogleProfile = async () => {
    if (!shop || !googleProfileUrl) return;

    setIsSavingProfile(true);
    try {
      await marketingServicesService.updateGoogleProfile(shop.id, googleProfileUrl);
      toast({
        title: "Google Profile Saved!",
        description: "You can access your Google Business Profile directly from here.",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save Google profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "outline"; icon: any }> = {
      pending: { variant: "default", icon: Clock },
      scheduled: { variant: "secondary", icon: Calendar },
      in_progress: { variant: "secondary", icon: Loader2 },
      completed: { variant: "outline", icon: CheckCircle },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageWrapper>
    );
  }

  const isProPlan = profile?.subscription_plans?.slug === 'pro' || isBusinessPlan;

  if (!isProPlan) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="py-12">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Unlock SteerAds Growth Engine</h2>
              <p className="text-muted-foreground mb-6">
                SteerAds Pro including Daily Automated Promotion, Social Media Scaling, and WhatsApp Community Growth 
                are available on Pro and Business plans.
              </p>
              <Button onClick={() => navigate('/subscription')} className="bg-gradient-to-r from-primary to-accent">
                Upgrade to Pro + Promotion
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            SteerAds
          </h1>
          <p className="text-muted-foreground">
            Manage your store growth, marketing and ad performance
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <div className="overflow-x-auto pb-2 scrollbar-none">
            <TabsList className="flex w-max min-w-full sm:grid sm:grid-cols-4 sm:max-w-2xl">
              <TabsTrigger value="overview" className="gap-2 flex-1 sm:flex-none">
                <TrendingUp className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="google" className="gap-2 flex-1 sm:flex-none">
                <Globe className="w-4 h-4" />
                Google & SEO
              </TabsTrigger>
              <TabsTrigger value="social" className="gap-2 flex-1 sm:flex-none">
                <Instagram className="w-4 h-4" />
                Social Scaling
              </TabsTrigger>
              <TabsTrigger value="requests" className="gap-2 flex-1 sm:flex-none">
                <Megaphone className="w-4 h-4" />
                History
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Daily Promotion Status</CardTitle>
                  <CardDescription>Your store is being promoted daily to thousands of shoppers.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <p className="font-bold text-green-700 dark:text-green-400">Active</p>
                        <p className="text-xs text-muted-foreground">Promotion running for {shop?.shop_name}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500 text-white border-none">LIVE</Badge>
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Total Ads Reach</span>
                      <span className="font-bold">12.4k+</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Marketplace Features</span>
                      <span className="font-bold">Daily</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Growth Potential</CardTitle>
                  <CardDescription>Estimated performance based on current ads budget.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-xs font-bold uppercase text-muted-foreground">Reach Momentum</span>
                        <span className="text-xs font-bold text-accent">85%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-accent w-[85%]" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Pro plans receive 1 daily automated boost. Upgrade to Business for managed Meta/TikTok campaigns and expert optimization.
                    </p>
                    <Button variant="outline" className="w-full rounded-xl" onClick={() => navigate('/subscription')}>
                      Compare Ad Packages
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Scaling</CardTitle>
                <CardDescription>Promote your Instagram, TikTok, and WhatsApp communities.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { l: "Instagram Growth", d: "Drive targeted followers and engagement.", i: <Instagram className="w-5 h-5" /> },
                    { l: "TikTok Virality", d: "Boost your videos to Nigerian beauty audiences.", i: <Music2 className="w-5 h-5" /> },
                    { l: "WhatsApp Community", d: "Grow your private selling group fast.", i: <MessageCircle className="w-5 h-5" /> }
                  ].map((s, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-border bg-card hover:border-accent/40 transition-all cursor-pointer">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4">
                        {s.i}
                      </div>
                      <h4 className="font-bold mb-1 text-sm">{s.l}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{s.d}</p>
                    </div>
                  ))}
                </div>

                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
                  <h4 className="font-bold mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    How it works
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Our AI identifies your best content and features it in front of shoppers who are most likely to buy from you. 
                    Daily promotion is included in your Pro subscription.
                  </p>
                  <Button className="rounded-xl">Request Custom Boost</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="google" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Your Google Business Profile
                </CardTitle>
                <CardDescription>
                  Let us create and optimize your Google Business Profile for maximum local visibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 text-center">
                  <Globe className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h3 className="font-bold text-lg mb-2">Get Found on Google</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Submit your business info and our team will create a fully optimized Google Business Profile for you — included in your Business plan.
                  </p>
                  <Button
                    onClick={() => navigate("/google-business-profile")}
                    className="bg-gradient-to-r from-primary to-accent"
                  >
                    Start Google Profile Setup
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {googleProfileUrl && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(googleProfileUrl, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Existing Google Business Profile
                  </Button>
                )}

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Included in your Business Plan:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Google My Business setup and optimization
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      SEO optimization for local search
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Organic marketing strategy
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                      <Video className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">YouTube Ads</CardTitle>
                      <Badge variant="outline">Add-on Service</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Reach millions of potential customers with targeted video advertising on YouTube.
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Brand awareness campaigns</li>
                    <li>• Product showcase videos</li>
                    <li>• Remarketing to past visitors</li>
                  </ul>
                  <p className="text-primary font-medium">Starting from ₦50,000/month</p>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setShowConsultation(true)}
                  >
                    Book Consultation
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                      <Search className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Google Search Ads</CardTitle>
                      <Badge variant="outline">Add-on Service</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Appear at the top of Google search results when customers are looking for your products.
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Keyword research and targeting</li>
                    <li>• Professional ad copy writing</li>
                    <li>• Performance tracking and optimization</li>
                  </ul>
                  <p className="text-primary font-medium">Starting from ₦30,000/month</p>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setShowConsultation(true)}
                  >
                    Book Consultation
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Service Request History</CardTitle>
                <CardDescription>Track your active and previous marketing service requests</CardDescription>
              </CardHeader>
              <CardContent>
                {services.length === 0 ? (
                  <div className="text-center py-12 bg-muted/30 rounded-lg">
                    <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                    <p className="text-muted-foreground">No service requests yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Book a consultation to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Target className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium capitalize">{service.service_type.replace('_', ' ')}</h4>
                            <p className="text-xs text-muted-foreground">
                              Requested on {format(new Date(service.created_at), 'PPP')}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(service.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {shop && (
          <ConsultationBooking
            open={showConsultation}
            onOpenChange={setShowConsultation}
            shopId={shop.id}
            shopName={shop.shop_name}
          />
        )}
      </div>
    </PageWrapper>
  );
};

export default MarketingServices;
