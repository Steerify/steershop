import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  Store,
  Zap,
  Shield,
  ShoppingBag,
  Sparkles,
  CheckCircle,
  Smartphone,
  Clock,
  Heart,
  Globe,
  Rocket,
  Star,
  Users,
  TrendingUp,
  MessageCircle,
  Award,
  Target,
  Crown,
  X,
  Check,
  AlertCircle,
  Search,
  Building,
  MessageSquare,
  SmartphoneIcon,
  DollarSign,
  Layers,
  Tag,
  ChevronRight,
  BarChart,
  Share2,
  Palette,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TopSellerBanner } from "@/components/TopSellerBanner";
import { AdirePattern, AdireDivider } from "@/components/patterns/AdirePattern";
import { DynamicTestimonialsSection, DynamicTransformationSection } from "@/components/DynamicTestimonials";
import { FeaturedShopsBanner } from "@/components/FeaturedShopsBanner";
import heroImage from "@/assets/hero-image.jpg";
import offerService from "@/services/offer.service";
import { TypewriterEffect } from "@/components/TypewriterEffect";

const Index = () => {
  const [activeAudience, setActiveAudience] = useState<"customers" | "entrepreneurs">("entrepreneurs");
  const [offers, setOffers] = useState<any[]>([]);
  
  const painPoints = [
    "Lost orders in WhatsApp?",
    "Manual copy/paste prices?",
    "No professional look?",
    "Customer distrust?",
    "Slow sales?"
  ];
  
  const platformNames = ["Shopify", "Jumia", "Instagram", "WhatsApp", "Simple Stores"];

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await offerService.getOffers();
      if (response.success) {
        setOffers(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  };

  const customerOffer = offers.find(o => o.target_audience === "customers");
  const entrepreneurOffer = offers.find(o => o.target_audience === "entrepreneurs");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* ================= SMART HEADER WITH AUDIENCE TOGGLE ================= */}
      <section className="relative pt-20 md:pt-24 pb-8 overflow-hidden">
        <AdirePattern variant="geometric" className="text-primary" opacity={0.6} />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Audience Toggle Banner */}
          <div className="max-w-md mx-auto mb-8">
            <Tabs 
              value={activeAudience} 
              onValueChange={(value) => setActiveAudience(value as any)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 p-1.5 bg-card border shadow-lg backdrop-blur-sm">
                <TabsTrigger 
                  value="entrepreneurs" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent/20 data-[state=active]:to-primary/20 data-[state=active]:shadow-inner transition-all"
                >
                  <Store className="w-4 h-4" />
                  <span className="font-semibold">I Sell Online</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="customers" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent/20 data-[state=active]:to-primary/20 data-[state=active]:shadow-inner transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="font-semibold">I Shop Online</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Dynamic Hero Content */}
          {activeAudience === "entrepreneurs" ? (
            <EntrepreneurHero 
              painPoints={painPoints}
              offer={entrepreneurOffer}
            />
          ) : (
            <CustomerHero offer={customerOffer} />
          )}
        </div>
      </section>

      {/* ================= DEMO PROMOTION BANNER ================= */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Link to="/demo">
            <Card className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-primary/20 hover:border-accent/40 transition-all cursor-pointer group hover:-translate-y-0.5 hover:shadow-lg">
              <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold mb-1 text-foreground">
                      {activeAudience === "entrepreneurs" ? "See Your Future Store" : "Explore Real Stores"}
                    </h3>
                    <p className="text-muted-foreground max-w-2xl">
                      {activeAudience === "entrepreneurs" 
                        ? "Try our interactive demo store. See how professional your business can look in 60 seconds."
                        : "Browse demo stores to see how real entrepreneurs showcase their products professionally."
                      }
                    </p>
                  </div>
                </div>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-accent to-primary text-white group-hover:opacity-90 shadow-md"
                >
                  {activeAudience === "entrepreneurs" ? "Try Live Demo" : "Browse Demos"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* ================= FEATURED SHOPS BANNER ================= */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <FeaturedShopsBanner />
        </div>
      </section>

      {/* ================= TOP SELLER BANNER ================= */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <TopSellerBanner />
        </div>
      </section>

      {/* ================= DYNAMIC CONTENT SECTIONS ================= */}
      {activeAudience === "entrepreneurs" ? (
        <>
          <CompetitorComparisonSection />
          <DynamicTransformationSection />
          <FeatureGridSection />
          <DynamicTestimonialsSection />
        </>
      ) : (
        <>
          <CustomerBenefitsSection />
          <ShopCategoriesSection />
          <TrustSignalsSection />
        </>
      )}

      {/* ================= SHARED WHY STEERSOLO SECTION ================= */}
      <SharedValueProposition />

      {/* ================= SIMPLE PRICING (Entrepreneurs only) ================= */}
      {activeAudience === "entrepreneurs" && (
        <PricingSection />
      )}

      {/* ================= FINAL CTA ================= */}
      <FinalCTASection 
        activeAudience={activeAudience} 
        onToggleAudience={() => setActiveAudience(activeAudience === "entrepreneurs" ? "customers" : "entrepreneurs")}
      />

      <Footer />
    </div>
  );
};

/* ================= ENTREPRENEUR HERO ================= */
const EntrepreneurHero = ({ painPoints, offer }: { painPoints: string[], offer?: any }) => (
  <div className="max-w-6xl mx-auto">
    <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
      {/* Left Column - Main Message */}
      <div className="space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full mb-4">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-accent font-semibold text-sm">THE SMART ALTERNATIVE</span>
        </div>
        
        {/* Main Heading */}
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-accent">
            <TypewriterEffect 
              texts={painPoints} 
              typingSpeed={80} 
              deletingSpeed={40} 
              pauseDuration={2500}
            />
          </span>
          <br />
          <span className="text-primary">Get Your Professional Store Today</span>
        </h1>
        
        {/* Subheading */}
        <p className="text-lg md:text-xl text-muted-foreground">
          Tired of messy WhatsApp sales? SteerSolo gives you a professional store that works <strong>with</strong> WhatsApp. 
          Accept payments, organize orders, and build trust instantly.
        </p>
        
        {/* Quick Solution Points */}
        <div className="space-y-3">
          {[
            "Replace blurry photos with clean product listings",
            "Stop losing orders in endless chats",
            "Build instant trust with professional storefront",
            "Accept payments easily with Paystack",
            "Get orders straight to your WhatsApp"
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-foreground">{item}</span>
            </div>
          ))}
        </div>
        
        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link to="/auth/signup">
            <Button size="lg" className="bg-gradient-to-r from-accent to-primary text-white text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 w-full sm:w-auto">
              Start Free 7-Day Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link to="/demo">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 w-full sm:w-auto">
              <Sparkles className="w-5 h-5 mr-2" />
              See Live Demo
            </Button>
          </Link>
        </div>
        
        {/* Trust Signal */}
        <p className="text-sm text-muted-foreground pt-2">
          <CheckCircle className="w-4 h-4 text-green-500 inline mr-1" />
          No credit card required • Setup in 60 seconds
        </p>
      </div>
      
      {/* Right Column - Solution Showcase */}
      <div className="space-y-6">
        <Card className="border-2 border-primary/20 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-accent" />
              <CardTitle className="text-xl">The Smart Alternative</CardTitle>
            </div>
            <CardDescription>Why successful sellers choose SteerSolo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                icon: MessageSquare,
                title: "WhatsApp-Powered",
                description: "Keep chatting with customers while we organize everything"
              },
              {
                icon: Building,
                title: "Professional Presence",
                description: "Look established even if you're just starting"
              },
              {
                icon: DollarSign,
                title: "Easy Nigerian Payments",
                description: "Paystack + bank transfers — how Nigerians prefer to pay"
              },
              {
                icon: Layers,
                title: "Everything Organized",
                description: "Products, prices, orders — all in one clean place"
              }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{item.title}</div>
                  <div className="text-sm text-muted-foreground">{item.description}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card p-4 rounded-xl border shadow-sm text-center">
            <div className="text-2xl font-bold text-primary">60 sec</div>
            <div className="text-sm text-muted-foreground">Store setup</div>
          </div>
          <div className="bg-card p-4 rounded-xl border shadow-sm text-center">
            <div className="text-2xl font-bold text-primary">₦1,000/mo</div>
            <div className="text-sm text-muted-foreground">All features included</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ================= CUSTOMER HERO ================= */
