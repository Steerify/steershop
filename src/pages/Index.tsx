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
  Target,
  Crown,
  X,
  Check,
  AlertCircle,
  Search,
  Building,
  MessageSquare,
  SmartphoneIcon,
  DollarSign,
  Layers,
  Tag,
  ChevronRight,
  BarChart,
  Share2,
  Palette,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdirePattern, AdireDivider } from "@/components/patterns/AdirePattern";
import heroImage from "@/assets/hero-image.jpg";
import offerService from "@/services/offer.service";
import { TypewriterEffect } from "@/components/TypewriterEffect";

const Index = () => {
  const [activeAudience, setActiveAudience] = useState<"customers" | "entrepreneurs">("entrepreneurs");
  const [offers, setOffers] = useState<any[]>([]);
  
  const growthMilestones = [
    "From Chat Sales to Structured Business",
    "From Blurry Photos to Professional Storefront",
    "From Order Chaos to Organized Growth",
    "From Price Negotiations to Clear Pricing",
    "From Customer Doubt to Complete Trust"
  ];

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await offerService.getOffers();
      if (response.success) {
        setOffers(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  };

  const customerOffer = offers.find(o => o.target_audience === "customers");
  const entrepreneurOffer = offers.find(o => o.target_audience === "entrepreneurs");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* ================= SMART HEADER WITH AUDIENCE TOGGLE ================= */}
      <section className="relative pt-20 md:pt-24 pb-8 overflow-hidden">
        <AdirePattern variant="geometric" className="text-primary" opacity={0.6} />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Audience Toggle Banner */}
          <div className="max-w-md mx-auto mb-8">
            <Tabs 
              value={activeAudience} 
              onValueChange={(value) => setActiveAudience(value as any)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 p-1.5 bg-card border shadow-lg backdrop-blur-sm">
                <TabsTrigger 
                  value="entrepreneurs" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent/20 data-[state=active]:to-primary/20 data-[state=active]:shadow-inner transition-all"
                >
                  <Store className="w-4 h-4" />
                  <span className="font-semibold">I Run a Business</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="customers" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent/20 data-[state=active]:to-primary/20 data-[state=active]:shadow-inner transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="font-semibold">I Shop Meaningfully</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Dynamic Hero Content */}
          {activeAudience === "entrepreneurs" ? (
            <EntrepreneurHero 
              growthMilestones={growthMilestones}
              offer={entrepreneurOffer}
            />
          ) : (
            <CustomerHero offer={customerOffer} />
          )}
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
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold mb-1 text-foreground">
                      {activeAudience === "entrepreneurs" ? "See Your Brand Vision Come to Life" : "Experience Trusted Shopping"}
                    </h3>
                    <p className="text-muted-foreground max-w-2xl">
                      {activeAudience === "entrepreneurs" 
                        ? "Explore our interactive demo to visualize your professional business presence."
                        : "Browse stores built by passionate entrepreneurs who value transparency and quality."
                      }
                    </p>
                  </div>
                </div>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-accent to-primary text-white group-hover:opacity-90 shadow-md"
                >
                  {activeAudience === "entrepreneurs" ? "Visualize My Brand" : "Browse Trusted Stores"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* ================= DYNAMIC CONTENT SECTIONS ================= */}
      {activeAudience === "entrepreneurs" ? (
        <>
          <TheSteerSoloWaySection />
          <GrowthJourneySection />
          <OutcomesGridSection />
          <TestimonialsSection />
        </>
      ) : (
        <>
          <CustomerBenefitsSection />
          <ShopCategoriesSection />
          <TrustSignalsSection />
        </>
      )}

      {/* ================= SHARED VALUE PROPOSITION ================= */}
      <SharedValueProposition />

      {/* ================= BUSINESS FOUNDATION (Entrepreneurs only) ================= */}
      {activeAudience === "entrepreneurs" && (
        <BusinessFoundationSection />
      )}

      {/* ================= FINAL CTA ================= */}
      <FinalCTASection 
        activeAudience={activeAudience} 
        onToggleAudience={() => setActiveAudience(activeAudience === "entrepreneurs" ? "customers" : "entrepreneurs")}
      />

      <Footer />
    </div>
  );
};

