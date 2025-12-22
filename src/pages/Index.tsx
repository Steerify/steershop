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
  CreditCard,
  Link as LinkIcon,
  Package,
  Instagram,
  TrendingDown
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

  const entrepreneurOffer = offers.find(o => o.target_audience === "entrepreneurs");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section - Focused on Sellers First */}
      <section className="relative pt-24 pb-16 md:pt-28 md:pb-20 overflow-hidden">
        <AdirePattern variant="geometric" className="text-primary" opacity={0.6} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 animate-fade-up">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-accent font-semibold text-sm">Built for Nigerian vendors • No coding • No hosting</span>
              </div>
              
              {/* Main Headline */}
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Turn Your WhatsApp Hustle
                <br />
                <span className="gradient-text">Into a Real Online Store</span>
                <br />
                <span className="text-lg md:text-xl text-muted-foreground">— In 60 Seconds</span>
              </h1>
              
              {/* Subheadline */}
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                Stop losing orders, repeating prices, and looking unprofessional.
                SteerSolo gives you a clean storefront, payments, and WhatsApp orders — instantly.
              </p>
              
              {/* Special Offer */}
              {entrepreneurOffer && (
                <Card className="border-0 shadow-xl overflow-hidden bg-gradient-to-r from-primary/90 to-accent/90">
                  <CardContent className="p-4 md:p-6 text-primary-foreground">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-display font-bold mb-1">{entrepreneurOffer.title}</h3>
                        <p className="text-sm md:text-base opacity-90">
                          {entrepreneurOffer.description}
                          {entrepreneurOffer.code && <> Use code: <strong className="text-gold">{entrepreneurOffer.code}</strong></>}
                        </p>
                      </div>
                      <Button variant="secondary" className="shadow-lg whitespace-nowrap" asChild>
                        <Link to={entrepreneurOffer.button_link}>
                          {entrepreneurOffer.button_text}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/auth/signup">
                  <Button size="lg" className="bg-gradient-to-r from-accent to-primary hover:opacity-90 text-lg px-8 shadow-lg shadow-accent/25 hover:-translate-y-0.5 transition-all h-14">
                    Create My Store Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button size="lg" variant="outline" className="text-lg px-8 h-14 hover:bg-muted">
                    See How It Works (30 sec)
                  </Button>
                </Link>
              </div>
              
              {/* Quick Stats */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">No credit card needed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-accent" />
                  <span className="text-sm">Set up in 5 minutes</span>
                </div>
              </div>
            </div>
            
            {/* Visual Demo */}
            <div className="relative animate-fade-up stagger-2">
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl rounded-full" />
              <div className="grid grid-cols-2 gap-4">
                {/* Before - WhatsApp Chaos */}
                <Card className="border-2 border-destructive/20 bg-destructive/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageCircle className="w-5 h-5 text-destructive" />
                    <span className="font-bold text-destructive">WhatsApp Chaos</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="bg-muted p-2 rounded">"Hi price?"</div>
                    <div className="bg-muted p-2 rounded">"Send account details"</div>
                    <div className="bg-muted p-2 rounded">"Still available?"</div>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">• Lost orders • No prices • Manual stress</div>
                </Card>
                
                {/* After - Clean Store */}
                <Card className="border-2 border-accent/20 bg-accent/5 p-4 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Store className="w-5 h-5 text-accent" />
                    <span className="font-bold text-accent">SteerSolo Store</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="bg-primary/10 p-2 rounded flex justify-between">
                      <span>Beautiful dress</span>
                      <span className="font-bold">₦15,000</span>
                    </div>
                    <div className="bg-primary/10 p-2 rounded flex justify-between">
                      <span>Handbag</span>
                      <span className="font-bold">₦8,000</span>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-accent">• Clear prices • Instant orders • Professional</div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Amplification Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              If You Sell on WhatsApp, You've Faced This
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              This is not your fault. You're selling without structure.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: TrendingDown, text: "Customers keep asking for prices" },
              { icon: Package, text: "Orders get lost in chats" },
              { icon: MessageCircle, text: "You copy-paste same messages daily" },
              { icon: Shield, text: "You look unserious even though your work is good" },
              { icon: Users, text: "Customers don't trust easily" },
              { icon: ShoppingBag, text: "You lose buyers who say 'I'll get back'" },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-card rounded-lg border">
                <item.icon className="w-5 h-5 text-destructive mt-1 flex-shrink-0" />
                <span className="text-sm md:text-base">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transformation Section */}
      <section className="relative py-20 overflow-hidden">
        <AdirePattern variant="dots" className="text-primary" opacity={0.4} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              SteerSolo Fixes All of This — Instantly
            </h2>
            <p className="text-xl text-muted-foreground">
              We turn hustlers into brands.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Before */}
            <Card className="border-destructive/30 bg-destructive/5">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-destructive" />
                  </div>
                  <CardTitle className="text-destructive">The WhatsApp Hustle</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "WhatsApp chaos & confusion",
                    "No fixed prices anywhere",
                    "Zero brand identity",
                    "Manual everything = stress",
                    "Customers can't see all products",
                    "Payment delays & trust issues",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center">
                        <svg className="w-3 h-3 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            {/* After */}
            <Card className="border-accent/30 bg-accent/5 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-accent" />
                  </div>
                  <CardTitle className="text-accent">With SteerSolo</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "One clean, professional store link",
                    "Clear prices for every product",
                    "Your own brand identity",
                    "Paystack + manual payments",
                    "Orders sent straight to WhatsApp",
                    "Customers trust & buy faster",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-accent" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8 pt-6 border-t">
                  <Link to="/auth/signup">
                    <Button className="w-full bg-gradient-to-r from-accent to-primary">
                      Start My Transformation
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              How It Works (Seriously Simple)
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              No tech skills needed. Just follow these 4 steps.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                step: "1",
                icon: Store,
                title: "Create your store",
                description: "Add products, prices, and services in minutes"
              },
              {
                step: "2",
                icon: CreditCard,
                title: "Choose payment",
                description: "Paystack or manual transfer — you choose"
              },
              {
                step: "3",
                icon: LinkIcon,
                title: "Share one link",
                description: "WhatsApp, Instagram, TikTok, anywhere"
              },
              {
                step: "4",
                icon: Smartphone,
                title: "Get WhatsApp orders",
                description: "No dashboard stress. Customers message you directly"
              }
            ].map((item, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold gradient-text">{item.step}</span>
                  </div>
                  <item.icon className="w-8 h-8 mx-auto mb-4 text-primary" />
                  <h3 className="font-display text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/auth/signup">
              <Button size="lg" className="text-lg px-8">
                Start Free — No Card Needed
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why SteerSolo is Different */}
      <section className="relative py-20 bg-muted/30 overflow-hidden">
        <AdirePattern variant="lines" className="text-primary" opacity={0.3} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Why Online Vendors Choose SteerSolo
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Other platforms build websites. SteerSolo builds income systems.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "No website hosting fees",
                "No expensive domains",
                "No developers needed",
                "No complex setup",
                "Built for Nigerian selling style",
                "Orders go where you already work — WhatsApp",
                "Paystack + manual payments",
                "Auto posters to help you sell more"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Growth Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Look Bigger. Sell Faster. Grow Confidently.
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Customers trust structured businesses. When buyers see clear prices, payment options, 
              and a clean store — they buy faster.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Star,
                  title: "Verified Reviews",
                  description: "Build trust with real customer feedback"
                },
                {
                  icon: Shield,
                  title: "Professional Storefront",
                  description: "Look established, even if you just started"
                },
                {
                  icon: TrendingUp,
                  title: "Sell More",
                  description: "Clear prices = faster decisions = more sales"
                }
              ].map((item, index) => (
                <Card key={index} className="text-center border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Professional Store. One Flat Price.
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to sell like a pro
            </p>
          </div>
          
          <Card className="max-w-md mx-auto overflow-hidden shadow-2xl border-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-95" />
            <CardHeader className="relative z-10 text-center pb-2">
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/20 rounded-full text-white font-semibold text-sm mx-auto mb-4">
                <Sparkles className="w-4 h-4" />
                Most Popular
              </div>
              <CardTitle className="font-display text-3xl md:text-4xl text-white">Solo Plan</CardTitle>
              <CardDescription className="text-white/90 text-lg">Turn your hustle into a business</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 text-center pb-8 pt-6">
              <div className="my-6">
                <span className="text-5xl md:text-6xl font-bold text-white">₦1,000</span>
                <span className="text-white/80 text-lg">/month</span>
                <p className="text-white/70 text-sm mt-2">No setup fees • Cancel anytime</p>
              </div>
              
              <ul className="text-left max-w-sm mx-auto space-y-3 mb-8 text-white/90">
                {[
                  "Professional storefront",
                  "Unlimited products",
                  "Order management",
                  "Paystack payments",
                  "WhatsApp integration",
                  "Customer reviews",
                  "Analytics dashboard",
                  "Auto social posters",
                  "Custom store link",
                  "24/7 support"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mb-6 p-4 bg-white/10 rounded-lg">
                <p className="text-white font-semibold">
                  ₦1,000 is small compared to what you lose daily from missed orders
                </p>
              </div>
              
              <Link to="/auth/signup">
                <Button size="lg" className="w-full bg-white text-primary hover:bg-white/90 text-lg font-bold">
                  Start 7-Day Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <p className="text-white/70 text-sm mt-4">No credit card required • No commitment</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Built For Real Nigerian Hustlers
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              If you sell anything online — SteerSolo is for you.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { emoji: "👗", title: "Fashion Vendors", description: "Clothes, shoes, accessories" },
              { emoji: "🍰", title: "Bakers & Caterers", description: "Cakes, small chops, snacks" },
              { emoji: "✨", title: "Skincare & Beauty", description: "Natural products, cosmetics" },
              { emoji: "📱", title: "Phone Accessories", description: "Cases, chargers, gadgets" },
              { emoji: "🎨", title: "Creators & Artists", description: "Art, crafts, digital products" },
              { emoji: "🏠", title: "Home Businesses", description: "Homemade goods, services" },
            ].map((item, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{item.emoji}</div>
                  <h3 className="font-display text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-lg text-muted-foreground mb-6">
              Your business deserves more than WhatsApp chaos.
            </p>
            <Link to="/auth/signup">
              <Button size="lg" className="text-lg px-8 bg-gradient-to-r from-accent to-primary">
                Create My Store Now
                <Store className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">Takes less than 60 seconds</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
        <AdirePattern variant="circles" className="text-white" opacity={0.15} />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Stop the WhatsApp Chaos?
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of Nigerian entrepreneurs who turned their hustle into a real business.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/shops">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10">
                See Example Stores
                <ShoppingBag className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;