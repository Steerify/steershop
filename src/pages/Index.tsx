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
  const heroMessages = [
    "From WhatsApp Chaos to Professional Store",
    "From Price Haggling to Clear Confidence",
    "From Blurry Photos to Stunning Showcases",
    "From Lost Customers to Loyal Fans",
    "From Hustle to Structured Success"
  ];

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

            {/* Paystack Badge */}
            <div className="flex justify-center pt-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full">
                <div className="w-6 h-6 bg-[#00C3F7]/20 rounded flex items-center justify-center">
                  <span className="text-[#00C3F7] font-bold text-xs">PS</span>
                </div>
                <span className="text-sm text-muted-foreground">Powered by Paystack</span>
              </div>
            </div>
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

export default Index;
