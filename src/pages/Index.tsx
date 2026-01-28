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
    "Ignite Your Sales Revolution: From Messy Chats to Pro Deals",
    "Showcase Magic: Turn Fuzzy Pics into Jaw-Dropping Displays",
    "Order Mastery: Conquer Chaos for Explosive Growth",
    "Price Power: Ditch Bargains for Bold, Confident Wins",
    "Brand Glow-Up: Evolve from Side Hustle to Iconic Empire",
    "Success Surge: From Grind to Glorious, Structured Triumph"
  ];

  const customerDiscoveries = [
    "Unlock Hidden Gems: Treasures Crafted by Dream-Chasers",
    "Shop Smart & Secure: Backed by Real Entrepreneur Spirit",
    "Personalized Bliss: Stories, Service, and Smiles Await",
    "Passion-Packed Finds: Products with Heart and Hustle",
    "Value Vault: Support Visions, Score Epic Deals",
    "Seamless Joy: Shopping with Soulful, Magical Touch"
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
              {activeAudience === "entrepreneurs" ? "From Everyday Challenges to Business Wins" : "From Ordinary Shopping to Meaningful Discoveries"}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {activeAudience === "entrepreneurs" 
                ? "We transform how Nigerian sellers build trusted businesses." 
                : "Experience shopping that satisfies, delights, and keeps you coming back."}
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
  <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
    <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight drop-shadow-lg">
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary animate-gradient-x">
        <TypewriterEffect 
          texts={milestones} 
          typingSpeed={60} 
          deletingSpeed={30} 
          pauseDuration={2000}
        />
      </span>
    </h1>
    <p className="text-lg md:text-xl text-muted-foreground animate-slide-up">
      Launch a sleek online store in seconds. Share your magic link. Seal deals on WhatsApp. Skyrocket your success.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
      <Link to="/auth/signup">
        <Button size="lg" className="bg-gradient-to-r from-accent to-primary text-white text-lg px-8 py-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 hover:scale-105 w-full sm:w-auto">
          Ignite Your Store (Free)
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </Link>
      <Link to="/demo">
        <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-primary hover:bg-primary/10 transition-all hover:-translate-y-1 hover:scale-105 w-full sm:w-auto">
          <Search className="w-5 h-5 mr-2" />
          Peek at Demo Magic
        </Button>
      </Link>
    </div>
    <p className="text-sm text-muted-foreground animate-fade-in-delay">
      <CheckCircle className="w-4 h-4 text-green-500 inline mr-1" />
      Zero card hassle • 7-day thrill trial
    </p>
  </div>
);

/* ================= CUSTOMER HERO ================= */
const CustomerHero = ({ discoveries }: { discoveries: string[] }) => (
  <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
    <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight drop-shadow-lg">
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary animate-gradient-x">
        <TypewriterEffect 
          texts={discoveries} 
          typingSpeed={60} 
          deletingSpeed={30} 
          pauseDuration={2000}
        />
      </span>
    </h1>
    <p className="text-lg md:text-xl text-muted-foreground animate-slide-up">
      Dive into exclusive finds from fiery Nigerian innovators. Revel in custom care, safe buys, and endless delight.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
      <Link to="/shops">
        <Button size="lg" className="bg-gradient-to-r from-accent to-primary text-white text-lg px-8 py-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 hover:scale-105 w-full sm:w-auto">
          Dive into Discoveries
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </Link>
      <Link to="/demo">
        <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-primary hover:bg-primary/10 transition-all hover:-translate-y-1 hover:scale-105 w-full sm:w-auto">
          <Search className="w-5 h-5 mr-2" />
          Sneak Peek Adventure
        </Button>
      </Link>
    </div>
    <p className="text-sm text-muted-foreground animate-fade-in-delay">
      <CheckCircle className="w-4 h-4 text-green-500 inline mr-1" />
      Trusted creators • Worry-free joy • Easy swaps
    </p>
  </div>
);