/* ================= ENTREPRENEUR HERO ================= */
const EntrepreneurHero = ({ growthMilestones, offer }: { growthMilestones: string[], offer?: any }) => (
  <div className="max-w-6xl mx-auto">
    <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
      {/* Left Column - Main Message */}
      <div className="space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full mb-4">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-accent font-semibold text-sm">FROM HUSTLE TO STRUCTURE</span>
        </div>
        
        {/* Main Heading */}
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-accent">
            <TypewriterEffect 
              texts={growthMilestones} 
              typingSpeed={80} 
              deletingSpeed={40} 
              pauseDuration={2500}
            />
          </span>
        </h1>
        
        {/* Subheading */}
        <p className="text-lg md:text-xl text-muted-foreground">
          SteerSolo gives you a professional, WhatsApp-powered storefront 
          that helps you sell clearly, get paid faster, and grow with confidence.
        </p>
        
        {/* Business Outcomes */}
        <div className="space-y-3">
          {[
            "Replace blurry photos with clean product listings",
            "Organize orders without losing customer context",
            "Build trust with a professional business presence",
            "Accept payments through methods customers prefer",
            "Grow from selling in chats to running a structured business"
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
              Start Building Your Brand
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link to="/demo">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 w-full sm:w-auto">
              <Sparkles className="w-5 h-5 mr-2" />
              See How It Works
            </Button>
          </Link>
        </div>
        
        {/* Trust Signal */}
        <p className="text-sm text-muted-foreground pt-2">
          <CheckCircle className="w-4 h-4 text-green-500 inline mr-1" />
          No credit card required • Your business in 60 seconds
        </p>
      </div>
      
      {/* Right Column - Solution Showcase */}
      <div className="space-y-6">
        <Card className="border-2 border-primary/20 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-accent" />
              <CardTitle className="text-xl">The Professional Business Foundation</CardTitle>
            </div>
            <CardDescription>What serious business owners build with SteerSolo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                icon: MessageSquare,
                title: "Never Lose Context",
                description: "Keep meaningful conversations while organizing every order clearly"
              },
              {
                icon: Building,
                title: "Professional Presence",
                description: "Present your business with the credibility customers expect"
              },
              {
                icon: DollarSign,
                title: "Confident Payments",
                description: "Accept payments through methods Nigerian customers trust"
              },
              {
                icon: Layers,
                title: "Organized Growth",
                description: "Products, pricing, and orders structured for business growth"
              }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{item.title}</div>
                  <div className="text-sm text-muted-foreground">{item.description}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card p-4 rounded-xl border shadow-sm text-center">
            <div className="text-2xl font-bold text-primary">60 sec</div>
            <div className="text-sm text-muted-foreground">Business setup</div>
          </div>
          <div className="bg-card p-4 rounded-xl border shadow-sm text-center">
            <div className="text-2xl font-bold text-primary">₦1,000/mo</div>
            <div className="text-sm text-muted-foreground">Complete business foundation</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ================= CUSTOMER HERO ================= */
const CustomerHero = ({ offer }: { offer?: any }) => (
  <div className="max-w-6xl mx-auto">
    <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full mb-4">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-accent font-semibold text-sm">SHOP FROM REAL BUSINESS OWNERS</span>
        </div>
        
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
          Discover Amazing Products
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-accent">
            From Passionate Creators
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground">
          Shop directly from real entrepreneurs building their dreams. Get unique products, 
          personalized service, and support business owners who care about what they create.
        </p>
        
        <div className="space-y-3">
          {[
            "✓ Verified businesses for safe shopping",
            "✓ Direct WhatsApp chat with business owners",
            "✓ Unique products you won't find elsewhere",
            "✓ Support real entrepreneurs building dreams",
            "✓ Transparent, professional service"
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-foreground">{item}</span>
            </div>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link to="/shops">
            <Button size="lg" className="bg-gradient-to-r from-accent to-primary text-white text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 w-full sm:w-auto">
              Browse Professional Stores
              <ShoppingBag className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link to="/demo">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 w-full sm:w-auto">
              <Search className="w-5 h-5 mr-2" />
              Explore Business Stories
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="space-y-6">
        <Card className="border-2 border-primary/20 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-accent" />
              <CardTitle className="text-xl">Why Shop with SteerSolo?</CardTitle>
            </div>
            <CardDescription>Experience shopping that matters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                icon: Shield,
                title: "Verified & Trusted",
                description: "Every business is verified for your peace of mind"
              },
              {
                icon: MessageCircle,
                title: "Direct Communication",
                description: "Chat directly with business owners for personalized service"
              },
              {
                icon: Star,
                title: "Unique Products",
                description: "Discover amazing products not found in big stores"
              },
              {
                icon: Users,
                title: "Support Real Businesses",
                description: "Your purchase directly supports passionate entrepreneurs"
              }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{item.title}</div>
                  <div className="text-sm text-muted-foreground">{item.description}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card p-4 rounded-xl border shadow-sm text-center">
            <div className="text-2xl font-bold text-primary">100%</div>
            <div className="text-sm text-muted-foreground">Business verified</div>
          </div>
          <div className="bg-card p-4 rounded-xl border shadow-sm text-center">
            <div className="text-2xl font-bold text-primary">Direct</div>
            <div className="text-sm text-muted-foreground">Business owner support</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ================= THE STEERSOLO WAY SECTION ================= */
const TheSteerSoloWaySection = () => (
  <section className="py-16">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full mb-4">
          <Target className="w-4 h-4 text-accent" />
          <span className="text-accent font-semibold">THE STEERSOLO WAY</span>
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
          Built for Modern Nigerian Business
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Our principles for helping entrepreneurs build lasting, trusted businesses
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: MessageCircle,
            title: "WhatsApp-First Commerce",
            description: "Built around how Nigerian business owners actually communicate and build relationships",
            color: "from-blue-500/20 to-primary/20"
          },
          {
            icon: Shield,
            title: "Trust Is the Product",
            description: "Professional storefronts that make customers confident before they even chat",
            color: "from-green-500/20 to-emerald-500/20"
          },
          {
            icon: DollarSign,
            title: "Payments That Feel Normal",
            description: "Nigerian-friendly checkout experiences that don't create friction",
            color: "from-purple-500/20 to-pink-500/20"
          },
          {
            icon: Zap,
            title: "Speed Without Complexity",
            description: "Go from business idea to professional presence in under 60 seconds",
            color: "from-orange-500/20 to-yellow-500/20"
          }
        ].map((item, index) => (
          <Card key={index} className="border-2 border-primary/10 hover:border-accent/30 transition-all hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                <item.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

/* ================= GROWTH JOURNEY SECTION ================= */
const GrowthJourneySection = () => (
  <section className="py-16 bg-muted/30">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl font-bold mb-4">
          The Growth Journey of Real Businesses
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          See how entrepreneurs evolve their business foundations with SteerSolo
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            name: "Amaka's Fashion House",
            earlyStage: "Sharing designs through personal chats and photo albums",
            nextStage: "A structured boutique where customers browse collections with confidence",
            result: "3x growth in consistent customers",
            quote: "Customers now recognize us as a serious fashion brand"
          },
          {
            name: "Tunde's Tech Solutions",
            earlyStage: "Managing customer requests across multiple chat platforms",
            nextStage: "An organized system where every inquiry becomes a clear opportunity",
            result: "Saves 15+ hours weekly on coordination",
            quote: "We now handle twice the volume with half the stress"
          },
          {
            name: "Chioma's Artisanal Bakery",
            earlyStage: "Sharing daily specials through broadcast lists",
            nextStage: "A professional menu customers can browse and order from anytime",
            result: "50% increase in pre-orders",
            quote: "Customers love being able to plan their orders in advance"
          }
        ].map((story, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <h3 className="font-display text-xl font-bold mb-4">{story.name}</h3>
              
              <div className="space-y-4 mb-6">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-sm text-blue-600 font-medium mb-1">Building Foundations</div>
                  <div className="font-medium text-gray-800">{story.earlyStage}</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="text-sm text-green-600 font-medium mb-1">Professional Growth</div>
                  <div className="font-medium text-gray-800">{story.nextStage}</div>
                </div>
              </div>
              
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 mb-4">
                <p className="italic text-foreground">"{story.quote}"</p>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <div className="text-sm text-muted-foreground">Business Impact</div>
                  <div className="font-bold text-green-600">{story.result}</div>
                </div>
                <div className="text-2xl">🏢</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

/* ================= OUTCOMES GRID SECTION ================= */
const OutcomesGridSection = () => (
  <section className="py-16">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
          Business Outcomes, Not Just Features
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          What serious business owners achieve with SteerSolo
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            icon: Clock,
            title: "Launch in Minutes, Not Days",
            description: "Start building customer relationships while your business vision is fresh"
          },
          {
            icon: MessageCircle,
            title: "Never Lose Customer Context",
            description: "Every conversation, every preference, every order—organized and clear"
          },
          {
            icon: Shield,
            title: "Build Trust Before First Contact",
            description: "Professional presentation that makes customers confident from their first visit"
          },
          {
            icon: DollarSign,
            title: "Get Paid Confidently",
            description: "Accept payments through methods your customers already know and trust"
          },
          {
            icon: Palette,
            title: "Present Your Best Self",
            description: "Beautiful marketing materials that reflect your brand's quality"
          },
          {
            icon: Store,
            title: "Own Your Customer Relationships",
            description: "Build lasting connections, not just transactions"
          }
        ].map((item, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center mx-auto mb-4">
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
);

/* ================= CUSTOMER BENEFITS SECTION ================= */
const CustomerBenefitsSection = () => (
  <section className="py-16">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
          Why Shop with SteerSolo Stores?
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Experience shopping that's personal, secure, and meaningful
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: Shield,
            title: "Verified Businesses",
            description: "Every store represents a real entrepreneur building their dream"
          },
          {
            icon: MessageCircle,
            title: "Direct Relationships",
            description: "Chat directly with the people who create what you love"
          },
          {
            icon: Star,
            title: "Unique Discoveries",
            description: "Find products made with passion, not mass-produced"
          },
          {
            icon: Heart,
            title: "Meaningful Impact",
            description: "Your purchase directly supports real business growth"
          }
        ].map((item, index) => (
          <Card key={index} className="text-center hover:border-accent/50 transition-all hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

/* ================= SHOP CATEGORIES SECTION ================= */
const ShopCategoriesSection = () => (
  <section className="py-16 bg-muted/30">
    <div className="container mx-auto px-4">
      <h2 className="font-display text-3xl font-bold text-center mb-8">
        Shop by Passion
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          "Fashion & Style",
          "Tech & Innovation",
          "Food & Craft",
          "Art & Creativity",
          "Beauty & Wellness",
          "Home & Living",
          "Digital Excellence",
          "Health & Vitality"
        ].map((category, index) => (
          <Link key={index} to={`/shops?category=${category.toLowerCase().replace(/ & /g, '-')}`}>
            <Card className="text-center hover:bg-accent/5 cursor-pointer transition-all hover:-translate-y-1 border-primary/10">
              <CardContent className="p-6">
                <h3 className="font-medium text-foreground">{category}</h3>
                <div className="mt-2 flex items-center justify-center text-primary text-sm">
                  <span>Discover businesses</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

/* ================= TESTIMONIALS SECTION ================= */
const TestimonialsSection = () => (
  <section className="py-16">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl font-bold mb-4">
          Business Owners Building Legacies
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Real stories from entrepreneurs who found their business foundation
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            name: "Amaka N.",
            business: "Fashion Brand Owner",
            quote: "We transitioned from sharing photos to building a recognizable brand. Customers now see us as a serious fashion house.",
            impact: "3x growth in brand recognition"
          },
          {
            name: "Tunde C.",
            business: "Tech Solutions Founder",
            quote: "Our business conversations became organized and professional. We handle more opportunities with better results.",
            impact: "Doubled client capacity"
          },
          {
            name: "Chioma A.",
            business: "Artisanal Bakery Owner",
            quote: "From daily specials to a proper menu, our customers appreciate being able to plan and order with confidence.",
            impact: "50% increase in pre-orders"
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
                  <div className="text-sm text-muted-foreground">{testimonial.business}</div>
                </div>
                <div className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  {testimonial.impact}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

/* ================= TRUST SIGNALS SECTION ================= */
const TrustSignalsSection = () => (
  <section className="py-16">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl font-bold mb-4">
          Shop with Confidence
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          We ensure every shopping experience is safe and satisfying
        </p>
      </div>
      
      <div className="grid md:grid-cols-4 gap-6">
        {[
          {
            icon: Shield,
            title: "Verified Businesses",
            description: "Every store is built by a real entrepreneur with a verified identity"
          },
          {
            icon: MessageCircle,
            title: "Direct Relationships",
            description: "Communicate directly with the people who create your products"
          },
          {
            icon: CheckCircle,
            title: "Secure Experiences",
            description: "Safe transactions that protect both shoppers and business owners"
          },
          {
            icon: Users,
            title: "Real Stories",
            description: "Authentic experiences from real customers supporting real businesses"
          }
        ].map((item, index) => (
          <Card key={index} className="text-center border-primary/10">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

/* ================= SHARED VALUE PROPOSITION ================= */
const SharedValueProposition = () => (
  <section className="py-16 bg-muted/30">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full mb-4">
          <Target className="w-4 h-4 text-accent" />
          <span className="text-accent font-semibold">THE STEERSOLO FOUNDATION</span>
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
          Where Real Businesses Begin and Grow
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          We understand how Nigerian entrepreneurs build lasting businesses
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-display text-xl font-bold mb-2">Built for Real Conversations</h3>
          <p className="text-muted-foreground">Designed around how Nigerian business relationships actually form and grow</p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-display text-xl font-bold mb-2">Speed Meets Substance</h3>
          <p className="text-muted-foreground">Professional business foundations that don't require technical expertise</p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-display text-xl font-bold mb-2">Trust as Growth Engine</h3>
          <p className="text-muted-foreground">Credibility that transforms one-time buyers into lifelong customers</p>
        </div>
      </div>
    </div>
  </section>
);

/* ================= BUSINESS FOUNDATION SECTION ================= */
const BusinessFoundationSection = () => (
  <section className="py-16">
    <div className="container mx-auto px-4">
      <div className="max-w-md mx-auto">
        <Card className="border-2 border-primary/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-accent text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
            COMPLETE BUSINESS FOUNDATION
          </div>
          <CardHeader className="text-center pb-6 pt-8">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-accent/10 rounded-full text-accent font-semibold text-sm mx-auto mb-4">
              <Rocket className="w-4 h-4" />
              EVERYTHING YOU NEED TO GROW
            </div>
            <CardTitle className="font-display text-3xl">Your Business Foundation</CardTitle>
            <CardDescription className="text-lg">Professional tools for serious entrepreneurs</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-8">
              <span className="text-5xl font-bold text-primary">₦1,000</span>
              <span className="text-muted-foreground text-lg">/month</span>
              <p className="text-sm text-muted-foreground mt-2">
                Less than the cost of one missed opportunity
              </p>
            </div>
            
            <ul className="space-y-3 mb-8 text-left">
              {[
                "Professional business presence in 60 seconds",
                "Unlimited products with beautiful presentations",
                "Customer-preferred payment methods",
                "Organized order management through WhatsApp",
                "Professional marketing materials",
                "Your own brand-able store link",
                "7-day free foundation trial"
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
                  Start Your Business Foundation
                </Button>
              </Link>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                No commitments • Build at your pace
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Value Proposition */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            <Check className="w-4 h-4 text-green-500 inline mr-1" />
            Professional business results without technical complexity
          </p>
        </div>
      </div>
    </div>
  </section>
);

/* ================= FINAL CTA SECTION ================= */
const FinalCTASection = ({ 
  activeAudience, 
  onToggleAudience 
}: { 
  activeAudience: string, 
  onToggleAudience: () => void 
}) => (
  <section className="relative py-20 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
    <AdirePattern variant="circles" className="text-white" opacity={0.15} />
    
    <div className="container mx-auto px-4 text-center relative z-10">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
          {activeAudience === "entrepreneurs" 
            ? "Ready to Build a Business Customers Trust?" 
            : "Ready to Discover Meaningful Shopping?"
          }
        </h2>
        <p className="text-lg md:text-xl text-white/90 mb-8">
          {activeAudience === "entrepreneurs"
            ? "Stop letting chaotic sales processes hold back your growth. Build the professional foundation that makes customers believe in your business."
            : "Shop directly from passionate entrepreneurs creating unique products with care and attention."
          }
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={activeAudience === "entrepreneurs" ? "/auth/signup" : "/shops"}>
            <Button size="lg" variant="secondary" className="text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5">
              {activeAudience === "entrepreneurs" ? "Build Your Business Foundation" : "Browse Trusted Businesses"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-10 py-6 border-white/30 text-white hover:bg-white/10"
            onClick={onToggleAudience}
          >
            {activeAudience === "entrepreneurs" ? "I Want to Shop Meaningfully" : "I Want to Build My Business"}
          </Button>
        </div>
        
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-white/80">
          <div className="text-center">
            <div className="text-2xl font-bold">60s</div>
            <div className="text-sm">Foundation setup</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">₦0</div>
            <div className="text-sm">To begin</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">7 days</div>
            <div className="text-sm">Free foundation</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">100%</div>
            <div className="text-sm">{activeAudience === "entrepreneurs" ? "Your business growth" : "Verified experiences"}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Index;