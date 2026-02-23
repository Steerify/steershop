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
      <section className="relative pt-20 md:pt-24 pb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Trusted by Nigerian businesses
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Turn WhatsApp traffic into{" "}
              <TypewriterEffect
                texts={["completed orders", "predictable revenue", "repeat customers", "a real business"]}
                className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent"
              />{" "}
              in 14 days.
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stop losing sales to DM chaos. Get a professional storefront with payments, order tracking, and customer management — setup takes 10 minutes.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link to="/auth/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 shadow-lg transition-all w-full sm:w-auto">
                  Start Free — No Card Needed
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 w-full sm:w-auto">
                  See a Demo Store
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground pt-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                10-minute setup
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-blue-500 mr-2" />
                15-day free trial
              </div>
              <div className="flex items-center">
                <MessageCircle className="w-5 h-5 text-green-600 mr-2" />
                WhatsApp-powered
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: SOCIAL PROOF STATS */}
      <SocialProofStats />

      {/* SECTION 3: PAIN MIRROR — "Sound familiar?" */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-destructive mb-2 tracking-wide uppercase">SOUND FAMILIAR?</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              The WhatsApp selling chaos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              You're not losing sales because demand is low — you're losing them because your order process is messy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {painPoints.map((point) => (
              <Card key={point.pain} className="border-destructive/20 bg-destructive/5 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center mb-4">
                    <point.icon className="w-6 h-6 text-destructive" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{point.pain}</h3>
                  <p className="text-muted-foreground text-sm">{point.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-lg font-semibold">
              SteerSolo fixes all of this.{" "}
              <span className="text-primary">In one link.</span>
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: FEATURED SHOPS */}
      <FeaturedShopsBanner />

      {/* SECTION 5: SHOPPER DISCOVERY */}
      <ShopperDiscovery />

      {/* SECTION 6: WHAT IS STEERSOLO + WHY */}
      <WhySteerSolo />

      {/* SECTION 7: HOW IT WORKS */}
      <HowItWorks />

      {/* SECTION 8: PRICING */}
      <DynamicPricing />

      {/* SECTION 9: REVIEWS */}
      <HomepageReviews />

      {/* SECTION 10: FINAL CTA — with guarantee */}
      <section className="relative py-20 overflow-hidden bg-primary">
        <AdirePattern variant="circles" className="text-primary-foreground" opacity={0.1} />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-foreground/10 text-primary-foreground text-sm font-medium mb-6">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Your first order is closer than you think
            </div>

            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              Get your first order within 14 days — or your next month is free
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-4">
              Complete your setup milestones and start converting WhatsApp traffic into real orders.
            </p>
            <p className="text-sm text-primary-foreground/60 mb-8 italic">
              "If SteerSolo doesn't make your business more professional, you don't pay."
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Link to="/auth/signup">
                <Button size="lg" variant="secondary" className="text-lg px-10 py-6 shadow-xl hover:shadow-2xl w-full sm:w-auto">
                  Start Your Free Store
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-lg px-10 py-6 w-full sm:w-auto">
                  View Demo Store
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-primary-foreground/70">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                15-day free trial
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
