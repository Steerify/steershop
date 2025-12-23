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
  ArrowLeft,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdirePattern, AdireDivider } from "@/components/patterns/AdirePattern";
import heroImage from "@/assets/hero-image.jpg";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

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
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-accent font-semibold text-sm">Built for Nigerian Online Vendors</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 leading-tight">
              {activeAudience === "entrepreneurs" ? (
                <>
                  Your Hustle is Bigger
                  <br />
                  <span className="gradient-text">Than WhatsApp</span>
                </>
              ) : (
                <>
                  Shop from Real
                  <br />
                  <span className="gradient-text">Nigerian Entrepreneurs</span>
                </>
              )}
            </h1>
            
            {/* Subheading */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {activeAudience === "entrepreneurs" 
                ? "Turn your WhatsApp hustle into a professional brand. Get a storefront, accept payments, and manage orders — no website needed."
                : "Discover unique products from passionate local sellers. Shop directly with trust and ease."
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
                    <Button size="lg" className="bg-gradient-to-r from-accent to-primary text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                      Start Free Trial
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/shops">
                    <Button size="lg" className="bg-gradient-to-r from-accent to-primary text-lg px-8 py-6 shadow-lg hover:shadow-xl">
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
                  className="bg-gradient-to-r from-accent to-primary group-hover:opacity-90 shadow-md"
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
        <EntrepreneurExperience offer={entrepreneurOffer} />
      ) : (
        <CustomerExperience offer={customerOffer} />
      )}

      <AdireDivider />

      {/* ================= UNIFIED VALUE PROPOSITION ================= */}
      <section className="relative py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Why Choose SteerSolo?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The simplest way to turn your hustle into a real business
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Smartphone,
                title: "WhatsApp-First",
                description: "Orders come straight to your WhatsApp. No apps to monitor."
              },
              {
                icon: Clock,
                title: "60-Second Setup",
                description: "Start selling in under a minute. No technical skills needed."
              },
              {
                icon: Shield,
                title: "Trust & Credibility",
                description: "Look professional, earn customer trust, increase sales."
              },
              {
                icon: Target,
                title: "Built for Nigeria",
                description: "Paystack payments, Naira pricing, local delivery focus."
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

      {/* ================= FINAL CTA ================= */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
        <AdirePattern variant="circles" className="text-white" opacity={0.15} />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to {activeAudience === "entrepreneurs" ? "Upgrade Your Hustle?" : "Shop Local?"}
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            {activeAudience === "entrepreneurs"
              ? "Join thousands of Nigerian vendors building real brands with SteerSolo"
              : "Support real entrepreneurs and discover amazing products in your community"
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
              className="text-lg px-10 py-6 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setActiveAudience(activeAudience === "entrepreneurs" ? "customers" : "entrepreneurs")}
            >
              {activeAudience === "entrepreneurs" ? "I Want to Shop" : "I Want to Sell"}
            </Button>
          </div>
          
          <p className="mt-6 text-primary-foreground/80">
            {activeAudience === "entrepreneurs" ? "No credit card required · 7-day free trial" : "100% secure · Direct seller support"}
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
            From WhatsApp Chaos to<br />
            <span className="gradient-text">Professional Business</span>
          </h2>
          
          <p className="text-lg text-muted-foreground">
            Stop losing sales in endless chats. Get a clean storefront, accept payments with Paystack, 
            and manage orders efficiently — all while keeping WhatsApp as your communication hub.
          </p>
          
          {/* Quick Benefits */}
          <ul className="space-y-3">
            {[
              "No website or hosting needed",
              "Paystack + manual payment options",
              "Orders delivered to your WhatsApp",
              "Professional promo designs auto-generated",
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
              <Button size="lg" className="bg-gradient-to-r from-accent to-primary text-lg px-8">
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
            Everything You Need to Sell Smart
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional tools designed for solo entrepreneurs
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Store,
              title: "Instant Storefront",
              description: "Professional-looking store in minutes. No design skills needed."
            },
            {
              icon: Zap,
              title: "Paystack Payments",
              description: "Accept cards, transfers, USSD. Get paid directly to your bank."
            },
            {
              icon: MessageCircle,
              title: "WhatsApp Orders",
              description: "Orders come straight to your WhatsApp. No missed sales."
            },
            {
              icon: TrendingUp,
              title: "Auto-Generated Designs",
              description: "Professional posters and flyers created automatically."
            },
            {
              icon: Shield,
              title: "Build Trust",
              description: "Look established and credible to increase conversion."
            },
            {
              icon: Heart,
              title: "Made for You",
              description: "Built specifically for Nigerian online vendors."
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

    {/* Pricing */}
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <Card className="max-w-md mx-auto overflow-hidden border-2 border-primary/20">
          <CardHeader className="text-center pb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-gold/10 rounded-full text-gold font-semibold text-sm mx-auto mb-4">
              <Sparkles className="w-4 h-4" />
              Perfect for Solo Vendors
            </div>
            <CardTitle className="font-display text-3xl">Solo Plan</CardTitle>
            <CardDescription className="text-lg">Everything to run your business</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-8">
              <span className="text-5xl font-bold gradient-text">₦1,000</span>
              <span className="text-muted-foreground text-lg">/month</span>
              <p className="text-sm text-muted-foreground mt-2">Less than ₦34 per day</p>
            </div>
            
            <ul className="space-y-3 mb-8 text-left max-w-sm mx-auto">
              {[
                "Professional storefront",
                "Unlimited products",
                "Paystack payments",
                "WhatsApp order delivery",
                "Auto-generated designs",
                "Order management",
                "Customer reviews",
                "Basic analytics"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            
            <div className="flex flex-col gap-3">
              <Link to="/auth/signup">
                <Button size="lg" className="w-full bg-gradient-to-r from-accent to-primary text-lg">
                  Start 7-Day Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="w-full">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Try Demo First
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-4">No credit card required</p>
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
            Shop from Real<br />
            <span className="gradient-text">Local Entrepreneurs</span>
          </h2>
          
          <p className="text-lg text-muted-foreground">
            Discover unique products from passionate Nigerian sellers. Every purchase directly supports 
            real people building their dreams from the ground up.
          </p>
          
          {/* Benefits */}
          <ul className="space-y-3">
            {[
              "Direct communication with sellers",
              "100% verified Nigerian businesses",
              "Secure Paystack payments",
              "Local delivery options",
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
              <Button size="lg" className="bg-gradient-to-r from-accent to-primary text-lg px-8">
                Browse Local Stores
                <ShoppingBag className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl rounded-3xl" />
          <img
            src={heroImage}
            alt="Customers shopping from Nigerian businesses"
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
            Experience shopping that's personal, secure, and meaningful
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Users,
              title: "Real People",
              description: "Connect directly with entrepreneurs, not corporations."
            },
            {
              icon: Shield,
              title: "Verified Stores",
              description: "Every seller is verified for your peace of mind."
            },
            {
              icon: Star,
              title: "Unique Finds",
              description: "Discover products you won't find anywhere else."
            },
            {
              icon: MessageCircle,
              title: "Direct Chat",
              description: "Message sellers on WhatsApp for personalized service."
            },
            {
              icon: Zap,
              title: "Local Delivery",
              description: "Fast, reliable delivery within Nigeria."
            },
            {
              icon: Heart,
              title: "Support Dreams",
              description: "Your purchase directly supports local entrepreneurs."
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
          Popular Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            "Fashion & Clothing",
            "Beauty & Skincare",
            "Food & Drinks",
            "Phone Accessories",
            "Home & Living",
            "Digital Services",
            "Arts & Crafts",
            "Fitness & Wellness"
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