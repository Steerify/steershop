import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Store, Zap, Shield, TrendingUp, Users, ShoppingBag, Star, MessageCircle, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AdirePattern, AdireDivider } from "@/components/patterns/AdirePattern";
import heroImage from "@/assets/hero-image.jpg";
import steersoloLogo from "@/assets/steersolo-logo.png";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [activeAudience, setActiveAudience] = useState<"customers" | "entrepreneurs">("customers");
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
      
      {/* Hero Section with Adire Pattern */}
      <section className="relative pt-28 pb-12 overflow-hidden">
        <AdirePattern variant="geometric" className="text-primary" opacity={0.6} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-10">
            {/* Floating badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full mb-6 animate-fade-up">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-accent font-semibold text-sm">Made for Nigerian Entrepreneurs</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-up stagger-1">
              {activeAudience === "customers" ? "Discover Amazing" : "Build Your"}
              <br />
              <span className="gradient-text">
                {activeAudience === "customers" ? "Local Businesses" : "Dream Business"}
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-up stagger-2">
              {activeAudience === "customers" 
                ? "Shop from trusted solo entrepreneurs in your community" 
                : "Turn your passion into profit with Africa's simplest store builder"}
            </p>
            
            {/* Audience Toggle */}
            <Tabs 
              value={activeAudience} 
              onValueChange={(value) => setActiveAudience(value as "customers" | "entrepreneurs")}
              className="w-full max-w-md mx-auto animate-fade-up stagger-3"
            >
              <TabsList className="grid w-full grid-cols-2 p-1.5 bg-muted/50 backdrop-blur-sm">
                <TabsTrigger 
                  value="customers" 
                  className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-lg transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="hidden sm:inline">I Want to</span> Shop
                </TabsTrigger>
                <TabsTrigger 
                  value="entrepreneurs" 
                  className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-lg transition-all"
                >
                  <Store className="w-4 h-4" />
                  <span className="hidden sm:inline">I Want to</span> Sell
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Dynamic Content Based on Audience */}
      {activeAudience === "customers" ? (
        <CustomerExperience offer={customerOffer} />
      ) : (
        <EntrepreneurExperience offer={entrepreneurOffer} />
      )}

      {/* Adire Divider */}
      <AdireDivider />

      {/* Unified CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
        <AdirePattern variant="circles" className="text-white" opacity={0.15} />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            {activeAudience === "customers" 
              ? "Ready to Shop Local?" 
              : "Ready to Launch Your Store?"}
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            {activeAudience === "customers"
              ? "Support real entrepreneurs and discover unique products in your community"
              : "Join hundreds of Nigerian entrepreneurs already growing their business with SteerSolo"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {activeAudience === "customers" ? (
              <>
                <Link to="/shops">
                  <Button size="lg" variant="secondary" className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5">
                    Explore Shops
                    <ShoppingBag className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50"
                  onClick={() => setActiveAudience("entrepreneurs")}
                >
                  I Want to Sell Instead
                  <Store className="ml-2 w-5 h-5" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth/signup">
                  <Button size="lg" variant="secondary" className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50"
                  onClick={() => setActiveAudience("customers")}
                >
                  I Want to Shop Instead
                  <ShoppingBag className="ml-2 w-5 h-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Customer-Focused Experience
const CustomerExperience = ({ offer }: { offer?: any }) => {
  return (
    <>
      {/* Hero for Customers */}
      <section className="relative py-12 md:py-16">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span className="text-accent font-semibold text-sm">Shop Local · Support Real People</span>
              </div>
              
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Discover the Heart
                <br />
                <span className="gradient-text">of Nigerian</span>
                <br />
                Entrepreneurship
              </h2>
              
              {offer && (
                <Card className="card-african border-0 shadow-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-95" />
                  <CardContent className="relative z-10 p-6 text-primary-foreground">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-display font-bold mb-2">{offer.title}</h3>
                        <p className="opacity-90">
                          {offer.description}
                          {offer.code && <> Use code: <strong className="text-gold">{offer.code}</strong></>}
                        </p>
                        {offer.valid_until && (
                          <p className="text-sm opacity-80 mt-1">
                            Valid until {format(new Date(offer.valid_until), "MMM dd, yyyy")}
                          </p>
                        )}
                      </div>
                      <Button variant="secondary" className="shadow-lg" asChild>
                        <Link to={offer.button_link}>
                          {offer.button_text}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                Shop directly from passionate Nigerian entrepreneurs. Every purchase supports 
                real people building their dreams from the ground up.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/shops">
                  <Button size="lg" className="bg-gradient-to-r from-accent to-primary hover:opacity-90 text-base md:text-lg px-6 md:px-8 shadow-lg shadow-accent/25 hover:-translate-y-0.5 transition-all">
                    Browse Shops
                    <ShoppingBag className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/auth/signup">
                  <Button size="lg" variant="outline" className="text-base md:text-lg px-6 md:px-8 hover:bg-muted">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative animate-fade-up stagger-2">
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl rounded-full" />
              <div className="absolute inset-0 adire-pattern rounded-2xl" />
              <img 
                src={heroImage} 
                alt="Customers shopping from local Nigerian businesses"
                className="relative rounded-2xl shadow-2xl w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits for Customers */}
      <section className="relative py-16 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />
        <AdirePattern variant="dots" className="text-primary" opacity={0.4} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Why Shop with SteerSolo?</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience shopping that's personal, authentic, and meaningful
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: Users, title: "Shop Real People", desc: "Connect directly with the entrepreneurs behind every product. No big corporations." },
              { icon: MessageCircle, title: "Direct Communication", desc: "Chat with shop owners on WhatsApp. Ask questions, get recommendations, build relationships." },
              { icon: Shield, title: "Trusted & Verified", desc: "Every shop is verified. Read real reviews from real customers." },
              { icon: Star, title: "Unique Finds", desc: "Discover products you won't find anywhere else. Support local creativity and innovation." },
              { icon: Zap, title: "Local Delivery", desc: "Fast, reliable delivery within Nigeria. Support your local economy." },
              { icon: TrendingUp, title: "AI Recommendations", desc: "Get personalized shop recommendations based on your interests and preferences." },
            ].map((item, index) => (
              <Card 
                key={index} 
                className="card-african border-2 border-border hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 group bg-card/80 backdrop-blur-sm animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="w-14 h-14 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <item.icon className="w-7 h-7 text-accent" />
                  </div>
                  <CardTitle className="font-display text-xl">{item.title}</CardTitle>
                  <CardDescription className="text-base">
                    {item.desc}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

// Entrepreneur-Focused Experience
const EntrepreneurExperience = ({ offer }: { offer?: any }) => {
  return (
    <>
      {/* Hero for Entrepreneurs */}
      <section className="relative py-12 md:py-16">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-full">
                <Store className="w-4 h-4 text-gold" />
                <span className="text-gold font-semibold text-sm">₦1,000/month · Start in Minutes</span>
              </div>
              
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Your Business,
                <br />
                <span className="gradient-text">Your Brand,</span>
                <br />
                Your Freedom
              </h2>
              
              {offer && (
                <Card className="card-african border-0 shadow-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-95" />
                  <CardContent className="relative z-10 p-6 text-primary-foreground">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-display font-bold mb-2">{offer.title}</h3>
                        <p className="opacity-90">
                          {offer.description}
                          {offer.code && <> Use code: <strong className="text-gold">{offer.code}</strong></>}
                        </p>
                        {offer.valid_until && (
                          <p className="text-sm opacity-80 mt-1">
                            Valid until {format(new Date(offer.valid_until), "MMM dd, yyyy")}
                          </p>
                        )}
                      </div>
                      <Button variant="secondary" className="shadow-lg" asChild>
                        <Link to={offer.button_link}>
                          {offer.button_text}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                SteerSolo empowers Nigerian solo entrepreneurs with a simple, professional, 
                and affordable online store. Look like a pro, even if it's just you.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth/signup">
                  <Button size="lg" className="bg-gradient-to-r from-accent to-primary hover:opacity-90 text-base md:text-lg px-6 md:px-8 shadow-lg shadow-accent/25 hover:-translate-y-0.5 transition-all">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/my-store">
                  <Button size="lg" variant="outline" className="text-base md:text-lg px-6 md:px-8 hover:bg-muted">
                    See Demo
                  </Button>
                </Link>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-6 md:gap-8 pt-4">
                {[
                  { value: "500+", label: "Active Shops" },
                  { value: "10k+", label: "Products Sold" },
                  { value: "₦1k", label: "Per Month" },
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative animate-fade-up stagger-2">
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl rounded-full" />
              <div className="absolute inset-0 adire-circles rounded-2xl" />
              <img 
                src={heroImage} 
                alt="Nigerian entrepreneurs managing their online store"
                className="relative rounded-2xl shadow-2xl w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features for Entrepreneurs */}
      <section className="relative py-16 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />
        <AdirePattern variant="lines" className="text-primary" opacity={0.4} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional tools to run your business like a boss
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: Store, title: "Professional Storefront", desc: "A beautiful online store that makes you look established, even if you just started." },
              { icon: Zap, title: "5-Minute Setup", desc: "No technical skills needed. Add your products and start selling in minutes." },
              { icon: Shield, title: "Nigerian Payments", desc: "Accept payments with Paystack. Get paid directly to your Nigerian bank account." },
              { icon: TrendingUp, title: "Order Management", desc: "Track orders, manage inventory, and keep your customers happy." },
              { icon: MessageCircle, title: "WhatsApp Integration", desc: "Connect with customers on WhatsApp for seamless communication." },
              { icon: Star, title: "Customer Reviews", desc: "Build trust with verified customer reviews on your products." },
            ].map((item, index) => (
              <Card 
                key={index} 
                className="card-african border-2 border-border hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 group bg-card/80 backdrop-blur-sm animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="font-display text-xl">{item.title}</CardTitle>
                  <CardDescription className="text-base">
                    {item.desc}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-16 md:py-20">
        <div className="container mx-auto px-4">
          <Card className="card-african max-w-2xl mx-auto overflow-hidden">
            <div className="absolute inset-0 adire-pattern opacity-30" />
            <CardHeader className="relative z-10 text-center pb-2">
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-gold/10 rounded-full text-gold font-semibold text-sm mx-auto mb-4">
                <Sparkles className="w-4 h-4" />
                Most Popular
              </div>
              <CardTitle className="font-display text-3xl md:text-4xl">Solo Plan</CardTitle>
              <CardDescription className="text-lg">Everything you need to run your business</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 text-center pb-8">
              <div className="my-8">
                <span className="text-5xl md:text-6xl font-bold gradient-text">₦1,000</span>
                <span className="text-muted-foreground text-lg">/month</span>
              </div>
              
              <ul className="text-left max-w-sm mx-auto space-y-4 mb-8">
                {[
                  "Professional storefront",
                  "Unlimited products",
                  "Order management",
                  "Paystack payments",
                  "WhatsApp integration",
                  "Customer reviews",
                  "Analytics dashboard",
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link to="/auth/signup">
                <Button size="lg" className="w-full max-w-sm bg-gradient-to-r from-accent to-primary hover:opacity-90 text-lg shadow-lg shadow-accent/25">
                  Start 7-Day Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-4">No credit card required</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
};

export default Index;
