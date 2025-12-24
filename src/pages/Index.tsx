// src/pages/Index.tsx
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
  Link as LinkIcon,
  Globe,
  ExternalLink,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdirePattern, AdireDivider } from "@/components/patterns/AdirePattern";
import heroImage from "@/assets/hero-image.jpg";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { TypewriterHero } from "@/components/TypewriterHero";

const Index = () => {
  const [activeAudience, setActiveAudience] = useState<"customers" | "entrepreneurs">("entrepreneurs");
  const [offers, setOffers] = useState<any[]>([]);

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
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-24 md:pt-28 pb-12 md:pb-16 overflow-hidden">
        <AdirePattern variant="geometric" className="text-primary" opacity={0.6} />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full mb-6 animate-fade-in">
              <Globe className="w-4 h-4 text-accent" />
              <span className="text-accent font-semibold text-sm">Trusted by Entrepreneurs Worldwide</span>
            </div>
            
            {/* Main Heading with Typewriter */}
            <div className="mb-8">
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 leading-tight text-center">
                <TypewriterHero />
                <div className="mt-4">
                  <span className="gradient-text">It's a Real Business.</span>
                </div>
              </h1>
              
              {/* Subheading */}
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-center">
                SteerSolo transforms the way solo entrepreneurs sell online. Get a professional storefront, 
                seamless payments, and direct customer connections—turning your hustle into a global brand.
              </p>
            </div>
            
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
                    <Button size="lg" className="bg-gradient-to-r from-accent to-primary text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                      Start Free Trial
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/demo">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary/30 hover:bg-primary/5">
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Live Demo
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/shops">
                    <Button size="lg" className="bg-gradient-to-r from-accent to-primary text-lg px-8 py-6 shadow-lg hover:shadow-xl">
                      Browse Global Stores
                      <ShoppingBag className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/auth/signup">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary/30 hover:bg-primary/5">
                      Sell Instead?
                    </Button>
                  </Link>
                </>
              )}
            </div>
            
            {/* Social Proof Stats */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { value: "5K+", label: "Active Stores" },
                { value: "50+", label: "Countries" },
                { value: "99%", label: "Satisfaction" },
                { value: "60s", label: "Setup Time" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
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
                    <h3 className="font-display text-xl font-bold mb-1 text-foreground">Experience The Future of E-commerce</h3>
                    <p className="text-muted-foreground max-w-2xl">
                      Explore our interactive demo store to see exactly how SteerSolo revolutionizes online selling. 
                      No signup required — experience global commerce today!
                    </p>
                  </div>
                </div>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-accent to-primary group-hover:opacity-90 shadow-md"
                >
                  Launch Demo Store
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* ================= DYNAMIC CONTENT ================= */}
      {activeAudience === "entrepreneurs" ? (
        <EntrepreneurExperience offer={entrepreneurOffer} />
      ) : (
        <CustomerExperience offer={customerOffer} />
      )}

      {/* ================= HOW IT WORKS ================= */}
      <section className="relative py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Build Your Global Store in Minutes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple, powerful workflow designed for entrepreneurs everywhere
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center relative">
              <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center">
                  <Store className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-display text-xl font-bold mb-3">Create Your Store</h3>
              <p className="text-muted-foreground">
                Set up a beautiful, mobile-ready storefront with your products. No design skills or code needed.
              </p>
            </div>
            {/* Step 2 */}
            <div className="text-center relative">
              <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center">
                  <LinkIcon className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-display text-xl font-bold mb-3">Share Your Link</h3>
              <p className="text-muted-foreground">
                Get one simple link. Share it on WhatsApp, Instagram, TikTok—anywhere your customers are.
              </p>
            </div>
            {/* Step 3 */}
            <div className="text-center relative">
              <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-display text-xl font-bold mb-3">Sell & Manage</h3>
              <p className="text-muted-foreground">
                Accept payments, get orders in your WhatsApp, and build customer relationships. All from one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      <AdireDivider />

      {/* ================= UNIFIED VALUE PROPOSITION ================= */}
      <section className="relative py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Why Entrepreneurs Choose SteerSolo
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The platform that bridges informal selling and global business success
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Globe,
                title: "Global Reach, Local Touch",
                description: "Sell to anyone, anywhere while maintaining authentic customer connections."
              },
              {
                icon: Clock,
                title: "60-Second Global Launch",
                description: "Go from idea to international store in under a minute. Zero technical barriers."
              },
              {
                icon: Shield,
                title: "Instant Credibility",
                description: "Look established and trustworthy from day one, anywhere in the world."
              },
              {
                icon: Zap,
                title: "Universal Payments",
                description: "Accept payments globally with Paystack + manual options. Get paid your way."
              }
            ].map((item, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group">
                <CardContent className="pt-8 pb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ================= GLOBAL TESTIMONIALS ================= */}
      <section className="relative py-16 md:py-20 bg-muted/30">
        <AdirePattern variant="dots" className="text-primary" opacity={0.05} />
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Loved Worldwide
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From Lagos to London, entrepreneurs are building their dreams with SteerSolo
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                quote: "SteerSolo transformed my WhatsApp fashion business. Now I sell to customers in 3 countries!",
                author: "Chioma A., Lagos",
                role: "Fashion Entrepreneur"
              },
              {
                quote: "As a baker in Abuja, I went from local orders to international shipments. Game changer!",
                author: "Tunde K., Abuja",
                role: "Artisan Baker"
              },
              {
                quote: "My consulting business got professional overnight. Clients trust my SteerSolo store immediately.",
                author: "Sarah M., London",
                role: "Business Consultant"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="italic text-muted-foreground mb-6">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
        <AdirePattern variant="circles" className="text-white" opacity={0.15} />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Build Your Global Business?
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of entrepreneurs worldwide who've turned their hustle into a professional brand
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={activeAudience === "entrepreneurs" ? "/auth/signup" : "/shops"}>
              <Button size="lg" variant="secondary" className="text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5">
                {activeAudience === "entrepreneurs" ? "Start Free Trial" : "Browse Global Stores"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-10 py-6 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setActiveAudience(activeAudience === "entrepreneurs" ? "customers" : "entrepreneurs")}
            >
              {activeAudience === "entrepreneurs" ? "I Want to Shop" : "I Want to Sell"}
            </Button>
          </div>
          
          <p className="mt-6 text-primary-foreground/80">
            {activeAudience === "entrepreneurs" 
              ? "No credit card required · 7-day free trial · Cancel anytime" 
              : "100% secure · Direct seller support · Global shipping"}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

/* ================= ENTREPRENEUR EXPERIENCE ================= */
const EntrepreneurExperience = ({ offer }: { offer?: any }) => (
  <>
    {/* Hero Section */}
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
        <div className="space-y-6">
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            From Chaos to<br />
            <span className="gradient-text">Global Commerce</span>
          </h2>
          
          <p className="text-lg text-muted-foreground">
            Transform scattered social media sales into a unified, professional brand that customers trust worldwide. 
            SteerSolo gives you the tools to scale beyond borders while keeping that personal touch.
          </p>
          
          {/* Quick Benefits */}
          <ul className="space-y-3">
            {[
              "Professional global storefront in minutes",
              "Accept payments from anywhere with Paystack",
              "Orders delivered to your WhatsApp in real-time",
              "Auto-generated marketing designs for any platform",
              "Scale from local to global with one link"
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
              <Button size="lg" className="bg-gradient-to-r from-accent to-primary text-lg px-8">
                Launch Your Global Store
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className="text-lg px-8 border-primary/30 hover:bg-primary/5">
                <Sparkles className="w-5 h-5 mr-2" />
                Experience Demo
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl rounded-3xl" />
          <img
            src={heroImage}
            alt="Global entrepreneur managing their SteerSolo store"
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
            Enterprise Tools for Solo Entrepreneurs
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional features designed to help you compete globally
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Globe,
              title: "Global Storefront",
              description: "Beautiful, responsive store that works perfectly on any device, anywhere in the world."
            },
            {
              icon: Zap,
              title: "Smart Payments",
              description: "Accept cards, transfers, and local payment methods from customers worldwide."
            },
            {
              icon: MessageCircle,
              title: "Direct Communication",
              description: "All orders come straight to your WhatsApp. Build relationships, not just transactions."
            },
            {
              icon: TrendingUp,
              title: "Auto-Marketing",
              description: "Professional posters and social media designs generated automatically for your brand."
            },
            {
              icon: Shield,
              title: "Built-in Trust",
              description: "Verified store badges and customer reviews to establish immediate credibility."
            },
            {
              icon: Heart,
              title: "Made for Growth",
              description: "Everything you need to scale from local hero to global brand."
            }
          ].map((feature, index) => (
            <Card key={index} className="hover:border-accent/50 transition-all hover:-translate-y-1 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-display text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* Pricing */}
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <Card className="max-w-md mx-auto overflow-hidden border-2 border-primary/20 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-gold/10 rounded-full text-gold font-semibold text-sm mx-auto mb-4">
              <Sparkles className="w-4 h-4" />
              Most Popular Worldwide
            </div>
            <CardTitle className="font-display text-3xl">Global Solo Plan</CardTitle>
            <CardDescription className="text-lg">Everything to build your international brand</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-8">
              <span className="text-5xl font-bold gradient-text">₦1,000</span>
              <span className="text-muted-foreground text-lg">/month</span>
              <p className="text-sm text-muted-foreground mt-2">≈ $1.25 USD · Cancel anytime</p>
            </div>
            
            <ul className="space-y-3 mb-8 text-left max-w-sm mx-auto">
              {[
                "Professional global storefront",
                "Unlimited products & services",
                "International payment processing",
                "WhatsApp order delivery worldwide",
                "Auto-generated marketing designs",
                "Advanced order management",
                "Customer review system",
                "Global analytics dashboard"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            
            <div className="flex flex-col gap-3">
              <Link to="/auth/signup">
                <Button size="lg" className="w-full bg-gradient-to-r from-accent to-primary text-lg shadow-lg">
                  Start 7-Day Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="w-full border-primary/30 hover:bg-primary/5">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Try Global Demo First
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-4">No credit card required · 30-day money-back guarantee</p>
          </CardContent>
        </Card>
      </div>
    </section>
  </>
);

/* ================= CUSTOMER EXPERIENCE ================= */
const CustomerExperience = ({ offer }: { offer?: any }) => (
  <>
    {/* Hero Section */}
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
        <div className="space-y-6">
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Discover Authentic<br />
            <span className="gradient-text">Global Craftsmanship</span>
          </h2>
          
          <p className="text-lg text-muted-foreground">
            Shop directly from passionate creators and entrepreneurs around the world. Every purchase supports 
            real people building their dreams and sharing their unique talents with a global audience.
          </p>
          
          {/* Benefits */}
          <ul className="space-y-3">
            {[
              "Direct connection with global artisans",
              "100% verified independent businesses",
              "Secure international payments",
              "Worldwide shipping options",
              "Authentic customer reviews"
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
                      {offer.button_text || "Shop Global"}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="pt-4">
            <Link to="/shops">
              <Button size="lg" className="bg-gradient-to-r from-accent to-primary text-lg px-8">
                Explore Global Stores
                <Globe className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl rounded-3xl" />
          <img
            src={heroImage}
            alt="Customers shopping from global entrepreneurs"
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
            Why Shop Globally with SteerSolo?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience commerce that's personal, meaningful, and connects you directly with creators
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Users,
              title: "Real Creators",
              description: "Connect directly with the artisans and entrepreneurs behind every product."
            },
            {
              icon: Shield,
              title: "Verified Quality",
              description: "Every store is verified for authenticity and customer satisfaction."
            },
            {
              icon: Star,
              title: "Unique Finds",
              description: "Discover products and craftsmanship you won't find anywhere else."
            },
            {
              icon: MessageCircle,
              title: "Personal Service",
              description: "Message sellers directly for custom requests and personalized service."
            },
            {
              icon: Zap,
              title: "Global Delivery",
              description: "Fast, reliable shipping options to bring the world to your doorstep."
            },
            {
              icon: Heart,
              title: "Support Dreams",
              description: "Your purchase directly fuels entrepreneurship and creativity worldwide."
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
          Global Marketplace Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            "Global Fashion & Textiles",
            "Artisan Foods & Drinks",
            "Handcrafted Home Decor",
            "Digital Services Worldwide",
            "Traditional Arts & Crafts",
            "Wellness & Natural Products",
            "Tech & Innovation",
            "Cultural Experiences"
          ].map((category, index) => (
            <Card key={index} className="text-center hover:bg-accent/5 cursor-pointer transition-all hover:-translate-y-1">
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