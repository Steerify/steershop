import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  MessageCircle,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { TypewriterEffect } from "@/components/TypewriterEffect";
import { Footer } from "@/components/Footer";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { FeaturedShopsBanner } from "@/components/FeaturedShopsBanner";
import { ShopperDiscovery } from "@/components/ShopperDiscovery";
import { WhySteerSolo } from "@/components/WhySteerSolo";
import { HomepageReviews } from "@/components/HomepageReviews";
import { HowItWorks } from "@/components/HowItWorks";
import { DynamicPricing } from "@/components/DynamicPricing";
import { SocialProofStats } from "@/components/SocialProofStats";
import { Card, CardContent } from "@/components/ui/card";

const painPoints = [
  {
    icon: XCircle,
    pain: '"Send your account details"',
    description: "Repeating payment info in every single DM. Customers drop off.",
  },
  {
    icon: AlertTriangle,
    pain: '"Is this still available?"',
    description: "No catalog. No prices. Customers can't browse — they just leave.",
  },
  {
    icon: XCircle,
    pain: '"I sent the money yesterday"',
    description: "No order tracking. You can't tell who paid and who didn't.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* SECTION 1: HERO — Outcome-first */}
      <section className="relative pt-28 md:pt-32 pb-12 overflow-hidden bg-mesh">
        {/* Layered gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/20 to-accent/5 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-96 h-96 rounded-full bg-gradient-to-tl from-accent/15 to-transparent blur-[80px] pointer-events-none" />
        <AdirePattern variant="dots" className="absolute inset-0 opacity-[0.03] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-primary text-sm font-semibold border border-primary/15 shadow-sm animate-fade-up">
              <Sparkles className="w-4 h-4" />
              <span>Trusted by 2,000+ Nigerian vendors</span>
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse ml-1" />
            </div>

            {/* Main headline */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight animate-fade-up text-balance leading-[1.1]" style={{ animationDelay: '80ms' }}>
              Turn WhatsApp traffic into{" "}
              <TypewriterEffect
                texts={["completed orders", "predictable revenue", "repeat customers", "a real business"]}
                className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent"
              />{" "}
              <span className="text-foreground">in 14 days.</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-up text-balance" style={{ animationDelay: '160ms' }}>
              Stop losing sales to DM chaos. Get a professional storefront with payments, order tracking, and AI marketing — setup takes 10 minutes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2 animate-fade-up" style={{ animationDelay: '240ms' }}>
              <Link to="/auth/signup">
                <Button size="lg" className="group bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-base px-8 py-6 shadow-xl shadow-primary/25 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 w-full sm:w-auto font-bold rounded-2xl">
                  Start Free Forever
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="text-base px-8 py-6 w-full sm:w-auto rounded-2xl border-primary/25 hover:bg-primary/5 hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300 font-semibold">
                  See a Demo Store
                </Button>
              </Link>
            </div>

            {/* Trust chips */}
            <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: '320ms' }}>
              <div className="flex items-center gap-1.5 bg-card border border-border/60 rounded-full px-3 py-1.5 shadow-sm">
                <CheckCircle className="w-4 h-4 text-accent" />
                10-minute setup
              </div>
              <div className="flex items-center gap-1.5 bg-card border border-border/60 rounded-full px-3 py-1.5 shadow-sm">
                <Clock className="w-4 h-4 text-primary" />
                Free forever plan
              </div>
              <div className="flex items-center gap-1.5 bg-card border border-border/60 rounded-full px-3 py-1.5 shadow-sm">
                <MessageCircle className="w-4 h-4 text-green-600" />
                WhatsApp-powered
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: PAIN MIRROR — Hook them emotionally first */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-destructive mb-3 tracking-widest uppercase">Sound familiar?</p>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold mb-4">
              The everyday selling chaos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              You're not losing sales because demand is low — you're losing them because your order process is messy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {painPoints.map((point) => (
              <Card key={point.pain} className="border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-2xl">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-destructive/10 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                    <point.icon className="w-6 h-6 text-destructive" />
                  </div>
                  <h3 className="text-base font-bold mb-2 text-foreground">{point.pain}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{point.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-lg font-bold">
              SteerSolo fixes all of this.{" "}
              <span className="text-gradient">In one link.</span>
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: WHAT IS STEERSOLO + WHY — Show the solution */}
      <WhySteerSolo />

      {/* SECTION 4: HOW IT WORKS — Make it feel easy */}
      <HowItWorks />

      {/* SECTION 5: SOCIAL PROOF STATS — Back it up with numbers */}
      <SocialProofStats />

      {/* SECTION 6: REVIEWS — Real people, real trust */}
      <HomepageReviews />

      {/* SECTION 7: FEATURED SHOPS — Show live proof */}
      <FeaturedShopsBanner />

      {/* SECTION 8: PRICING — Now they're ready to buy */}
      <DynamicPricing />

      {/* SECTION 9: SHOPPER DISCOVERY — Secondary value prop */}
      <ShopperDiscovery />

      {/* SECTION 10: FINAL CTA — Close with guarantee */}
      <section className="relative py-24 overflow-hidden">
        {/* Rich gradient BG */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-[hsl(175,55%,30%)] to-accent" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl" />
        <AdirePattern variant="circles" className="absolute inset-0 text-white" opacity={0.07} />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/15 backdrop-blur-md text-white text-sm font-semibold mb-8 border border-white/20">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Your first order is closer than you think
            </div>

            <h2 className="font-display text-4xl md:text-5xl font-extrabold text-white mb-6 text-balance leading-tight">
              Get your first order within 14 days — or your next month is free
            </h2>
            <p className="text-xl text-white/75 mb-3 max-w-xl mx-auto">
              Complete your setup milestones and watch your WhatsApp traffic become real orders.
            </p>
            <p className="text-sm text-white/50 mb-10 italic">
              "If SteerSolo doesn't make your business more professional, you don't pay."
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
              <Link to="/auth/signup">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold text-base px-10 py-6 shadow-2xl hover:shadow-white/20 hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto rounded-2xl">
                  Start Your Free Store
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold text-base px-10 py-6 w-full sm:w-auto rounded-2xl transition-all duration-300 hover:-translate-y-0.5">
                  View Demo Store
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-5 text-sm text-white/65">
              {["Free forever plan", "No credit card required", "Cancel anytime"].map(t => (
                <div key={t} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-white/80" />{t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
