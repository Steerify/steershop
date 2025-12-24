import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  Store,
  Zap,
  Shield,
  TrendingUp,
  Users,
  ShoppingBag,
  Star,
  MessageCircle,
  Sparkles,
  CheckCircle,
  Smartphone,
  Target,
  Clock,
  Heart,
  Globe,
  Award,
  Rocket,
  BarChart,
  Palette,
  HeadphonesIcon,
  Cloud,
  Bolt,
  Layers,
  ShieldCheck,
  DollarSign,
  Globe2,
  SmartphoneCharging,
  MessageSquare,
  TrendingUp as TrendingUpIcon,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdirePattern, AdireDivider } from "@/components/patterns/AdirePattern";
import heroImage from "@/assets/hero-image.jpg";
import worldMap from "@/assets/world-map.svg";
import { supabase } from "@/integrations/supabase/client";
import { Typewriter } from "@/components/ui/typewriter";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";

const Index = () => {
  const [activeAudience, setActiveAudience] = useState<"customers" | "entrepreneurs">("entrepreneurs");
  const [offers, setOffers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    storesCreated: 1250,
    ordersProcessed: 18500,
    countries: 12,
    satisfaction: 97
  });

  useEffect(() => {
    fetchOffers();
    // Simulate live stats updates
    const interval = setInterval(() => {
      setStats(prev => ({
        storesCreated: prev.storesCreated + Math.floor(Math.random() * 10),
        ordersProcessed: prev.ordersProcessed + Math.floor(Math.random() * 50),
        countries: prev.countries,
        satisfaction: prev.satisfaction
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOffers = async () => {
    const { data } = await supabase
      .from("special_offers")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    setOffers(data || []);
  };

  const customerOffer = offers.find(o => o.target_audience === "customers");
  const entrepreneurOffer = offers.find(o => o.target_audience === "entrepreneurs");

  const platforms = ["WhatsApp", "Instagram", "Telegram", "Marketplaces", "Facebook", "Chat Groups"];
  const typewriterWords = platforms.map(platform => `Bigger Than ${platform}`);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* ================= GLOBAL HERO SECTION ================= */}
      <section className="relative pt-24 md:pt-32 pb-20 md:pb-24 overflow-hidden">
        {/* World Map Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
          <img 
            src={worldMap} 
            alt="World Map" 
            className="w-full h-full object-cover"
            style={{ filter: "grayscale(100%)" }}
          />
        </div>
        
        <AdirePattern variant="geometric" className="text-primary" opacity={0.4} />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Global Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30 rounded-2xl mb-8 animate-fade-in backdrop-blur-sm">
              <Globe className="w-5 h-5 text-accent animate-pulse" />
              <span className="text-accent font-bold text-sm tracking-wider">
                TRUSTED BY ENTREPRENEURS WORLDWIDE • BUILT IN NIGERIA
              </span>
            </div>
            
            {/* Main Heading with Typewriter */}
            <div className="mb-8">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                Your Hustle is{" "}
                <span className="block mt-4">
                  <Typewriter 
                    words={typewriterWords}
                    className="gradient-text bg-clip-text text-transparent bg-gradient-to-r from-accent via-primary to-accent"
                    cursorClassName="bg-primary"
                  />
                </span>
              </h1>
            </div>
            
            {/* Subheading */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl leading-relaxed">
              The world's first e-commerce platform built specifically for social sellers. 
              From Lagos to London, turn your hustle into a global brand in 60 seconds.
            </p>
            
            {/* Audience Toggle */}
            <div className="mb-12">
              <Tabs 
                value={activeAudience} 
                onValueChange={(value) => setActiveAudience(value as any)}
                className="w-full max-w-md"
              >
                <TabsList className="grid w-full grid-cols-2 p-2 bg-card/80 backdrop-blur-sm border shadow-lg">
                  <TabsTrigger 
                    value="entrepreneurs" 
                    className="flex items-center gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-primary data-[state=active]:text-white transition-all py-3"
                  >
                    <Rocket className="w-5 h-5" />
                    <span className="font-semibold">I'm a Seller</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="customers" 
                    className="flex items-center gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-primary data-[state=active]:text-white transition-all py-3"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span className="font-semibold">I'm a Buyer</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Link to="/auth/signup">
                <Button size="lg" className="relative overflow-hidden group bg-gradient-to-r from-accent to-primary text-white text-lg px-10 py-7 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1">
                  <span className="relative z-10 flex items-center gap-3">
                    <Rocket className="w-6 h-6" />
                    Start Free 7-Day Trial
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </Link>
              
              <Link to="/demo">
                <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-2 backdrop-blur-sm">
                  <Sparkles className="w-5 h-5 mr-2" />
                  View Interactive Demo
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-16 pt-8 border-t border-border/50">
              <div className="flex flex-wrap items-center justify-center gap-10 text-center">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                    <AnimatedCounter value={stats.storesCreated} />+
                  </div>
                  <p className="text-sm text-muted-foreground">Stores Created</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                    <AnimatedCounter value={stats.ordersProcessed} />+
                  </div>
                  <p className="text-sm text-muted-foreground">Orders Processed</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                    {stats.countries}+
                  </div>
                  <p className="text-sm text-muted-foreground">Countries</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                    {stats.satisfaction}%
                  </div>
                  <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= GLOBAL DEMO BANNER ================= */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <Link to="/demo">
            <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 backdrop-blur-sm group cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-8 flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center shadow-xl">
                    <Globe2 className="w-8 h-8 text-white" />
                  </div>
                  <div className="max-w-2xl">
                    <h3 className="font-display text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                      Experience the Future of Social Commerce
                    </h3>
                    <p className="text-muted-foreground text-lg">
                      Explore our live demo store to see how SteerSolo empowers entrepreneurs globally.
                      No signup required — witness the revolution in action!
                    </p>
                  </div>
                </div>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-accent to-primary text-lg px-8 py-6 shadow-lg group-hover:shadow-xl transition-all"
                >
                  Launch Global Demo
                  <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* ================= THE REVOLUTION SECTION ================= */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5" />
        <AdirePattern variant="circles" className="text-primary" opacity={0.1} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full mb-6">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-accent font-semibold">THE REVOLUTION</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Why The World Chooses SteerSolo
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're not just building stores — we're building legacies. From local hustle to global brand.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h3 className="font-display text-3xl font-bold mb-6">
                From Social Media to <span className="gradient-text">Global Marketplace</span>
              </h3>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                While others limit you to chats and stories, SteerSolo transforms your social presence 
                into a professional, scalable business. We bridge the gap between informal selling and 
                enterprise-grade e-commerce.
              </p>
              
              <div className="space-y-6">
                {[
                  {
                    icon: Cloud,
                    title: "Cloud-Powered Infrastructure",
                    desc: "Enterprise-grade hosting with 99.9% uptime"
                  },
                  {
                    icon: ShieldCheck,
                    title: "Global Payment Gateways",
                    desc: "Accept payments from anywhere in the world"
                  },
                  {
                    icon: Globe,
                    title: "Multi-Language Ready",
                    desc: "Serve customers in their native language"
                  },
                  {
                    icon: TrendingUpIcon,
                    title: "Scalable Architecture",
                    desc: "Grow from 10 to 10,000 orders without switching platforms"
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-8 bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl rounded-3xl" />
              <img
                src={heroImage}
                alt="Global e-commerce platform"
                className="relative rounded-3xl shadow-2xl w-full border-4 border-white/20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= DYNAMIC CONTENT ================= */}
      {activeAudience === "entrepreneurs" ? (
        <GlobalEntrepreneurExperience offer={entrepreneurOffer} />
      ) : (
        <GlobalCustomerExperience offer={customerOffer} />
      )}

      <AdireDivider />

      {/* ================= GLOBAL FEATURES ================= */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-6">
              Enterprise Features, Solo Price
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to compete globally, priced for the solo entrepreneur.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: SmartphoneCharging,
                title: "Omni-Channel Sales",
                description: "Sell on WhatsApp, Instagram, TikTok, and your own store simultaneously"
              },
              {
                icon: BarChart,
                title: "Global Analytics",
                description: "Real-time insights on customers from Lagos to Los Angeles"
              },
              {
                icon: DollarSign,
                title: "Multi-Currency",
                description: "Accept payments in USD, EUR, GBP, NGN — automatically converted"
              },
              {
                icon: MessageSquare,
                title: "AI-Powered Chat",
                description: "Smart auto-replies and order management in 50+ languages"
              },
              {
                icon: Palette,
                title: "Brand Studio",
                description: "Professional marketing materials that match global brands"
              },
              {
                icon: Layers,
                title: "Inventory Sync",
                description: "Real-time sync across all your sales channels"
              }
            ].map((item, index) => (
              <Card 
                key={index} 
                className="group relative overflow-hidden border-0 bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <item.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-6">
              From Local Hustle to Global Impact
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Hear from entrepreneurs who turned their passion into profit with SteerSolo
            </p>
          </div>
          
          <TestimonialCarousel />
        </div>
      </section>

      {/* ================= GLOBAL PRICING ================= */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent opacity-5" />
        <AdirePattern variant="geometric" className="text-primary" opacity={0.1} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-6 py-2 bg-accent/20 rounded-full mb-6">
                <Award className="w-5 h-5 text-accent" />
                <span className="text-accent font-bold">WORLD-CLASS VALUE</span>
              </div>
              <h2 className="font-display text-4xl font-bold mb-6">
                Global Features at Local Prices
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Pay less for more. Our mission is to democratize e-commerce for every entrepreneur worldwide.
              </p>
            </div>
            
            <Card className="border-0 shadow-2xl overflow-hidden">
              <div className="p-12">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-4 py-1 bg-gold/10 rounded-full text-gold font-semibold text-sm mb-6">
                      <Sparkles className="w-4 h-4" />
                      MOST POPULAR WORLDWIDE
                    </div>
                    <CardTitle className="font-display text-4xl mb-4">Global Solo Plan</CardTitle>
                    <CardDescription className="text-xl mb-8">
                      Everything you need to build a global brand from anywhere
                    </CardDescription>
                    
                    <div className="mb-10">
                      <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-bold gradient-text">₦1,000</span>
                        <span className="text-2xl text-muted-foreground">/month</span>
                      </div>
                      <p className="text-lg text-muted-foreground mt-2">
                        ≈ $1.10 • ≈ £0.85 • ≈ €1.00
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                        <span className="text-lg">Unlimited global customers</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                        <span className="text-lg">Multi-currency payments</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                        <span className="text-lg">Global shipping integrations</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                        <span className="text-lg">Enterprise-grade security</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8">
                      <h4 className="font-bold text-xl mb-6">Perfect For</h4>
                      <div className="space-y-6">
                        {[
                          "Instagram influencers going global",
                          "Artisans selling to international markets",
                          "Consultants serving clients worldwide",
                          "Digital product creators",
                          "Local brands expanding internationally",
                          "Social sellers scaling their business"
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-accent rounded-full" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-12 pt-8 border-t">
                        <Link to="/auth/signup">
                          <Button 
                            size="lg" 
                            className="w-full bg-gradient-to-r from-accent to-primary text-lg py-7 shadow-xl hover:shadow-2xl transition-all duration-300"
                          >
                            <Rocket className="w-6 h-6 mr-3" />
                            Launch Your Global Store
                            <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                          </Button>
                        </Link>
                        <p className="text-center text-sm text-muted-foreground mt-4">
                          7-day free trial • No credit card required • Cancel anytime
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ================= FINAL GLOBAL CTA ================= */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        </div>
        <AdirePattern variant="circles" className="text-white" opacity={0.1} />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <Globe className="w-20 h-20 text-white/50 mx-auto mb-8" />
          
          <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Build Your Global Legacy?
          </h2>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            Join thousands of entrepreneurs from Nigeria to New York who are changing the game 
            with SteerSolo. Your local hustle deserves a global stage.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/auth/signup">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-12 py-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1">
                <Rocket className="w-6 h-6 mr-3" />
                Start Your Global Journey
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
            
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-12 py-8 border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              onClick={() => setActiveAudience(activeAudience === "entrepreneurs" ? "customers" : "entrepreneurs")}
            >
              {activeAudience === "entrepreneurs" ? "I Want to Shop Global" : "I Want to Sell Global"}
              <Globe className="ml-3 w-5 h-5" />
            </Button>
          </div>
          
          <div className="mt-16 pt-8 border-t border-white/20">
            <p className="text-primary-foreground/80 text-lg">
              Trusted by entrepreneurs in <span className="font-semibold">12 countries</span> and growing daily
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

/* ================= GLOBAL ENTREPRENEUR EXPERIENCE ================= */
const GlobalEntrepreneurExperience = ({ offer }: { offer?: any }) => (
  <>
    {/* Hero Section */}
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-accent/10 rounded-full mb-6">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span className="text-accent font-semibold">GLOBAL SCALING</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 leading-tight">
                From Your Phone to
                <br />
                <span className="gradient-text">The World Stage</span>
              </h2>
              
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                We transform your social media hustle into a borderless e-commerce empire. 
                With SteerSolo, your Nigerian-made products can reach customers in New York, 
                London, and Dubai — all from your smartphone.
              </p>
            </div>
            
            {/* Global Benefits */}
            <div className="space-y-6">
              {[
                "Sell globally while sitting in Lagos",
                "Accept payments in 10+ currencies",
                "Automated international shipping rates",
                "Global SEO for your products",
                "24/7 customer support system"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-card/50 rounded-xl border hover:border-accent/50 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
            
            {/* Special Global Offer */}
            {offer && (
              <Card className="border-accent/50 bg-gradient-to-r from-accent/5 to-primary/5 backdrop-blur-sm mt-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-accent" />
                        <span className="font-bold text-lg">{offer.title}</span>
                      </div>
                      <p className="text-muted-foreground">
                        {offer.description}
                        {offer.code && (
                          <> Global code: <span className="font-bold text-accent">{offer.code}</span></>
                        )}
                      </p>
                    </div>
                    <Button asChild className="bg-gradient-to-r from-accent to-primary">
                      <Link to={offer.button_link || "/auth/signup"}>
                        {offer.button_text || "Go Global Now"}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <Link to="/auth/signup">
                <Button size="lg" className="bg-gradient-to-r from-accent to-primary text-lg px-10 py-7 shadow-xl">
                  <Rocket className="w-6 h-6 mr-3" />
                  Launch Global Store
                  <ArrowRight className="ml-3 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-2">
                  <Sparkles className="w-5 h-5 mr-2" />
                  View Global Demo
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -inset-8 bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl rounded-3xl" />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
              <img
                src={heroImage}
                alt="Global entrepreneur dashboard"
                className="w-full h-auto"
              />
              {/* Floating elements */}
              <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-white text-sm font-bold">GLOBAL ORDERS</div>
                <div className="text-white text-2xl font-bold mt-1">47</div>
              </div>
              <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-white text-sm font-bold">COUNTRIES</div>
                <div className="text-white text-2xl font-bold mt-1">12+</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Global Success Stories */}
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h3 className="font-display text-4xl font-bold mb-6">
            Local Roots, <span className="gradient-text">Global Reach</span>
          </h3>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how entrepreneurs like you are making waves worldwide
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              location: "🇳🇬 Lagos → 🇺🇸 USA",
              story: "Nigerian fashion brand now ships to 15 US states",
              growth: "Revenue: +320% in 6 months"
            },
            {
              location: "🇬🇭 Accra → 🇬🇧 UK",
              story: "Ghanaian spices now in London supermarkets",
              growth: "Orders: 200+ monthly internationally"
            },
            {
              location: "🇰🇪 Nairobi → 🇦🇪 UAE",
              story: "Kenyan artisans selling luxury decor in Dubai",
              growth: "Average order value: $450"
            }
          ].map((story, idx) => (
            <Card key={idx} className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="text-4xl mb-4">{story.location.split("→")[0]}</div>
                <div className="flex items-center justify-center mb-6">
                  <ArrowRight className="w-6 h-6 text-muted-foreground mx-4" />
                  <div className="text-4xl">{story.location.split("→")[1]}</div>
                </div>
                <p className="text-lg font-medium mb-4 text-center">{story.story}</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <span className="text-accent font-bold">{story.growth}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  </>
);

/* ================= GLOBAL CUSTOMER EXPERIENCE ================= */
const GlobalCustomerExperience = ({ offer }: { offer?: any }) => (
  <>
    {/* Hero Section */}
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-accent/10 rounded-full mb-6">
              <ShoppingBag className="w-4 h-4 text-accent" />
              <span className="text-accent font-semibold">GLOBAL DISCOVERY</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Discover Unique Treasures
              <br />
              <span className="gradient-text">From Around The World</span>
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Experience authentic commerce. Shop directly from passionate entrepreneurs across 
              continents — from African artisans to Asian craftsmen, all in one marketplace.
            </p>
          </div>
          
          {/* Global Shopping Benefits */}
          <div className="space-y-6">
            {[
              "Direct-from-maker authenticity",
              "Global shipping with tracking",
              "Multi-currency checkout",
              "VAT & customs handled",
              "Local payment methods worldwide"
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-card/50 rounded-xl border hover:border-accent/50 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>
          
          {/* Special Global Offer */}
          {offer && (
            <Card className="border-accent/50 bg-gradient-to-r from-accent/5 to-primary/5 backdrop-blur-sm mt-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-5 h-5 text-accent" />
                      <span className="font-bold text-lg">{offer.title}</span>
                    </div>
                    <p className="text-muted-foreground">
                      {offer.description}
                      {offer.code && (
                        <> Global code: <span className="font-bold text-accent">{offer.code}</span></>
                      )}
                    </p>
                  </div>
                  <Button asChild className="bg-gradient-to-r from-accent to-primary">
                    <Link to={offer.button_link || "/shops"}>
                      {offer.button_text || "Shop Global Now"}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="pt-8">
            <Link to="/shops">
              <Button size="lg" className="bg-gradient-to-r from-accent to-primary text-lg px-10 py-7 shadow-xl">
                <Globe className="w-6 h-6 mr-3" />
                Explore Global Stores
                <ArrowRight className="ml-3 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute -inset-8 bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl rounded-3xl" />
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
            <img
              src={heroImage}
              alt="Global shopping experience"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>

    {/* Global Categories */}
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h3 className="font-display text-4xl font-bold mb-6">
            Shop <span className="gradient-text">World Culture</span>
          </h3>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Categories representing artisans and entrepreneurs from every continent
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: "African Textiles", flag: "🇳🇬", color: "from-purple-500/20 to-blue-500/20" },
            { name: "Asian Crafts", flag: "🇯🇵", color: "from-red-500/20 to-orange-500/20" },
            { name: "European Fashion", flag: "🇮🇹", color: "from-green-500/20 to-teal-500/20" },
            { name: "American Art", flag: "🇺🇸", color: "from-blue-500/20 to-indigo-500/20" },
            { name: "Middle Eastern Decor", flag: "🇦🇪", color: "from-yellow-500/20 to-amber-500/20" },
            { name: "Oceanian Gifts", flag: "🇦🇺", color: "from-cyan-500/20 to-sky-500/20" },
            { name: "Global Digital", flag: "🌐", color: "from-pink-500/20 to-rose-500/20" },
            { name: "World Food", flag: "🌍", color: "from-emerald-500/20 to-green-500/20" },
          ].map((category, index) => (
            <Card 
              key={index} 
              className={`text-center hover:shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer bg-gradient-to-br ${category.color}`}
            >
              <CardContent className="p-8">
                <div className="text-4xl mb-4">{category.flag}</div>
                <h3 className="font-bold text-lg">{category.name}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default Index;