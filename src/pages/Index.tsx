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
  CheckCircle,
  Clock,
  MessageCircle,
  DollarSign,
  Layers,
  ChevronRight,
  Star,
  Users,
  Check,
  AlertCircle,
  Search,
  Building,
  MessageSquare,
  Rocket,
  Sparkles,
  Heart,
  Globe,
  Target,
  Award,
  TrendingUp,
  Palette,
  BarChart,
  Share2,
  Tag,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { TypewriterEffect } from "@/components/TypewriterEffect";
import { FeaturedShopsBanner } from "@/components/FeaturedShopsBanner";
import { SocialProofStats } from "@/components/SocialProofStats";
import { UrgencyBanner } from "@/components/UrgencyBanner";
import { HomepageReviews } from "@/components/HomepageReviews";
import { HowItWorks } from "@/components/HowItWorks";
import { TrustBadgesSection } from "@/components/TrustBadgesSection";

const Index = () => {
  const [activeAudience, setActiveAudience] = useState<"entrepreneurs" | "customers">("entrepreneurs");

  const entrepreneurMilestones = [
    "From Chaotic Chats to Professional Sales",
    "From Blurry Photos to Clear Product Displays",
    "From Lost Orders to Organized Management",
    "From Price Negotiations to Transparent Pricing",
    "From Casual Vendor to Established Brand",
    "From Daily Hustle to Structured Business Growth"
  ];

  const customerDiscoveries = [
    "Discover Unique Products from Dedicated Entrepreneurs",
    "Shop Securely from Verified Businesses",
    "Enjoy Personalized Service and Support",
    "Find Items with Quality and Purpose",
    "Support Local Businesses with Every Purchase",
    "Experience Convenient and Reliable Shopping"
  ];

  return (
    <div className="min-h-screen bg-background">
      <UrgencyBanner />
      <Navbar />
      
      {/* SECTION 1: HERO WITH AUDIENCE TOGGLE */}
      <section className="relative pt-20 md:pt-24 pb-8 overflow-hidden">
        <AdirePattern variant="geometric" className="text-primary" opacity={0.6} />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Audience Toggle */}
          <div className="max-w-md mx-auto mb-8">
            <Tabs 
              value={activeAudience} 
              onValueChange={(value) => setActiveAudience(value as "entrepreneurs" | "customers")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 p-1.5 bg-card border shadow-lg backdrop-blur-sm">
                <TabsTrigger 
                  value="entrepreneurs" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent/20 data-[state=active]:to-primary/20 data-[state=active]:shadow-inner transition-all"
                >
                  <Store className="w-4 h-4" />
                  <span className="font-semibold">I'm a Seller</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="customers" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent/20 data-[state=active]:to-primary/20 data-[state=active]:shadow-inner transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="font-semibold">I'm a Shopper</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Dynamic Hero Content */}
          {activeAudience === "entrepreneurs" ? (
            <EntrepreneurHero milestones={entrepreneurMilestones} />
          ) : (
            <CustomerHero discoveries={customerDiscoveries} />
          )}
        </div>
      </section>

      {/* SECTION 2: PROBLEM → SOLUTION (Dynamic) */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {activeAudience === "entrepreneurs" ? "From Challenges to Solutions" : "From Standard Shopping to Better Experiences"}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {activeAudience === "entrepreneurs" 
                ? "Streamline your sales process for Nigerian businesses." 
                : "Enjoy reliable and personalized shopping."}
            </p>
          </div>
          <DynamicProblemSolution activeAudience={activeAudience} />
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <HowItWorks audience={activeAudience} />

      {/* SECTION 4: FEATURED SHOPS / GROWTH STORIES */}
      <FeaturedShopsBanner />
      <SocialProofStats />

      {/* SECTION 5: BENEFITS / OUTCOMES */}
      <DynamicBenefitsSection activeAudience={activeAudience} />

      {/* SECTION 6: REVIEWS */}
      <HomepageReviews audience={activeAudience} />

      {/* SECTION 7: PRICING / DISCOVERY CTA */}
      {activeAudience === "entrepreneurs" ? <PricingSection /> : <DiscoveryCTASection />}

      {/* SECTION 8: TRUST BADGES */}
      <TrustBadgesSection />

      {/* SECTION 9: FINAL CTA */}
      <FinalCTA activeAudience={activeAudience} onSwitch={() => setActiveAudience(activeAudience === "entrepreneurs" ? "customers" : "entrepreneurs")} />

      <Footer />
    </div>
  );
};