/* ================= DYNAMIC PROBLEM-SOLUTION ================= */
const DynamicProblemSolution = ({ activeAudience }: { activeAudience: string }) => {
  const problems = activeAudience === "entrepreneurs" ? [
    { title: "Chat Overload Nightmare", desc: "Endless repeats, vanishing orders." },
    { title: "Trust Gap Crisis", desc: "Informal vibes scare off big buyers." },
    { title: "Payment Panic", desc: "Manual messes cause slips and stress." }
  ] : [
    { title: "Bland Bulk Buys", desc: "No spark, no story, just stuff." },
    { title: "Cold Customer Care", desc: "Zero connection, robotic responses." },
    { title: "Doubtful Deals", desc: "Quality questions, authenticity angst." }
  ];

  const solutions = activeAudience === "entrepreneurs" ? [
    { title: "Magic Link Mastery", desc: "Browse bliss, WhatsApp wonders." },
    { title: "Brand Brilliance Boost", desc: "Pro polish for instant cred." },
    { title: "Payment Paradise", desc: "Seamless Paystack, zero drama." }
  ] : [
    { title: "Creator Curated Wonders", desc: "Stories infused, passion powered." },
    { title: "Chat Charm Direct", desc: "Warm welcomes, expert insights." },
    { title: "Trust Shield Supreme", desc: "Verified vibes, guarantee glow." }
  ];

  return (
    <>
      <div className="grid md:grid-cols-3 gap-6">
        {problems.map((item, idx) => (
          <Card key={idx} className="hover:shadow-md transition-shadow">
            <CardHeader><CardTitle className="text-xl text-red-600">{item.title}</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">{item.desc}</p></CardContent>
          </Card>
        ))}
      </div>
      <div className="text-center my-8">
        <ChevronRight className="w-12 h-12 mx-auto text-primary rotate-90 md:rotate-0 animate-bounce" />
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {solutions.map((item, idx) => (
          <Card key={idx} className="border-primary hover:shadow-md transition-shadow">
            <CardHeader><CardTitle className="text-xl text-green-600">{item.title}</CardTitle></CardHeader>
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
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 animate-pulse">
          {activeAudience === "entrepreneurs" ? "Supercharge Your Growth Game" : "Why Your Heart Will Skip a Beat"}
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {activeAudience === "entrepreneurs" 
            ? "Lock in loyalty with killer tools and trust turbo." 
            : "Dive into delight with custom, rewarding retail therapy."}
        </p>
      </div>
      <div className="grid md:grid-cols-4 gap-6">
        {(activeAudience === "entrepreneurs" ? [
          { icon: MessageCircle, title: "Loyalty Lockdown", desc: "Chat magic builds forever fans." },
          { icon: DollarSign, title: "Payment Power-Up", desc: "Smooth sails for repeat riches." },
          { icon: Shield, title: "Trust Turbo", desc: "Pro vibe sparks referral storms." },
          { icon: Rocket, title: "Scale Superstar", desc: "Grow big without the headaches." }
        ] : [
          { icon: Heart, title: "Custom Crush", desc: "Finds that feel made for you." },
          { icon: Star, title: "Quality Quest", desc: "Bliss or bust – guaranteed." },
          { icon: Users, title: "Tribe Thrill", desc: "Join the dream-support squad." },
          { icon: Globe, title: "VIP Vault", desc: "Exclusive perks for loyal legends." }
        ]).map((item, idx) => (
          <Card key={idx} className="text-center hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin-slow">
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
        <Card className="border-2 border-primary/20 shadow-2xl relative overflow-hidden hover:scale-105 transition-transform">
          <CardHeader className="text-center pb-6 pt-8 bg-gradient-to-b from-accent/10 to-transparent">
            <CardTitle className="font-display text-3xl">Ultimate Selling Arsenal</CardTitle>
            <CardDescription className="text-lg">Just ₦1,000/month</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-8">
              <span className="text-5xl font-bold text-primary animate-pulse">₦1,000</span>
              <span className="text-muted-foreground text-lg">/month</span>
              <p className="text-sm text-muted-foreground mt-2">Fuel your empire dreams</p>
            </div>
            <ul className="space-y-3 mb-8 text-left">
              {[
                "Endless products & dazzle branding",
                "WhatsApp wizardry for fan-building",
                "Paystack prowess for loyal payouts",
                "Insight intel on customer crushes",
                "Follow-up flair for repeat rapture"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/auth/signup">
              <Button size="lg" className="w-full bg-gradient-to-r from-accent to-primary text-white text-lg py-6 hover:scale-105 transition-transform">
                <Rocket className="w-5 h-5 mr-2" />
                Blast Off Your Store
              </Button>
            </Link>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4">
              <AlertCircle className="w-4 h-4" />
              7-day free thrill • Ditch anytime
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
        <h2 className="font-display text-3xl font-bold mb-4 animate-bounce">Ignite Your Discovery Quest</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Join the joy parade of thrilled treasure hunters.
        </p>
      </div>
      <div className="max-w-md mx-auto">
        <Card className="border-2 border-primary/20 shadow-2xl hover:scale-105 transition-transform">
          <CardContent className="p-6 text-center">
            <Heart className="w-12 h-12 text-accent mx-auto mb-4 animate-pulse" />
            <h3 className="font-display text-2xl mb-4">Explore Free & Fabulous</h3>
            <p className="text-muted-foreground mb-6">Wander, whisper, and wishlist – no strings, pure sparkle.</p>
            <Link to="/shops">
              <Button size="lg" className="w-full bg-gradient-to-r from-accent to-primary text-white text-lg py-6 hover:scale-105 transition-transform">
                <Search className="w-5 h-5 mr-2" />
                Unleash the Hunt
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
    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent animate-gradient-slow" />
    <AdirePattern variant="circles" className="text-white" opacity={0.15} />
    
    <div className="container mx-auto px-4 text-center relative z-10">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6 drop-shadow-md">
          {activeAudience === "entrepreneurs" ? "Craft a Realm Fans Adore" : "Where Bliss Meets Buy Button"}
        </h2>
        <p className="text-lg md:text-xl text-white/90 mb-8">
          {activeAudience === "entrepreneurs"
            ? "Brew experiences that hook hearts and spark shares."
            : "Bask in bespoke buys that forge fabulous bonds."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link to={activeAudience === "entrepreneurs" ? "/auth/signup" : "/shops"}>
            <Button size="lg" variant="secondary" className="text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 hover:scale-105">
              {activeAudience === "entrepreneurs" ? "Unleash My Empire" : "Launch Shopping Spree"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-10 py-6 border-white/30 text-white hover:bg-white/10 hover:scale-105 transition-transform"
            onClick={onSwitch}
          >
            Flip to {activeAudience === "entrepreneurs" ? "Shopper Paradise" : "Seller Stardom"}
          </Button>
        </div>
      </div>
    </div>
  </section>
);

export default Index;