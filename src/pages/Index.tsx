import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Store,
  CheckCircle,
  MessageCircle,
  Search,
  Sparkles,
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
import { SEOSchemas } from "@/components/SEOSchemas";
import { TransformationCards } from "@/components/TransformationCards";
import { SimplePricing } from "@/components/SimplePricing";
import { FinalCTASection } from "@/components/FinalCTASection";

const Index = () => {
<<<<<<< HEAD
  const [activeAudience, setActiveAudience] = useState<"entrepreneurs" | "customers">("entrepreneurs");

  const entrepreneurMilestones = [
    "From Chaotic Chats to Professional Sales",
    "From Blurry Photos to Clear Product Displays",
    "From Lost Orders to Organized Management",
    "From Price Negotiations to Transparent Pricing",
    "From Casual Vendor to Established Brand",
    "From Daily Hustle to Structured Business Growth"
=======
  const heroMessages = [
    "From WhatsApp Chaos to Professional Store",
    "From Price Haggling to Clear Confidence",
    "From Blurry Photos to Stunning Showcases",
    "From Lost Customers to Loyal Fans",
    "From Hustle to Structured Success"
>>>>>>> 2f8ccce5c4993fa4fe2094a71bb0bc2651194730
  ];

<<<<<<< HEAD
  const customerDiscoveries = [
    "Discover Unique Products from Dedicated Entrepreneurs",
    "Shop Securely from Verified Businesses",
    "Enjoy Personalized Service and Support",
    "Find Items with Quality and Purpose",
    "Support Local Businesses with Every Purchase",
    "Experience Convenient and Reliable Shopping"
  ];

=======
>>>>>>> 2f8ccce5c4993fa4fe2094a71bb0bc2651194730
  return (
    <div className="min-h-screen bg-background">
      {/* SEO Schemas */}
      <SEOSchemas />
      
      {/* Urgency Banner */}
      <UrgencyBanner />
      
      {/* Navigation */}
      <Navbar />
      
      {/* HERO SECTION - Simplified, Single Focus */}
      <section className="relative pt-20 md:pt-28 pb-16 md:pb-24 overflow-hidden">
        <AdirePattern variant="geometric" className="text-primary" opacity={0.5} />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Main Headline with Typewriter */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">
                <TypewriterEffect 
                  texts={heroMessages} 
                  typingSpeed={70} 
                  deletingSpeed={35} 
                  pauseDuration={2500}
                />
              </span>
            </h1>
            
            {/* Subheadline - Clear Value Prop */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Create your professional online store in <span className="font-semibold text-foreground">60 seconds</span>. 
              Share one link. Get orders on WhatsApp.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/auth/signup">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-accent to-primary text-white text-lg px-8 py-7 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 w-full sm:w-auto"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Your Free Store
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-7 w-full sm:w-auto border-2"
                >
                  <Search className="w-5 h-5 mr-2" />
                  View Demo Store
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>7-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground">500+ stores</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-green-600" />
                <span>WhatsApp integrated</span>
              </div>
            </div>

<<<<<<< HEAD
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
=======
            {/* Paystack Badge */}
            <div className="flex justify-center pt-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full">
                <div className="w-6 h-6 bg-[#00C3F7]/20 rounded flex items-center justify-center">
                  <span className="text-[#00C3F7] font-bold text-xs">PS</span>
                </div>
                <span className="text-sm text-muted-foreground">Powered by Paystack</span>
              </div>
            </div>
>>>>>>> 2f8ccce5c4993fa4fe2094a71bb0bc2651194730
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF - Streamlined Stats */}
      <SocialProofStats />

      {/* HOW IT WORKS - 3 Simple Steps */}
      <HowItWorks audience="entrepreneurs" />

      {/* FEATURED SHOPS - Visual Showcase */}
      <FeaturedShopsBanner />

      {/* TRANSFORMATION - Before/After Cards */}
      <TransformationCards />

      {/* SIMPLE PRICING */}
      <SimplePricing />

      {/* TESTIMONIALS */}
      <HomepageReviews audience="entrepreneurs" />

      {/* TRUST BADGES */}
      <TrustBadgesSection />

      {/* FINAL CTA */}
      <FinalCTASection />

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

<<<<<<< HEAD
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

=======
>>>>>>> 2f8ccce5c4993fa4fe2094a71bb0bc2651194730
export default Index;
