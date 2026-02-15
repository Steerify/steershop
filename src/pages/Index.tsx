import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { FeaturedShopsBanner } from "@/components/FeaturedShopsBanner";
import { WhySteerSolo } from "@/components/WhySteerSolo";
import { HomepageReviews } from "@/components/HomepageReviews";
import { HowItWorks } from "@/components/HowItWorks";
import { DynamicPricing } from "@/components/DynamicPricing";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* SECTION 1: HERO */}
      <section className="relative pt-20 md:pt-24 pb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Trusted by Nigerian businesses
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Turn your WhatsApp business into a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                professional store
              </span>{" "}
              in 10 minutes.
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              SteerSolo helps WhatsApp sellers look professional, build trust instantly, and close sales faster — without building a website.
            </p>
            
            <div className="flex justify-center pt-4">
              <Link to="/auth/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white text-lg px-8 py-6 shadow-lg transition-all">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
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
                No website needed
              </div>
              <div className="flex items-center">
                <MessageCircle className="w-5 h-5 text-green-600 mr-2" />
                WhatsApp-powered
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground italic pt-2">
              "If SteerSolo doesn't make your business look more professional, you don't pay."
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: FEATURED SHOPS */}
      <FeaturedShopsBanner />

      {/* SECTION 3: PROBLEM/SOLUTION */}
      <WhySteerSolo />

      {/* SECTION 4: HOW IT WORKS */}
      <HowItWorks />

      {/* SECTION 5: PRICING */}
      <DynamicPricing />

      {/* SECTION 6: REVIEWS */}
      <HomepageReviews />

      {/* SECTION 7: FINAL CTA */}
      <section className="relative py-20 overflow-hidden bg-primary">
        <AdirePattern variant="circles" className="text-white" opacity={0.1} />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to grow your business?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of Nigerian entrepreneurs selling smarter.
            </p>
            <div className="flex justify-center mb-8">
              <Link to="/auth/signup">
                <Button size="lg" variant="secondary" className="text-lg px-10 py-6 shadow-xl hover:shadow-2xl">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
            <p className="text-white/70 text-sm">
              15-day free trial • Cancel anytime • No setup fees
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
