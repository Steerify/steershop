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
  X,
  Check,
  AlertCircle,
  Target,
  Crown,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdirePattern, AdireDivider } from "@/components/patterns/AdirePattern";
import heroImage from "@/assets/hero-image.jpg";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [activeAudience, setActiveAudience] = useState<"customers" | "entrepreneurs">("entrepreneurs");
  const [offers, setOffers] = useState<any[]>([]);
  const [currentPainPoint, setCurrentPainPoint] = useState(0);
  
  const painPoints = [
    "Lost orders in chats",
    "Manual copy/paste prices",
    "No professional look",
    "WhatsApp chaos",
    "Buyer distrust"
  ];
  
  // Simple typewriter effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPainPoint((prev) => (prev + 1) % painPoints.length);
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
      
      {/* ================= COMPELLING HERO SECTION ================= */}
      <section className="relative pt-20 md:pt-24 pb-12 md:pb-16 overflow-hidden">
        <AdirePattern variant="geometric" className="text-primary" opacity={0.6} />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Left Column - Main Message */}
              <div className="space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full mb-4">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-accent font-semibold text-sm">MADE FOR NIGERIAN HUSTLERS</span>
                </div>
                
                {/* Main Heading */}
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Stop{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-accent animate-gradient">
                    {painPoints[currentPainPoint]}
                  </span>
                  <br />
                  <span className="text-primary">Get a Real Store in 60 Seconds</span>
                </h1>
                
                {/* Subheading */}
                <p className="text-lg md:text-xl text-muted-foreground">
                  SteerSolo turns your WhatsApp hustle into a professional online shop that customers trust.
                  No website needed. No designer needed. Just sales.
                </p>
                
                {/* Pain Point Solution */}
                <div className="space-y-3">
                  {[
                    "✓ Replace blurry WhatsApp photos with clean product listings",
                    "✓ Stop losing orders in endless chats",
                    "✓ Build instant trust with professional storefront",
                    "✓ Accept payments via Paystack + manual transfer",
                    "✓ Get orders straight to your WhatsApp"
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
                  No credit card required • No technical skills needed
                </p>
              </div>
              
              {/* Right Column - Comparison */}
              <div className="space-y-6">
                <Card className="border-2 border-primary/20 shadow-xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-5 h-5 text-accent" />
                      <CardTitle className="text-xl">Why SteerSolo Beats Everything Else</CardTitle>
                    </div>
                    <CardDescription>Perfect for Nigerian social sellers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      {
                        platform: "WhatsApp Only",
                        issue: "Lost orders, messy chats",
                        solution: "✓ Organized store + WhatsApp orders"
                      },
                      {
                        platform: "Shopify",
                        issue: "Too complex, needs website",
                        solution: "✓ 60-second setup, no hosting"
                      },
                      {
                        platform: "Jumia/Konga",
                        issue: "Price wars, high fees",
                        solution: "✓ Your own store, no competition"
                      },
                      {
                        platform: "Instagram Shops",
                        issue: "Limited branding, weak trust",
                        solution: "✓ Professional storefront"
                      }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-semibold text-foreground">{item.platform}</div>
                          <div className="text-sm text-muted-foreground">{item.issue}</div>
                        </div>
                        <div className="text-sm text-green-600 font-medium">{item.solution}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card p-4 rounded-xl border shadow-sm">
                    <div className="text-2xl font-bold text-primary">60 sec</div>
                    <div className="text-sm text-muted-foreground">Store setup time</div>
                  </div>
                  <div className="bg-card p-4 rounded-xl border shadow-sm">
                    <div className="text-2xl font-bold text-primary">₦1,000/mo</div>
                    <div className="text-sm text-muted-foreground">Less than Jumia fees</div>
                  </div>
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
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold mb-1 text-foreground">See Exactly How It Works</h3>
                    <p className="text-muted-foreground max-w-2xl">
                      Experience a real SteerSolo store — just like yours would look.
                      No signup needed. See why sellers switch from WhatsApp chaos.
                    </p>
                  </div>
                </div>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-accent to-primary text-white group-hover:opacity-90 shadow-md"
                >
                  View Interactive Demo
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

      {/* ================= WHY CHOOSE STEERSOLO ================= */}
      <section className="relative py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full mb-4">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-accent font-semibold">DESIGNED FOR HOW NIGERIANS SELL</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Everything Your Hustle Needs. Nothing It Doesn't.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We built SteerSolo specifically for Nigerian social sellers — not as a global template
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: "60-Second Setup",
                description: "Launch while your customer waits. No tech skills needed.",
                color: "from-blue-500/20 to-cyan-500/20"
              },
              {
                icon: MessageCircle,
                title: "WhatsApp-First Design",
                description: "Orders come to WhatsApp. No dashboard monitoring needed.",
                color: "from-green-500/20 to-emerald-500/20"
              },
              {
                icon: Shield,
                title: "Instant Trust",
                description: "Professional store = higher prices + more sales.",
                color: "from-purple-500/20 to-violet-500/20"
              },
              {
                icon: Zap,
                title: "Paystack + Manual",
                description: "How Nigerians actually pay. No foreign payment headaches.",
                color: "from-orange-500/20 to-amber-500/20"
              },
              {
                icon: Sparkles,
                title: "Auto Marketing",
                description: "Professional posters without designer costs.",
                color: "from-pink-500/20 to-rose-500/20"
              },
              {
                icon: Store,
                title: "Your Brand, Not Ours",
                description: "Own your customers. No marketplace competition.",
                color: "from-primary/20 to-accent/20"
              }
            ].map((item, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group">
                <CardContent className="p-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2 text-center">{item.title}</h3>
                  <p className="text-muted-foreground text-center">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ================= COMPETITOR COMPARISON ================= */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-4">
              Why Sellers Switch to SteerSolo
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how we solve the real problems other platforms ignore
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-card rounded-xl shadow-lg">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left font-bold">What You Need</th>
                  <th className="p-4 text-center">
                    <div className="inline-flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      WhatsApp Only
                    </div>
                  </th>
                  <th className="p-4 text-center">Shopify</th>
                  <th className="p-4 text-center">Jumia/Konga</th>
                  <th className="p-4 text-center">
                    <div className="inline-flex items-center gap-2 text-accent">
                      <Crown className="w-4 h-4" />
                      SteerSolo
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    feature: "Setup Time",
                    whatsapp: "Instant",
                    shopify: "Hours/Days",
                    marketplace: "Days",
                    steersolo: "60 Seconds"
                  },
                  {
                    feature: "Professional Look",
                    whatsapp: "❌ Messy",
                    shopify: "✅ Excellent",
                    marketplace: "⚠️ Basic",
                    steersolo: "✅ Excellent"
                  },
                  {
                    feature: "Nigerian Payments",
                    whatsapp: "✅ Manual only",
                    shopify: "⚠️ Complex",
                    marketplace: "✅ Yes",
                    steersolo: "✅ Paystack + Manual"
                  },
                  {
                    feature: "Your Own Customers",
                    whatsapp: "✅ Yes",
                    shopify: "✅ Yes",
                    marketplace: "❌ Platform owns them",
                    steersolo: "✅ Yes"
                  },
                  {
                    feature: "Monthly Cost",
                    whatsapp: "Free",
                    shopify: "₦15,000+",
                    marketplace: "Fees per sale",
                    steersolo: "₦1,000 flat"
                  },
                  {
                    feature: "Marketing Tools",
                    whatsapp: "❌ None",
                    shopify: "❌ Extra cost",
                    marketplace: "⚠️ Limited",
                    steersolo: "✅ Included"
                  }
                ].map((row, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">{row.feature}</td>
                    <td className="p-4 text-center">{row.whatsapp}</td>
                    <td className="p-4 text-center">{row.shopify}</td>
                    <td className="p-4 text-center">{row.marketplace}</td>
                    <td className="p-4 text-center font-bold text-accent bg-accent/5">{row.steersolo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              <Check className="w-4 h-4 text-green-500 inline mr-2" />
              SteerSolo combines the best of all platforms without the headaches
            </p>
          </div>
        </div>
      </section>

      {/* ================= REAL STORIES ================= */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              From WhatsApp Hustle to Real Business
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real sellers. Real results.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Amaka's Ankara Fashion",
                before: "❌ Blurry WhatsApp photos",
                beforeSales: "3-5 sales/week",
                after: "✅ Professional store",
                afterSales: "15-20 sales/week",
                quote: "Customers now pay without bargaining because my store looks legit"
              },
              {
                name: "Tunde's Phone Accessories",
                before: "❌ Lost orders in chats",
                beforeSales: "Frequent mix-ups",
                after: "✅ Organized orders",
                afterSales: "100% order accuracy",
                quote: "SteerSolo saved me 2 hours daily of tracking orders"
              },
              {
                name: "Chioma's Home Baking",
                before: "❌ Manual price lists",
                beforeSales: "Constant errors",
                after: "✅ Clear pricing",
                afterSales: "50% faster orders",
                quote: "My baking business doubled in 2 months with a proper store"
              }
            ].map((story, index) => (
              <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-shadow">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h3 className="font-display text-xl font-bold mb-2">{story.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="text-red-600 font-medium">Before</span>
                      <span className="font-bold">{story.before}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-green-600 font-medium">After SteerSolo</span>
                      <span className="font-bold">{story.after}</span>
                    </div>
                  </div>
                  
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                    <p className="italic text-foreground">"{story.quote}"</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div>
                      <div className="text-sm text-muted-foreground">Before Sales</div>
                      <div className="font-bold text-red-600">{story.beforeSales}</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">After Sales</div>
                      <div className="font-bold text-green-600">{story.afterSales}</div>
                    </div>
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
            <Card className="border-2 border-primary/20 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-accent text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                MOST POPULAR
              </div>
              <CardHeader className="text-center pb-6 pt-8">
                <div className="inline-flex items-center gap-2 px-4 py-1 bg-accent/10 rounded-full text-accent font-semibold text-sm mx-auto mb-4">
                  <Target className="w-4 h-4" />
                  PERFECT FOR HUSTLERS
                </div>
                <CardTitle className="font-display text-3xl">Everything You Need</CardTitle>
                <CardDescription className="text-lg">Less than what you'd lose in WhatsApp chaos</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-8">
                  <span className="text-5xl font-bold text-primary">₦1,000</span>
                  <span className="text-muted-foreground text-lg">/month</span>
                  <p className="text-sm text-muted-foreground mt-2">
                    ≈ $1.10 • Less than 3% of one sale
                  </p>
                </div>
                
                <ul className="space-y-3 mb-8 text-left">
                  {[
                    "Professional store in 60 seconds",
                    "Unlimited products & categories",
                    "Paystack + manual payments",
                    "WhatsApp order delivery",
                    "Auto-generated marketing posters",
                    "Your own domain/store link",
                    "7-day free trial"
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
            
            {/* Price Comparison Note */}
            <div className="mt-6 p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-green-500 inline mr-1" />
                Cheaper than Jumia fees • Faster than Shopify • Smarter than WhatsApp-only
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
        <AdirePattern variant="circles" className="text-white" opacity={0.15} />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
              Your Hustle Deserves Better Than WhatsApp Chaos
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Stop losing sales to messy chats and unprofessional looks. Get the storefront 
              that makes customers trust you and pay more.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/signup">
                <Button size="lg" variant="secondary" className="text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5">
                  <Rocket className="w-5 h-5 mr-2" />
                  Launch Your Store Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              
              <Link to="/demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-10 py-6 border-white/30 text-white hover:bg-white/10"
                >
                  See It Live First
                </Button>
              </Link>
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
                <div className="text-sm">Your customers</div>
              </div>
            </div>
          </div>
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
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            From WhatsApp Seller to Business Owner
          </h2>
          <p className="text-lg text-muted-foreground">
            SteerSolo gives you the tools that big platforms have — but made simple for how Nigerians actually sell
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-6">
            {/* Problem/Solution Pairs */}
            <div className="space-y-6">
              {[
                {
                  problem: "❌ Blurry photos in WhatsApp status",
                  solution: "✅ Clean product listings with descriptions"
                },
                {
                  problem: "❌ Prices lost in chat history",
                  solution: "✅ Clear pricing that customers can see"
                },
                {
                  problem: "❌ Orders mixed up in messages",
                  solution: "✅ Organized order system to WhatsApp"
                },
                {
                  problem: "❌ Customers don't trust you",
                  solution: "✅ Professional store builds instant trust"
                },
                {
                  problem: "❌ Manual everything = time wasted",
                  solution: "✅ Auto posters, auto order tracking"
                }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 bg-card rounded-xl border">
                  <div className="flex-1">
                    <div className="font-medium text-foreground mb-1">{item.problem}</div>
                    <div className="text-green-600 font-medium">{item.solution}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Special Offer */}
            {offer && (
              <Card className="border-accent/30 bg-accent/5 mt-6">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{offer.title}</h3>
                      <p className="text-muted-foreground">
                        {offer.description}
                        {offer.code && (
                          <> Use code: <span className="font-bold text-accent">{offer.code}</span></>
                        )}
                      </p>
                    </div>
                    <Button asChild className="whitespace-nowrap">
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
                <Button size="lg" className="bg-gradient-to-r from-accent to-primary text-white text-lg px-8 w-full sm:w-auto">
                  Start Your Store Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="text-lg px-8 w-full sm:w-auto">
                  <Sparkles className="w-5 h-5 mr-2" />
                  View Live Example
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl rounded-3xl" />
            <div className="relative space-y-4">
              <img
                src={heroImage}
                alt="Professional SteerSolo storefront"
                className="rounded-2xl shadow-2xl w-full border"
              />
              <div className="text-center text-sm text-muted-foreground">
                This could be your store in 60 seconds
              </div>
            </div>
          </div>
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
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Shop from Real Entrepreneurs, Not Big Corporations
          </h2>
          <p className="text-lg text-muted-foreground">
            Discover amazing products from passionate sellers who care about quality and service
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-6">
            {/* Benefits */}
            <div className="space-y-6">
              {[
                {
                  icon: Shield,
                  title: "Verified Sellers",
                  description: "Every store is verified for your safety"
                },
                {
                  icon: MessageCircle,
                  title: "Direct WhatsApp Chat",
                  description: "Talk directly to sellers for personalized service"
                },
                {
                  icon: Star,
                  title: "Unique Products",
                  description: "Find items you won't see on Jumia or Konga"
                },
                {
                  icon: Heart,
                  title: "Support Real People",
                  description: "Your purchase directly supports entrepreneurs"
                },
                {
                  icon: Zap,
                  title: "Fast Response",
                  description: "Sellers respond quickly via WhatsApp"
                }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 bg-card rounded-xl border hover:border-primary/30 transition-colors">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold mb-1">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Special Offer */}
            {offer && (
              <Card className="border-accent/30 bg-accent/5 mt-6">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{offer.title}</h3>
                      <p className="text-muted-foreground">
                        {offer.description}
                        {offer.code && (
                          <> Use code: <span className="font-bold text-accent">{offer.code}</span></>
                        )}
                      </p>
                    </div>
                    <Button asChild className="whitespace-nowrap">
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
                <Button size="lg" className="bg-gradient-to-r from-accent to-primary text-white text-lg px-8 w-full">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Browse Stores Now
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl rounded-3xl" />
            <div className="relative">
              <img
                src={heroImage}
                alt="Customers shopping from passionate sellers"
                className="rounded-2xl shadow-2xl w-full border"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </>
);

export default Index;