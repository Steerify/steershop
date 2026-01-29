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
  Users,
  ChevronRight,
  Star,
  Building,
  Rocket,
  Sparkles,
  Heart,
  Target,
  TrendingUp,
  BarChart,
  Play,
  Users as UsersIcon,
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
  const [activeAudience, setActiveAudience] = useState<"sellers" | "shoppers">("sellers");

  const sellerMilestones = [
    "Create store in minutes",
    "Share one link to sell",
    "Get WhatsApp orders",
    "Grow your business"
  ];

  const shopperDiscoveries = [
    "Discover unique products",
    "Chat directly with makers",
    "Shop securely",
    "Support local businesses"
  ];

  return (
    <div className="min-h-screen bg-background">
      <UrgencyBanner />
      <Navbar />

      {/* SECTION 1: PROFESSIONAL HERO */}
      <section className="relative pt-20 md:pt-24 pb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Simplified Audience Toggle */}
          <div className="max-w-sm mx-auto mb-10">
            <Tabs
              value={activeAudience}
              onValueChange={(value) => setActiveAudience(value as "sellers" | "shoppers")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 p-1 bg-card border shadow-sm">
                <TabsTrigger
                  value="sellers"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
                >
                  <Store className="w-4 h-4 mr-2" />
                  <span className="font-medium">For Sellers</span>
                </TabsTrigger>
                <TabsTrigger
                  value="shoppers"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  <span className="font-medium">For Shoppers</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Dynamic Hero Content */}
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Trusted by 5,000+ Nigerian businesses
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              {activeAudience === "sellers" ? (
                <>
                  Sell online.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                    <TypewriterEffect
                      texts={sellerMilestones}
                      typingSpeed={80}
                      deletingSpeed={40}
                      pauseDuration={2000}
                    />
                  </span>
                </>
              ) : (
                <>
                  Shop unique.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                    <TypewriterEffect
                      texts={shopperDiscoveries}
                      typingSpeed={80}
                      deletingSpeed={40}
                      pauseDuration={2000}
                    />
                  </span>
                </>
              )}
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {activeAudience === "sellers"
                ? "Create a professional store in minutes. Share one link. Receive orders via WhatsApp. No tech skills needed."
                : "Browse authentic products from Nigerian entrepreneurs. Chat directly with sellers. Enjoy personalized service."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to={activeAudience === "sellers" ? "/auth/signup" : "/shops"}>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white text-lg px-8 py-6 shadow-lg transition-all">
                  {activeAudience === "sellers" ? "Start Free Trial" : "Browse Stores"}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground pt-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-blue-500 mr-2" />
                Set up in 5 minutes
              </div>
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-purple-500 mr-2" />
                Secure payments
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: TRUST LOGOS */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <p className="text-center text-muted-foreground text-sm font-medium mb-8">TRUSTED BY BUSINESSES ACROSS NIGERIA</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center">
            {["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano"].map((city) => (
              <div key={city} className="text-foreground font-semibold">{city}</div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: VALUE PROPOSITION */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {activeAudience === "sellers"
                ? "Everything you need to sell online"
                : "Why shop with independent sellers"}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {activeAudience === "sellers"
                ? "From your first sale to scaling your business"
                : "Get more than just products—get stories and service"}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {activeAudience === "sellers" ? (
              <>
                <ValueCard
                  icon={MessageCircle}
                  title="WhatsApp Order Management"
                  description="Receive and manage orders directly in WhatsApp. No apps to download for customers."
                  color="blue"
                  linkText="Learn more"
                  linkTo="/features/whatsapp"
                />
                <ValueCard
                  icon={TrendingUp}
                  title="Business Growth Tools"
                  description="Analytics, customer management, and marketing tools to help you grow."
                  color="green"
                  linkText="Learn more"
                  linkTo="/features/growth"
                />
                <ValueCard
                  icon={Shield}
                  title="Trust & Credibility"
                  description="Professional storefront builds customer confidence and reduces payment disputes."
                  color="purple"
                  linkText="Learn more"
                  linkTo="/features/trust"
                />
              </>
            ) : (
              <>
                <ValueCard
                  icon={Heart}
                  title="Unique Products"
                  description="Discover items you won't find in regular stores, each with a story."
                  color="blue"
                  linkText="Browse shops"
                  linkTo="/shops"
                />
                <ValueCard
                  icon={MessageCircle}
                  title="Direct Communication"
                  description="Chat directly with sellers via WhatsApp for personalized service."
                  color="green"
                  linkText="How it works"
                  linkTo="/how-it-works"
                />
                <ValueCard
                  icon={Shield}
                  title="Secure Payments"
                  description="Pay via Paystack or direct transfer with purchase protection."
                  color="purple"
                  linkText="Security details"
                  linkTo="/security"
                />
              </>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 4: HOW IT WORKS */}
      <HowItWorks audience={activeAudience} />

      {/* SECTION 5: SOCIAL PROOF & STATS */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold mb-6">
                Join 5,000+ businesses growing with Storefront
              </h2>
              <div className="space-y-6">
                <StatItem
                  icon={<Star className="w-5 h-5 text-yellow-500 fill-current" />}
                  value="4.9/5"
                  label="Average seller rating"
                />
                <StatItem
                  icon={<DollarSign className="w-5 h-5 text-green-500" />}
                  value="₦2.8B+"
                  label="Total sales processed"
                />
                <StatItem
                  icon={<UsersIcon className="w-5 h-5 text-blue-500" />}
                  value="98%"
                  label="Customer satisfaction rate"
                />
              </div>
            </div>
            <div className="bg-card p-8 rounded-xl shadow-sm border">
              <div className="flex items-start mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Chidinma's Boutique</p>
                  <p className="text-muted-foreground text-sm">Fashion & Apparel, Lagos</p>
                </div>
              </div>
              <p className="italic mb-6">
                "Storefront helped us move from chaotic WhatsApp orders to a proper business.
                Sales increased by 300% in 3 months."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                  <img src="https://i.pravatar.cc/40?img=1" alt="Customer" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Chidinma Okoro</p>
                  <p className="text-xs text-muted-foreground">Business Owner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: FEATURED SHOPS */}
      <div>
        <FeaturedShopsBanner />
      </div>

      {/* SECTION 7: PRICING/DISCOVERY CTA */}
      {activeAudience === "sellers" ? <PricingSection /> : <DiscoveryCTASection />}

      {/* SECTION 8: REVIEWS */}
      <HomepageReviews audience={activeAudience} />

      {/* SECTION 9: FINAL CTA */}
      <FinalCTA activeAudience={activeAudience} onSwitch={() => setActiveAudience(activeAudience === "sellers" ? "shoppers" : "sellers")} />

      <Footer />
    </div>
  );
};

/* ================= VALUE CARD COMPONENT ================= */
const ValueCard = ({
  icon: Icon,
  title,
  description,
  color = "blue",
  linkText,
  linkTo
}: {
  icon: any;
  title: string;
  description: string;
  color?: "blue" | "green" | "purple";
  linkText: string;
  linkTo: string;
}) => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600"
  };

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-8">
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center mb-6`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>
        <Link to={linkTo} className="text-primary text-sm font-medium flex items-center">
          {linkText} <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </CardContent>
    </Card>
  );
};

/* ================= STAT ITEM COMPONENT ================= */
const StatItem = ({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) => (
  <div>
    <div className="flex items-center mb-2">
      {icon}
      <span className="ml-2 text-3xl font-bold">{value}</span>
    </div>
    <p className="text-muted-foreground">{label}</p>
  </div>
);

/* ================= PRICING SECTION ================= */
const PricingSection = () => (
  <section className="py-20">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Start free. Grow with our business tools.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">Starter</CardTitle>
            <CardDescription>Perfect for getting started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <span className="text-4xl font-bold">₦0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {["1 storefront", "50 products", "Basic WhatsApp orders", "Email support"].map((feature) => (
                <li key={feature} className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link to="/auth/signup">
              <Button variant="outline" className="w-full">Start Free</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-primary text-primary-foreground text-sm font-medium px-4 py-1 rounded-full">
              Most Popular
            </span>
          </div>
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">Business</CardTitle>
            <CardDescription>For growing businesses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <span className="text-4xl font-bold">₦1,000</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {["Unlimited products", "Advanced analytics", "Paystack integration", "Priority support", "Custom domain", "Customer management"].map((feature) => (
                <li key={feature} className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-primary mr-3" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link to="/auth/signup">
              <Button className="w-full bg-primary hover:bg-primary/90">Start 7-Day Free Trial</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
);

/* ================= DISCOVERY CTA SECTION ================= */
const DiscoveryCTASection = () => (
  <section className="py-20">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl font-bold mb-4">Ready to discover?</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Browse unique products from Nigerian entrepreneurs. No account needed to start.
        </p>
      </div>
      <div className="max-w-md mx-auto">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-primary mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-4">Free to browse</h3>
            <p className="text-muted-foreground mb-8">
              View stores, chat with sellers, and save favorites.
            </p>
            <Link to="/shops">
              <Button size="lg" className="w-full bg-primary hover:bg-primary/90">
                <Sparkles className="w-5 h-5 mr-2" />
                Explore Stores
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
  <section className="relative py-20 overflow-hidden bg-primary">
    <AdirePattern variant="circles" className="text-white" opacity={0.1} />

    <div className="container mx-auto px-4 text-center relative z-10">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to {activeAudience === "sellers" ? "grow your business?" : "shop differently?"}
        </h2>
        <p className="text-xl text-white/90 mb-8">
          {activeAudience === "sellers"
            ? "Join thousands of Nigerian entrepreneurs selling smarter."
            : "Connect directly with makers and discover unique products."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link to={activeAudience === "sellers" ? "/auth/signup" : "/shops"}>
            <Button size="lg" variant="secondary" className="text-lg px-10 py-6 shadow-xl hover:shadow-2xl">
              {activeAudience === "sellers" ? "Get Started Free" : "Start Shopping"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-10 py-6 border-white/30 text-white hover:bg-white/10"
            onClick={onSwitch}
          >
            View {activeAudience === "sellers" ? "Shopper" : "Seller"} Experience
          </Button>
        </div>
        <p className="text-white/70 text-sm">
          {activeAudience === "sellers"
            ? "7-day free trial • Cancel anytime • No setup fees"
            : "No account required • Secure payments • Direct seller support"}
        </p>
      </div>
    </div>
  </section>
);

export default Index;