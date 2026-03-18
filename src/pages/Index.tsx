import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Store, Sparkles, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FeaturedShopsBanner } from "@/components/FeaturedShopsBanner";
import { WhySteerSolo } from "@/components/WhySteerSolo";
import { HomepageReviews } from "@/components/HomepageReviews";
import { HowItWorks } from "@/components/HowItWorks";
import { DynamicPricing } from "@/components/DynamicPricing";
import { GoogleOneTap } from "@/components/auth/GoogleOneTap";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <GoogleOneTap />
      <Navbar />

      {/* HERO — Full-width Shopify style */}
      <section className="shopify-hero" style={{ minHeight: '70vh' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/95 to-foreground/80" />
        <div className="shopify-hero-overlay" style={{ background: 'transparent' }}>
          <div className="max-w-3xl mx-auto flex flex-col items-center gap-6 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/10 backdrop-blur-sm text-background/80 text-xs font-medium border border-background/15">
              <Sparkles className="w-3.5 h-3.5" />
              Trusted by Nigerian vendors
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-background tracking-tight text-center leading-[1.05]">
              Your Daily Selling
              <br />
              System is here.
            </h1>

            <p className="text-background/70 text-base md:text-lg max-w-xl text-center">
              Stop losing sales to DM chaos. Professional storefront, payments, and order tracking — setup takes 10 minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link to="/auth/signup">
                <Button size="lg" className="bg-background text-foreground hover:bg-background/90 font-medium text-sm px-8 h-12 rounded-full w-full sm:w-auto">
                  Start Free Forever
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="border-background/30 text-background hover:bg-background/10 font-medium text-sm px-8 h-12 rounded-full w-full sm:w-auto">
                  See a Demo Store
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-6 text-xs text-background/50 pt-2">
              {["Free forever plan", "No credit card", "Cancel anytime"].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3" />{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY STEERSOLO — Clean 3-column */}
      <WhySteerSolo />

      {/* HOW IT WORKS */}
      <HowItWorks />

      {/* REVIEWS */}
      <HomepageReviews />

      {/* FEATURED SHOPS — Shopify collection style */}
      <FeaturedShopsBanner />

      {/* PRICING */}
      <DynamicPricing />

      {/* FINAL CTA — Full-width overlay */}
      <section className="shopify-hero" style={{ minHeight: '50vh' }}>
        <div className="absolute inset-0 bg-foreground" />
        <div className="shopify-hero-overlay" style={{ background: 'transparent' }}>
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-5">
            <h2 className="text-3xl md:text-5xl font-bold text-background tracking-tight text-center">
              Your first order could come within 14 days
            </h2>
            <p className="text-background/60 text-sm md:text-base text-center max-w-lg">
              Complete your setup milestones and watch your WhatsApp traffic become real orders.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link to="/auth/signup">
                <Button size="lg" className="bg-background text-foreground hover:bg-background/90 font-medium text-sm px-8 h-12 rounded-full">
                  Start Your Free Store
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="border-background/30 text-background hover:bg-background/10 font-medium text-sm px-8 h-12 rounded-full">
                  View Demo Store
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