/* ================= ENTREPRENEUR HERO ================= */
const EntrepreneurHero = ({ milestones }: { milestones: string[] }) => (
  <div className="max-w-3xl mx-auto text-center space-y-6">
    <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">
        <TypewriterEffect 
          texts={milestones} 
          typingSpeed={80} 
          deletingSpeed={40} 
          pauseDuration={2500}
        />
      </span>
    </h1>
    <p className="text-lg md:text-xl text-muted-foreground">
      Set up a professional store in 60 seconds. Share one link. Receive orders via WhatsApp.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
      <Link to="/auth/signup">
        <Button size="lg" className="bg-gradient-to-r from-accent to-primary text-white text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 w-full sm:w-auto">
          Create Store (Free)
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </Link>
      <Link to="/demo">
        <Button size="lg" variant="outline" className="text-lg px-8 py-6 w-full sm:w-auto">
          <Search className="w-5 h-5 mr-2" />
          View Demo
        </Button>
      </Link>
    </div>
    <p className="text-sm text-muted-foreground">
      <CheckCircle className="w-4 h-4 text-green-500 inline mr-1" />
      No card required • 7-day free trial
    </p>
  </div>
);

/* ================= CUSTOMER HERO ================= */
const CustomerHero = ({ discoveries }: { discoveries: string[] }) => (
  <div className="max-w-3xl mx-auto text-center space-y-6">
    <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">
        <TypewriterEffect 
          texts={discoveries} 
          typingSpeed={80} 
          deletingSpeed={40} 
          pauseDuration={2500}
        />
      </span>
    </h1>
    <p className="text-lg md:text-xl text-muted-foreground">
      Browse products from Nigerian entrepreneurs. Get personalized service and secure payments.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
      <Link to="/shops">
        <Button size="lg" className="bg-gradient-to-r from-accent to-primary text-white text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 w-full sm:w-auto">
          Start Browsing
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </Link>
      <Link to="/demo">
        <Button size="lg" variant="outline" className="text-lg px-8 py-6 w-full sm:w-auto">
          <Search className="w-5 h-5 mr-2" />
          View Demo
        </Button>
      </Link>
    </div>
    <p className="text-sm text-muted-foreground">
      <CheckCircle className="w-4 h-4 text-green-500 inline mr-1" />
      Verified sellers • Secure payments • Easy returns
    </p>
  </div>
);

