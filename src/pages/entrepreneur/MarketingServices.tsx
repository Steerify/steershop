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

  if (!isBusinessPlan) {
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
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Upgrade to Business Plan</h2>
              <p className="text-muted-foreground mb-6">
                Marketing Services including Google My Business setup, SEO optimization, and ad consultations
                are available exclusively on the Business plan.
              </p>
              <Button onClick={() => navigate('/subscription')} className="bg-gradient-to-r from-primary to-accent">
                Upgrade Now
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
            Marketing Services
          </h1>
          <p className="text-muted-foreground">
            Manage your Google profile and request marketing consultations
          </p>
        </div>

        <Tabs defaultValue="google" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="google" className="gap-2">
              <Globe className="w-4 h-4" />
              Google Profile
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-2">
              <Megaphone className="w-4 h-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <BarChart className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Google Profile Tab */}
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

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
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
                      <CardTitle className="text-lg">Google Ads</CardTitle>
                      <Badge variant="outline">Add-on Service</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Appear at the top of Google search results when customers are looking for your products.
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Search advertising</li>
                    <li>• Display network campaigns</li>
                    <li>• Shopping ads for products</li>
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

            <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="py-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg mb-1">Not sure which service is right for you?</h3>
                    <p className="text-muted-foreground">
                      Schedule a free 30-minute consultation with our marketing team
                    </p>
                  </div>
                  <Button onClick={() => setShowConsultation(true)} className="bg-gradient-to-r from-primary to-accent">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Free Consultation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Requests</CardTitle>
                <CardDescription>Track your marketing service requests and consultations</CardDescription>
              </CardHeader>
              <CardContent>
                {services.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No service requests yet</p>
                    <p className="text-sm">Request a consultation to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            {service.service_type === 'youtube_ads' && <Video className="w-5 h-5 text-red-500" />}
                            {service.service_type === 'google_ads' && <Search className="w-5 h-5 text-blue-500" />}
                            {service.service_type === 'consultation' && <Calendar className="w-5 h-5 text-primary" />}
                            {service.service_type === 'google_my_business' && <Globe className="w-5 h-5 text-green-500" />}
                          </div>
                          <div>
                            <p className="font-medium capitalize">
                              {service.service_type.replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Requested {format(new Date(service.created_at), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(service.status)}
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
