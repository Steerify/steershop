import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { FeaturedShopsBanner } from "@/components/FeaturedShopsBanner";
import { SocialProofStats } from "@/components/SocialProofStats";
import { UrgencyBanner } from "@/components/UrgencyBanner";
import { HomepageReviews } from "@/components/HomepageReviews";
import { HowItWorks } from "@/components/HowItWorks";
import { TrustBadgesSection } from "@/components/TrustBadgesSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <UrgencyBanner />
      <Navbar />
      
      {/* SECTION 1: HERO (ABOVE THE FOLD) */}
      <section className="relative pt-20 md:pt-24 pb-8 overflow-hidden">
        <AdirePattern variant="geometric" className="text-primary" opacity={0.6} />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Sell on WhatsApp — with a professional store link
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Create a clean online shop in 60 seconds. <br />
              Share one link. Get orders directly on WhatsApp. Get paid easily.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/auth/signup">
                <Button size="lg" className="bg-gradient-to-r from-accent to-primary text-white text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 w-full sm:w-auto">
                  Create My Store (Free)
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 w-full sm:w-auto">
                  <Search className="w-5 h-5 mr-2" />
                  See a Demo Store
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-500 inline mr-1" />
              No credit card required • 7-day free trial
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: PROBLEM → SOLUTION */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              From Chaotic Chats to Professional Sales
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We make WhatsApp selling simple and trusted for Nigerian businesses.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Repeating Prices in Chats</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Wasting time explaining products over and over.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Losing Orders in WhatsApp</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Messages get buried, follow-ups forgotten.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Customers Don’t Trust New Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Blurry photos and casual chats hurt credibility.</p>
              </CardContent>
            </Card>
          </div>
          <div className="text-center my-8">
            <ChevronRight className="w-12 h-12 mx-auto text-primary rotate-90 md:rotate-0" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-xl">One Clean Store Link</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Share once, let customers browse anytime.</p>
              </CardContent>
            </Card>
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-xl">Orders Straight to WhatsApp</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Organized chats, easy tracking.</p>
              </CardContent>
            </Card>
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-xl">Professional Presence Builds Trust</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Look like a real business from day one.</p>
              </CardContent>
            </Card>
          </div>
          <p className="text-center text-lg text-muted-foreground mt-8">
            This is how Nigerian businesses already sell — SteerSolo just makes it professional.
          </p>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <HowItWorks />  {/* Assuming this is simplified to 3 steps */}

      {/* SECTION 4: PRICE */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="border-2 border-primary/20 shadow-2xl relative overflow-hidden">
              <CardHeader className="text-center pb-6 pt-8">
                <CardTitle className="font-display text-3xl">Everything You Need to Sell</CardTitle>
                <CardDescription className="text-lg">For ₦1,000/month</CardDescription>
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
                    "Unlimited products",
                    "WhatsApp orders",
                    "Paystack & manual payments",
                    "Your own store link",
                    "No tech skills required"
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
                      Create My Store
                    </Button>
                  </Link>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="w-4 h-4" />
                    7-day free trial • No card required
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 5: PROOF */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-4">
              Built for Nigerian Vendors
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple credibility that works.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: MessageCircle,
                title: "WhatsApp-First",
                description: "Sell how you already do"
              },
              {
                icon: DollarSign,
                title: "Paystack Integrated",
                description: "Easy Nigerian payments"
              },
              {
                icon: Shield,
                title: "No Website Stress",
                description: "Simple store link"
              },
              {
                icon: Building,
                title: "Built for Nigeria",
                description: "Local vendors in mind"
              }
            ].map((item, index) => (
              <Card key={index} className="text-center">
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
          {/* Add simple testimonials */}
          <HomepageReviews />  {/* Assuming this has real-ish proof */}
        </div>
      </section>

      {/* SECTION 6: WHO IT’S FOR */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-8">
            Perfect for Nigerian Businesses Like Yours
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Fashion Vendors",
              "Skincare Sellers",
              "Food Vendors",
              "Accessories & Gadgets",
              "Service Businesses",
              "Tech Solutions",
              "Artisanal Products",
              "Beauty & Wellness"
            ].map((category, index) => (
              <Card key={index} className="text-center hover:bg-accent/5 cursor-pointer transition-all hover:-translate-y-1 border-primary/10">
                <CardContent className="p-6">
                  <h3 className="font-medium text-foreground">{category}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: FINAL CTA */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
        <AdirePattern variant="circles" className="text-white" opacity={0.15} />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
              Stop Explaining Your Business in Chats
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Send one link. Look professional. Sell with confidence.
            </p>
            <Link to="/auth/signup">
              <Button size="lg" variant="secondary" className="text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5">
                Create My Store (Free)
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <TrustBadgesSection />
      <Footer />
    </div>
  );
};

export default Index;