/* ================= DYNAMIC PROBLEM-SOLUTION ================= */
const DynamicProblemSolution = ({ activeAudience }: { activeAudience: string }) => {
  const problems = activeAudience === "entrepreneurs" ? [
    { title: "Disorganized Chats", desc: "Repeating information, tracking issues." },
    { title: "Lack of Trust", desc: "Informal communication reduces credibility." },
    { title: "Payment Challenges", desc: "Manual processes lead to errors." }
  ] : [
    { title: "Generic Products", desc: "Limited uniqueness and variety." },
    { title: "Impersonal Support", desc: "No direct seller interaction." },
    { title: "Quality Concerns", desc: "Uncertainty about product reliability." }
  ];

  const solutions = activeAudience === "entrepreneurs" ? [
    { title: "Single Store Link", desc: "Easy browsing and WhatsApp orders." },
    { title: "Professional Design", desc: "Builds customer confidence." },
    { title: "Integrated Payments", desc: "Supports Paystack and manual options." }
  ] : [
    { title: "Unique Offerings", desc: "Products with personal stories." },
    { title: "Direct Communication", desc: "Chat with sellers via WhatsApp." },
    { title: "Verified Quality", desc: "Sellers with satisfaction guarantees." }
  ];

  return (
    <>
      <div className="grid md:grid-cols-3 gap-6">
        {problems.map((item, idx) => (
          <Card key={idx}>
            <CardHeader><CardTitle className="text-xl">{item.title}</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">{item.desc}</p></CardContent>
          </Card>
        ))}
      </div>
      <div className="text-center my-8">
        <ChevronRight className="w-12 h-12 mx-auto text-primary rotate-90 md:rotate-0" />
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {solutions.map((item, idx) => (
          <Card key={idx} className="border-primary">
            <CardHeader><CardTitle className="text-xl">{item.title}</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">{item.desc}</p></CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

/* ================= DYNAMIC BENEFITS SECTION ================= */
const DynamicBenefitsSection = ({ activeAudience }: { activeAudience: string }) => (
  <section className="py-16">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
          {activeAudience === "entrepreneurs" ? "Key Benefits for Growth" : "Why Shop Here"}
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {activeAudience === "entrepreneurs" 
            ? "Improve efficiency and customer retention." 
            : "Benefit from quality and service."}
        </p>
      </div>
      <div className="grid md:grid-cols-4 gap-6">
        {(activeAudience === "entrepreneurs" ? [
          { icon: MessageCircle, title: "Customer Retention", desc: "Organized communication builds loyalty." },
          { icon: DollarSign, title: "Smooth Payments", desc: "Encourages repeat business." },
          { icon: Shield, title: "Build Trust", desc: "Professional appearance attracts referrals." },
          { icon: Rocket, title: "Easy Scaling", desc: "Grow without added complexity." }
        ] : [
          { icon: Heart, title: "Personalized Selection", desc: "Products suited to your preferences." },
          { icon: Star, title: "Quality Guarantee", desc: "Satisfaction or refund." },
          { icon: Users, title: "Community Support", desc: "Help local entrepreneurs." },
          { icon: Globe, title: "Loyalty Rewards", desc: "Benefits for returning customers." }
        ]).map((item, idx) => (
          <Card key={idx} className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

/* ================= PRICING SECTION (Entrepreneurs) ================= */
const PricingSection = () => (
  <section className="py-16">
    <div className="container mx-auto px-4">
      <div className="max-w-md mx-auto">
        <Card className="border-2 border-primary/20 shadow-2xl relative overflow-hidden">
          <CardHeader className="text-center pb-6 pt-8">
            <CardTitle className="font-display text-3xl">Complete Selling Tools</CardTitle>
            <CardDescription className="text-lg">₦1,000 per month</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-8">
              <span className="text-5xl font-bold text-primary">₦1,000</span>
              <span className="text-muted-foreground text-lg">/month</span>
              <p className="text-sm text-muted-foreground mt-2">Support your business growth</p>
            </div>
            <ul className="space-y-3 mb-8 text-left">
              {[
                "Unlimited products and branding",
                "WhatsApp order integration",
                "Paystack payment support",
                "Customer analytics",
                "Follow-up tools"
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
                Start Your Store
              </Button>
            </Link>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4">
              <AlertCircle className="w-4 h-4" />
              7-day free trial • Cancel anytime
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
);

/* ================= DISCOVERY CTA SECTION (Customers) ================= */
const DiscoveryCTASection = () => (
  <section className="py-16 bg-muted/30">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl font-bold mb-4">Begin Your Shopping Experience</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore products from trusted sellers.
        </p>
      </div>
      <div className="max-w-md mx-auto">
        <Card className="border-2 border-primary/20 shadow-2xl">
          <CardContent className="p-6 text-center">
            <Heart className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="font-display text-2xl mb-4">Free to Browse</h3>
            <p className="text-muted-foreground mb-6">View stores, chat with sellers, and save favorites.</p>
            <Link to="/shops">
              <Button size="lg" className="w-full bg-gradient-to-r from-accent to-primary text-white text-lg py-6">
                <Search className="w-5 h-5 mr-2" />
                Start Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
);

/* ================= FINAL CTA ================= */
const FinalCTA = ({ activeAudience, onSwitch }: { activeAudience: string, onSwitch: () => void }) => (
  <section className="relative py-20 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
    <AdirePattern variant="circles" className="text-white" opacity={0.15} />
    
    <div className="container mx-auto px-4 text-center relative z-10">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
          {activeAudience === "entrepreneurs" ? "Build a Trusted Business" : "Enjoy Quality Shopping"}
        </h2>
        <p className="text-lg md:text-xl text-white/90 mb-8">
          {activeAudience === "entrepreneurs"
            ? "Create a professional presence for lasting customer relationships."
            : "Find reliable products with excellent service."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link to={activeAudience === "entrepreneurs" ? "/auth/signup" : "/shops"}>
            <Button size="lg" variant="secondary" className="text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5">
              {activeAudience === "entrepreneurs" ? "Create Store" : "Start Shopping"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-10 py-6 border-white/30 text-white hover:bg-white/10"
            onClick={onSwitch}
          >
            Switch to {activeAudience === "entrepreneurs" ? "Shopper View" : "Seller View"}
          </Button>
        </div>
      </div>
    </div>
  </section>
);

export default Index;