const CustomerHero = ({ offer }: { offer?: any }) => (
  <div className="max-w-6xl mx-auto">
    <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full mb-4">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-accent font-semibold text-sm">SHOP FROM REAL ENTREPRENEURS</span>
        </div>
        
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
          Discover Amazing Products
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-accent">
            From Passionate Sellers
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground">
          Shop directly from real entrepreneurs building their dreams. Get unique products, 
          personalized service, and support passionate sellers who care about what they create.
        </p>
        
        <div className="space-y-3">
          {[
            "✓ Verified stores for safe shopping",
            "✓ Direct WhatsApp chat with sellers",
            "✓ Unique products you won't find elsewhere",
            "✓ Support real entrepreneurs building dreams",
            "✓ Fast, personalized service"
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-foreground">{item}</span>
            </div>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link to="/shops">
            <Button size="lg" className="bg-gradient-to-r from-accent to-primary text-white text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 w-full sm:w-auto">
              Browse Stores Now
              <ShoppingBag className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link to="/demo">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 w-full sm:w-auto">
              <Search className="w-5 h-5 mr-2" />
              Explore Demos
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="space-y-6">
        <Card className="border-2 border-primary/20 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-accent" />
              <CardTitle className="text-xl">Why Shop with SteerSolo?</CardTitle>
            </div>
            <CardDescription>Experience shopping that matters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                icon: Shield,
                title: "Verified & Trusted",
                description: "Every seller is verified for your peace of mind"
              },
              {
                icon: MessageCircle,
                title: "Direct Communication",
                description: "Chat directly with sellers for personalized service"
              },
              {
                icon: Star,
                title: "Unique Products",
                description: "Discover amazing products not found in big stores"
              },
              {
                icon: Users,
                title: "Support Real People",
                description: "Your purchase directly supports passionate entrepreneurs"
              }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{item.title}</div>
                  <div className="text-sm text-muted-foreground">{item.description}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card p-4 rounded-xl border shadow-sm text-center">
            <div className="text-2xl font-bold text-primary">100%</div>
            <div className="text-sm text-muted-foreground">Seller verified</div>
          </div>
          <div className="bg-card p-4 rounded-xl border shadow-sm text-center">
            <div className="text-2xl font-bold text-primary">Direct</div>
            <div className="text-sm text-muted-foreground">Seller support</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ================= COMPETITOR COMPARISON SECTION ================= */
const CompetitorComparisonSection = () => (
  <section className="py-16">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
          Why SteerSolo Beats Other Platforms
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Designed specifically for Nigerian sellers who use WhatsApp to sell
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            competitor: "WhatsApp Manual Selling",
            problem: "❌ Lost orders in chats ❌ No pricing structure ❌ Looks unprofessional",
            solution: "✓ Organized order system ✓ Clear pricing lists ✓ Professional storefront"
          },
          {
            competitor: "Shopify",
            problem: "❌ Complex setup ❌ Requires tech skills ❌ High costs",
            solution: "✓ 60-second setup ✓ No tech needed ✓ ₦1,000/month"
          },
          {
            competitor: "Marketplaces (Jumia/Konga)",
            problem: "❌ Price wars ❌ High fees ❌ You're just a vendor",
            solution: "✓ Your own brand ✓ Keep all profits ✓ Build customer loyalty"
          }
        ].map((item, index) => (
          <Card key={index} className="border-2 border-primary/10 hover:border-accent/30 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg text-primary">{item.competitor}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="text-sm text-red-600 font-medium mb-2">The Problem</div>
                <div className="text-gray-800">{item.problem}</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="text-sm text-green-600 font-medium mb-2">SteerSolo Solution</div>
                <div className="text-gray-800">{item.solution}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

/* ================= TRANSFORMATION SECTION ================= */
const TransformationSection = () => (
  <section className="py-16 bg-muted/30">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl font-bold mb-4">
          From WhatsApp Seller to Business Owner
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Real transformations from real sellers using SteerSolo
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            name: "Amaka's Fashion",
            before: "Blurry WhatsApp photos",
            after: "Professional online boutique",
            result: "3x sales increase",
            quote: "Customers now pay without bargaining"
          },
          {
            name: "Tunde's Tech Shop",
            before: "Lost orders in chats",
            after: "Organized order system",
            result: "Saves 3 hours daily",
            quote: "No more order mix-ups"
          },
          {
            name: "Chioma's Baking",
            before: "Manual price lists",
            after: "Clear online menu",
            result: "50% faster orders",
            quote: "Customers browse menu anytime"
          }
        ].map((story, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <h3 className="font-display text-xl font-bold mb-4">{story.name}</h3>
              
              <div className="space-y-4 mb-6">
                <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="text-sm text-red-600 font-medium mb-1">Before SteerSolo</div>
                  <div className="font-medium text-gray-800">{story.before}</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="text-sm text-green-600 font-medium mb-1">After SteerSolo</div>
                  <div className="font-medium text-gray-800">{story.after}</div>
                </div>
              </div>
              
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 mb-4">
                <p className="italic text-foreground">"{story.quote}"</p>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <div className="text-sm text-muted-foreground">Result</div>
                  <div className="font-bold text-green-600">{story.result}</div>
                </div>
                <div className="text-2xl">🚀</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

/* ================= FEATURE GRID SECTION ================= */
const FeatureGridSection = () => (
  <section className="py-16">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
          Everything You Need to Sell Successfully
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Professional tools without the complexity
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            icon: Clock,
            title: "60-Second Setup",
            description: "Start selling while your customer waits"
          },
          {
            icon: MessageCircle,
            title: "WhatsApp Integration",
            description: "Orders come straight to WhatsApp"
          },
          {
            icon: Shield,
            title: "Build Trust Instantly",
            description: "Professional store = higher prices"
          },
          {
            icon: DollarSign,
            title: "Nigerian Payments",
            description: "Paystack + bank transfers"
          },
          {
            icon: Palette,
            title: "Auto Marketing Tools",
            description: "Beautiful posters without designer costs"
          },
          {
            icon: Store,
            title: "Your Brand, Your Rules",
            description: "Own your customers and pricing"
          }
        ].map((item, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

/* ================= CUSTOMER BENEFITS SECTION ================= */
const CustomerBenefitsSection = () => (
  <section className="py-16">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
          Why Shop with SteerSolo Stores?
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Experience shopping that's personal, secure, and meaningful
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: Shield,
            title: "Verified Stores",
            description: "Every seller is verified for safety"
          },
          {
            icon: MessageCircle,
            title: "Direct Chat",
            description: "WhatsApp sellers directly"
          },
          {
            icon: Star,
            title: "Unique Finds",
            description: "Products you won't find elsewhere"
          },
          {
            icon: Heart,
            title: "Support Dreams",
            description: "Help real entrepreneurs grow"
          }
        ].map((item, index) => (
          <Card key={index} className="text-center hover:border-accent/50 transition-all hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

/* ================= SHOP CATEGORIES SECTION ================= */
const ShopCategoriesSection = () => (
  <section className="py-16 bg-muted/30">
    <div className="container mx-auto px-4">
      <h2 className="font-display text-3xl font-bold text-center mb-8">
        Popular Categories
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          "Fashion & Style",
          "Tech Accessories",
          "Food & Drinks",
          "Art & Crafts",
          "Beauty Products",
          "Home & Living",
          "Digital Services",
          "Health & Fitness"
        ].map((category, index) => (
          <Link key={index} to={`/shops?category=${category.toLowerCase().replace(/ & /g, '-')}`}>
            <Card className="text-center hover:bg-accent/5 cursor-pointer transition-all hover:-translate-y-1 border-primary/10">
              <CardContent className="p-6">
                <h3 className="font-medium text-foreground">{category}</h3>
                <div className="mt-2 flex items-center justify-center text-primary text-sm">
                  <span>Browse stores</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

/* ================= TESTIMONIALS SECTION ================= */
const TestimonialsSection = () => (
  <section className="py-16">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl font-bold mb-4">
          What Sellers Are Saying
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Real stories from entrepreneurs who transformed their businesses
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            name: "Amaka N.",
            business: "Fashion Designer",
            quote: "My sales tripled after getting a professional store. Customers trust me more now.",
            sales: "3x sales increase"
          },
          {
            name: "Tunde C.",
            business: "Tech Seller",
            quote: "No more lost orders! Everything comes to WhatsApp and I can track everything.",
            sales: "Saves 3 hours daily"
          },
          {
            name: "Chioma A.",
            business: "Baker",
            quote: "Customers love being able to browse my menu anytime. Orders are much faster now.",
            sales: "50% faster orders"
          }
        ].map((testimonial, index) => (
          <Card key={index} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="italic text-muted-foreground mb-6">"{testimonial.quote}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.business}</div>
                </div>
                <div className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  {testimonial.sales}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

/* ================= TRUST SIGNALS SECTION ================= */
const TrustSignalsSection = () => (
  <section className="py-16">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl font-bold mb-4">
          Shop with Confidence
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          We ensure every shopping experience is safe and satisfying
        </p>
      </div>
      
      <div className="grid md:grid-cols-4 gap-6">
        {[
          {
            icon: Shield,
            title: "Verified Sellers",
            description: "Every store is verified before listing"
          },
          {
            icon: MessageCircle,
            title: "Direct Support",
            description: "Chat directly with sellers on WhatsApp"
          },
          {
            icon: CheckCircle,
            title: "Secure Payments",
            description: "Paystack secured transactions"
          },
          {
            icon: Users,
            title: "Real Reviews",
            description: "Authentic feedback from real customers"
          }
        ].map((item, index) => (
          <Card key={index} className="text-center border-primary/10">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

/* ================= SHARED VALUE PROPOSITION ================= */
const SharedValueProposition = () => (
  <section className="py-16 bg-muted/30">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full mb-4">
          <Target className="w-4 h-4 text-accent" />
          <span className="text-accent font-semibold">THE STEERSOLO DIFFERENCE</span>
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
          Built for Real People, Real Businesses
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          We understand how Nigerians actually buy and sell online
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-display text-xl font-bold mb-2">WhatsApp-First</h3>
          <p className="text-muted-foreground">Designed around how Nigerians actually communicate and do business</p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-display text-xl font-bold mb-2">Super Simple</h3>
          <p className="text-muted-foreground">No complicated setup. Get your store running in 60 seconds</p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-display text-xl font-bold mb-2">Builds Trust</h3>
          <p className="text-muted-foreground">Professional appearance that makes customers trust and buy more</p>
        </div>
      </div>
    </div>
  </section>
);

/* ================= PRICING SECTION ================= */
const PricingSection = () => (
  <section className="py-16">
    <div className="container mx-auto px-4">
      <div className="max-w-md mx-auto">
        <Card className="border-2 border-primary/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-accent text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
            PERFECT FOR SELLERS
          </div>
          <CardHeader className="text-center pb-6 pt-8">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-accent/10 rounded-full text-accent font-semibold text-sm mx-auto mb-4">
              <Rocket className="w-4 h-4" />
              ALL-IN-ONE PLAN
            </div>
            <CardTitle className="font-display text-3xl">Everything You Need</CardTitle>
            <CardDescription className="text-lg">Professional tools at a hustler's price</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-8">
              <span className="text-5xl font-bold text-primary">₦1,000</span>
              <span className="text-muted-foreground text-lg">/month</span>
              <p className="text-sm text-muted-foreground mt-2">
                Less than the cost of one lost order
              </p>
            </div>
            
            <ul className="space-y-3 mb-8 text-left">
              {[
                "Professional store in 60 seconds",
                "Unlimited products & categories",
                "Paystack + manual payments",
                "WhatsApp order delivery",
                "Auto-generated marketing posters",
                "Your own shareable store link",
                "7-day free trial included"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            
            <div className="space-y-4">
              <Link to="/auth/signup">
                <Button size="lg" className="w-full bg-gradient-to-r from-accent to-primary text-white text-lg py-6">
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Free 7-Day Trial
                </Button>
              </Link>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                No credit card • Cancel anytime
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Value Proposition */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            <Check className="w-4 h-4 text-green-500 inline mr-1" />
            Professional results without website costs or designer fees
          </p>
        </div>
      </div>
    </div>
  </section>
);

/* ================= FINAL CTA SECTION ================= */
const FinalCTASection = ({ 
  activeAudience, 
  onToggleAudience 
}: { 
  activeAudience: string, 
  onToggleAudience: () => void 
}) => (
  <section className="relative py-20 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
    <AdirePattern variant="circles" className="text-white" opacity={0.15} />
    
    <div className="container mx-auto px-4 text-center relative z-10">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
          {activeAudience === "entrepreneurs" 
            ? "Ready to Transform Your Business?" 
            : "Ready to Discover Amazing Products?"
          }
        </h2>
        <p className="text-lg md:text-xl text-white/90 mb-8">
          {activeAudience === "entrepreneurs"
            ? "Stop letting messy WhatsApp sales hold you back. Get the professional storefront that makes customers trust you."
            : "Shop directly from passionate sellers creating unique products you won't find anywhere else."
          }
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={activeAudience === "entrepreneurs" ? "/auth/signup" : "/shops"}>
            <Button size="lg" variant="secondary" className="text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5">
              {activeAudience === "entrepreneurs" ? "Launch Your Store Now" : "Browse Stores Now"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-10 py-6 border-white/30 text-white hover:bg-white/10"
            onClick={onToggleAudience}
          >
            {activeAudience === "entrepreneurs" ? "I Want to Shop" : "I Want to Sell"}
          </Button>
        </div>
        
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-white/80">
          <div className="text-center">
            <div className="text-2xl font-bold">60s</div>
            <div className="text-sm">Setup</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">₦0</div>
            <div className="text-sm">To start</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">7 days</div>
            <div className="text-sm">Free trial</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">100%</div>
            <div className="text-sm">{activeAudience === "entrepreneurs" ? "Yours to keep" : "Verified"}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Index;