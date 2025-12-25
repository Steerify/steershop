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
  ArrowLeft,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdirePattern, AdireDivider } from "@/components/patterns/AdirePattern";
import heroImage from "@/assets/hero-image.jpg";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [activeAudience, setActiveAudience] = useState<"customers" | "entrepreneurs">("entrepreneurs");
  const [offers, setOffers] = useState<any[]>([]);
  const [currentPlatform, setCurrentPlatform] = useState(0);
  
  const platforms = ["WhatsApp", "Instagram", "Telegram", "Facebook", "Marketplaces", "Chats"];
  
  // Simple typewriter effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlatform((prev) => (prev + 1) % platforms.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchOffers();
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* ================= SIMPLE HERO SECTION ================= */}
      <section className="relative pt-24 md:pt-28 pb-12 md:pb-16 overflow-hidden">
        <AdirePattern variant="geometric" className="text-primary" opacity={0.6} />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-accent font-semibold text-sm">TRUSTED WORLDWIDE • BUILT IN NIGERIA</span>
            </div>
            
            {/* Main Heading with Simple Typewriter */}
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 leading-tight">
              Your Hustle is Bigger
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-accent animate-gradient">
                Than {platforms[currentPlatform]}
              </span>
            </h1>
            
            {/* Subheading */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {activeAudience === "entrepreneurs" 
                ? "Turn your social media hustle into a global brand. Get a storefront, accept payments worldwide, and manage orders — no website needed."
                : "Discover unique products from passionate sellers worldwide. Shop directly with trust and ease."
              }
            </p>
            
            {/* Audience Toggle */}
            <Tabs 
              value={activeAudience} 
              onValueChange={(value) => setActiveAudience(value as any)}
              className="w-full max-w-md mx-auto mb-8"
            >
              <TabsList className="grid w-full grid-cols-2 p-1.5 bg-muted/50 backdrop-blur-sm">
                <TabsTrigger 
                  value="entrepreneurs" 
                  className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-lg transition-all"
                >
                  <Store className="w-4 h-4" />
                  <span>I Sell Online</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="customers" 
                  className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-lg transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>I Buy Online</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {activeAudience === "entrepreneurs" ? (
                <>
                  <Link to="/auth/signup">
                    <Button size="lg" className="bg-gradient-to-r from-accent to-primary text-white text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                      Start Free Trial
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/shops">
                    <Button size="lg" className="bg-gradient-to-r from-accent to-primary text-white text-lg px-8 py-6 shadow-lg hover:shadow-xl">
                      Browse Stores
                      <ShoppingBag className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/auth/signup">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                      Sell Instead?
                    </Button>
                  </Link>
                </>
              )}
            </div>
            
            {/* Simple Stats */}
            <div className="mt-12 pt-8 border-t border-border/50">
              <div className="flex flex-wrap items-center justify-center gap-8 text-center">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-1">1,250+</div>
                  <p className="text-sm text-muted-foreground">Stores Created</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-1">18,500+</div>
                  <p className="text-sm text-muted-foreground">Orders Processed</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-1">12+</div>
                  <p className="text-sm text-muted-foreground">Countries</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-1">97%</div>
                  <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
                </div>
              </div>
            </div>
          </div>
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
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold mb-1 text-foreground">See SteerSolo in Action</h3>
                    <p className="text-muted-foreground max-w-2xl">
                      Explore our interactive demo store to see exactly how your business would look.
                      No signup required — experience it right now!
                    </p>
                  </div>
                </div>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-accent to-primary text-white group-hover:opacity-90 shadow-md"
                >
                  View Live Demo
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* ================= DYNAMIC CONTENT ================= */}
      {activeAudience === "entrepreneurs" ? (
        <SimplifiedEntrepreneurExperience offer={entrepreneurOffer} />
      ) : (
        <SimplifiedCustomerExperience offer={customerOffer} />
      )}

      <AdireDivider />

      {/* ================= GLOBAL VALUE PROPOSITION ================= */}
      <section className="relative py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full mb-4">
              <Globe className="w-4 h-4 text-accent" />
              <span className="text-accent font-semibold">BUILT IN NIGERIA, READY FOR THE WORLD</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Why Entrepreneurs Worldwide Choose SteerSolo
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The simplest way to turn your local hustle into a global business
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Smartphone,
                title: "WhatsApp-First",
                description: "Orders come straight to your WhatsApp. No apps to monitor."
              },
              {
                icon: Clock,
                title: "60-Second Global Setup",
                description: "Start selling worldwide in under a minute."
              },
              {
                icon: Shield,
                title: "Trust & Credibility",
                description: "Professional storefront that customers trust globally."
              },
              {
                icon: Globe,
                title: "Borderless Payments",
                description: "Accept payments from anywhere with Paystack."
              },
              {
                icon: Rocket,
                title: "Scale Anywhere",
                description: "From Lagos to London, grow without limits."
              },
              {
                icon: Award,
                title: "Premium Experience",
                description: "Auto-generated designs that compete with global brands."
              }
            ].map((item, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
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

      {/* ================= SIMPLE TESTIMONIALS ================= */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-12">
            From Local Hustle to Global Impact
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Chinelo N.",
                location: "Lagos",
                business: "Fashion Designer",
                quote: "My Ankara designs now sell in London! SteerSolo made it possible.",
                flag: "🇳🇬 → 🇬🇧"
              },
              {
                name: "David C.",
                location: "Hong Kong",
                business: "Tech Accessories",
                quote: "Perfect for selling to African markets. The WhatsApp integration is genius.",
                flag: "🇭🇰 → 🌍"
              },
              {
                name: "Fatima A.",
                location: "Kano",
                business: "Perfume Business",
                quote: "From WhatsApp to 8 countries in 3 months. Game changer!",
                flag: "🇳🇬 → 🇦🇪"
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
                      <div className="text-sm text-muted-foreground">{testimonial.business}, {testimonial.location}</div>
                    </div>
                    <div className="text-2xl">{testimonial.flag}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SIMPLE PRICING ================= */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="border-2 border-primary/20 shadow-2xl">
              <CardHeader className="text-center pb-6">
                <div className="inline-flex items-center gap-2 px-4 py-1 bg-accent/10 rounded-full text-accent font-semibold text-sm mx-auto mb-4">
                  <Award className="w-4 h-4" />
                  GLOBAL SOLO PLAN
                </div>
                <CardTitle className="font-display text-3xl">Everything You Need</CardTitle>
                <CardDescription className="text-lg">Local price, global features</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-8">
                  <span className="text-5xl font-bold text-primary">₦1,000</span>
                  <span className="text-muted-foreground text-lg">/month</span>
                  <p className="text-sm text-muted-foreground mt-2">≈ $1.10 • Cancel anytime</p>
                </div>
                
                <ul className="space-y-3 mb-8 text-left">
                  {[
                    "Professional global storefront",
                    "Unlimited products worldwide",
                    "Paystack multi-currency payments",
                    "WhatsApp order delivery",
                    "Auto-generated premium designs",
                    "Basic global analytics",
                    "7-day free trial"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                
                <Link to="/auth/signup">
                  <Button size="lg" className="w-full bg-gradient-to-r from-accent to-primary text-white text-lg py-6">
                    <Rocket className="w-5 h-5 mr-2" />
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground mt-4">No credit card required</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
        <AdirePattern variant="circles" className="text-white" opacity={0.15} />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to {activeAudience === "entrepreneurs" ? "Go Global?" : "Shop Global?"}
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {activeAudience === "entrepreneurs"
              ? "Join entrepreneurs worldwide building real brands with SteerSolo"
              : "Support real entrepreneurs and discover amazing products worldwide"
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={activeAudience === "entrepreneurs" ? "/auth/signup" : "/shops"}>
              <Button size="lg" variant="secondary" className="text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5">
                {activeAudience === "entrepreneurs" ? "Start Free Trial" : "Browse Stores"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-10 py-6 border-white/30 text-white hover:bg-white/10"
              onClick={() => setActiveAudience(activeAudience === "entrepreneurs" ? "customers" : "entrepreneurs")}
            >
              {activeAudience === "entrepreneurs" ? "I Want to Shop" : "I Want to Sell"}
            </Button>
          </div>
          
          <p className="mt-6 text-white/80">
            {activeAudience === "entrepreneurs" ? "No credit card required · 7-day free trial" : "100% secure · Direct seller support"}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

/* ================= SIMPLIFIED ENTREPRENEUR EXPERIENCE ================= */
const SimplifiedEntrepreneurExperience = ({ offer }: { offer?: any }) => (
  <>
    {/* Hero Section */}
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
        <div className="space-y-6">
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            From WhatsApp Chaos to<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-accent">
              Global Business
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground">
            Stop losing sales in endless chats. Get a professional storefront that works worldwide, 
            accept payments in multiple currencies, and manage orders efficiently.
          </p>
          
          {/* Quick Benefits */}
          <ul className="space-y-3">
            {[
              "No website or hosting needed",
              "Paystack multi-currency payments",
              "Orders delivered to your WhatsApp",
              "Professional global designs",
              "₦1,000/month only"
            ].map((item, index) => (
              <li key={index} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          
          {/* Special Offer */}
          {offer && (
            <Card className="border-accent/30 bg-accent/5 mt-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{offer.title}</h3>
                    <p className="text-muted-foreground">
                      {offer.description}
                      {offer.code && (
                        <> Use code: <span className="font-bold text-accent">{offer.code}</span></>
                      )}
                    </p>
                  </div>
                  <Button asChild>
                    <Link to={offer.button_link || "/auth/signup"}>
                      {offer.button_text || "Claim Offer"}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link to="/auth/signup">
              <Button size="lg" className="bg-gradient-to-r from-accent to-primary text-white text-lg px-8">
                Start Your 60-Second Setup
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className="text-lg px-8">
                <Sparkles className="w-5 h-5 mr-2" />
                View Live Demo
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl rounded-3xl" />
          <img
            src={heroImage}
            alt="SteerSolo storefront dashboard"
            className="relative rounded-2xl shadow-2xl w-full border"
          />
        </div>
      </div>
    </section>

    {/* Features Grid */}
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Sell Worldwide
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional tools designed for global solo entrepreneurs
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Store,
              title: "Instant Global Storefront",
              description: "Professional-looking store that works worldwide."
            },
            {
              icon: Zap,
              title: "Borderless Payments",
              description: "Accept cards, transfers worldwide with Paystack."
            },
            {
              icon: MessageCircle,
              title: "WhatsApp Orders",
              description: "Orders come straight to your WhatsApp anywhere."
            },
            {
              icon: TrendingUp,
              title: "Global Marketing",
              description: "Professional posters and flyers for global audience."
            },
            {
              icon: Shield,
              title: "Build Global Trust",
              description: "Look established and credible worldwide."
            },
            {
              icon: Globe,
              title: "Made for Global",
              description: "Built in Nigeria, ready for the world."
            }
          ].map((feature, index) => (
            <Card key={index} className="hover:border-accent/50 transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-display text-xl">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  </>
);

/* ================= SIMPLIFIED CUSTOMER EXPERIENCE ================= */
const SimplifiedCustomerExperience = ({ offer }: { offer?: any }) => (
  <>
    {/* Hero Section */}
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
        <div className="space-y-6">
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Shop from Real<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-accent">
              Global Entrepreneurs
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground">
            Discover unique products from passionate sellers worldwide. Every purchase directly supports 
            real people building their dreams from the ground up.
          </p>
          
          {/* Benefits */}
          <ul className="space-y-3">
            {[
              "Direct communication with sellers",
              "Verified businesses worldwide",
              "Secure multi-currency payments",
              "Global shipping options",
              "Real customer reviews"
            ].map((item, index) => (
              <li key={index} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          
          {/* Special Offer */}
          {offer && (
            <Card className="border-accent/30 bg-accent/5 mt-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{offer.title}</h3>
                    <p className="text-muted-foreground">
                      {offer.description}
                      {offer.code && (
                        <> Use code: <span className="font-bold text-accent">{offer.code}</span></>
                      )}
                    </p>
                  </div>
                  <Button asChild>
                    <Link to={offer.button_link || "/shops"}>
                      {offer.button_text || "Shop Now"}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="pt-4">
            <Link to="/shops">
              <Button size="lg" className="bg-gradient-to-r from-accent to-primary text-white text-lg px-8">
                Browse Global Stores
                <ShoppingBag className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl rounded-3xl" />
          <img
            src={heroImage}
            alt="Customers shopping from global businesses"
            className="relative rounded-2xl shadow-2xl w-full border"
          />
        </div>
      </div>
    </section>

    {/* Why Shop With Us */}
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Why Shop with SteerSolo?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience shopping that's personal, secure, and meaningful worldwide
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Users,
              title: "Real Global Entrepreneurs",
              description: "Connect directly with makers, not corporations."
            },
            {
              icon: Shield,
              title: "Verified Worldwide",
              description: "Every seller is verified for your peace of mind."
            },
            {
              icon: Star,
              title: "Unique Global Finds",
              description: "Discover products you won't find anywhere else."
            },
            {
              icon: MessageCircle,
              title: "Direct Global Chat",
              description: "Message sellers on WhatsApp for personalized service."
            },
            {
              icon: Zap,
              title: "Worldwide Delivery",
              description: "Reliable shipping to most countries."
            },
            {
              icon: Heart,
              title: "Support Global Dreams",
              description: "Your purchase directly supports entrepreneurs worldwide."
            }
          ].map((feature, index) => (
            <Card key={index} className="hover:border-accent/50 transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-display text-xl">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* Categories */}
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl font-bold text-center mb-8">
          Global Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            "African Fashion",
            "Global Tech",
            "World Foods",
            "Art & Crafts",
            "Beauty Worldwide",
            "Digital Services",
            "Home Global",
            "Fitness Global"
          ].map((category, index) => (
            <Card key={index} className="text-center hover:bg-accent/5 cursor-pointer transition-colors">
              <CardContent className="p-6">
                <h3 className="font-medium">{category}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default Index;