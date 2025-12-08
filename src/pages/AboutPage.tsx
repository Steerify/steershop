import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Heart, Target, Users, Zap, Shield, Globe } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AdirePattern, AdireDivider } from "@/components/patterns/AdirePattern";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <AdirePattern variant="dots" className="absolute inset-0 opacity-20" />
        
        {/* Decorative blobs */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-up">
            <h1 className="text-5xl lg:text-6xl font-heading font-bold mb-6">
              Built for the 
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Solo Hustler</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              SteerSolo is where one-person businesses look like established brands. 
              We're empowering Africa's independent entrepreneurs with tools that make them shine.
            </p>
          </div>
        </div>
      </section>

      <AdireDivider className="max-w-4xl mx-auto" />

      {/* Mission & Vision */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-up">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                <Target className="w-5 h-5 text-accent" />
                <span className="text-sm font-semibold text-accent">Our Mission</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-heading font-bold">Empowering Solo Entrepreneurs</h2>
              <p className="text-lg text-muted-foreground">
                To empower solo entrepreneurs in Africa with simple tools that make them look and operate 
                like established brands — without needing coding, design, or marketing experience.
              </p>
              <p className="text-lg text-muted-foreground">
                We're taking the power that big e-commerce platforms have and putting it in one person's hands — affordably.
              </p>
            </div>
            
            <div className="space-y-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Globe className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary">Our Vision</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-heading font-bold">Africa's Digital Marketplace</h2>
              <p className="text-lg text-muted-foreground">
                To be the home of Africa's independent entrepreneurs — a single platform where anyone 
                with a skill, service, or small product line can build, grow, and get seen.
              </p>
              <p className="text-lg text-muted-foreground">
                SteerSolo is the digital street market of Africa's future — every small business, one click away.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Story */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-card/50 to-background" />
        <AdirePattern variant="lines" className="absolute inset-0 opacity-10" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6 animate-float">
              <Heart className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-4xl font-heading font-bold mb-6">The Heart of SteerSolo</h2>
            <div className="space-y-6 text-lg text-muted-foreground">
              <p>
                SteerSolo was born from a simple observation: Africa is full of incredible solo entrepreneurs 
                — the tailor running her business on WhatsApp, the shoe vendor posting daily on Instagram, 
                the skincare seller who DMs every customer manually.
              </p>
              <p>
                These hustlers are building something real, alone — but they deserve to look and feel professional. 
                That's what SteerSolo provides: the polish that turns hustle into brand.
              </p>
              <p className="text-2xl font-heading font-semibold text-accent italic">
                "Even if it's just you — SteerSolo makes it look like a team."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold mb-4">Our Core Values</h2>
            <p className="text-xl text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Simplicity",
                description: "Easy enough for anyone to use, powerful enough to build a real business"
              },
              {
                icon: Shield,
                title: "Trust",
                description: "Built for transparency and honesty in every transaction"
              },
              {
                icon: Users,
                title: "Empowerment",
                description: "Making every solo entrepreneur feel capable and confident"
              },
              {
                icon: Target,
                title: "Visibility",
                description: "Helping small businesses get discovered by the right customers"
              },
              {
                icon: Heart,
                title: "Community",
                description: "Encouraging connection and growth, not competition"
              },
              {
                icon: Globe,
                title: "Local First",
                description: "Built for African realities and business contexts"
              }
            ].map((value, index) => (
              <Card 
                key={index} 
                className="group text-center border-2 border-border/50 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="w-14 h-14 bg-gradient-to-br from-accent/20 to-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <value.icon className="w-7 h-7 text-accent" />
                  </div>
                  <CardTitle className="font-heading">{value.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {value.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-card/30" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold mb-4">How SteerSolo Works</h2>
            <p className="text-xl text-muted-foreground">
              Simple steps to transform your hustle into a professional brand
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "1",
                title: "Sign Up",
                description: "Create your account in seconds"
              },
              {
                step: "2",
                title: "Build Your Store",
                description: "Add products, set prices, upload photos"
              },
              {
                step: "3",
                title: "Share & Sell",
                description: "Share your unique store link everywhere"
              },
              {
                step: "4",
                title: "Grow",
                description: "Manage orders, get reviews, build reputation"
              }
            ].map((step, index) => (
              <div 
                key={index} 
                className="text-center relative animate-fade-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Connector line */}
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-accent to-accent/20" />
                )}
                
                <div className="relative inline-flex">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/20">
                    <span className="text-white font-heading font-bold text-xl">{step.step}</span>
                  </div>
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent" />
        <AdirePattern variant="circles" className="absolute inset-0 opacity-10" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground mb-6">
            Ready to Build Your Brand?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join the movement of solo entrepreneurs building professional businesses across Africa
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?tab=signup">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 font-semibold shadow-xl hover:shadow-2xl transition-shadow">
                Start Your Store
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/shops">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-semibold">
                Explore Shops
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
