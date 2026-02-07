import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Heart, Target, Users, Zap, Shield, Globe } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdirePattern, AdireDivider } from "@/components/patterns/AdirePattern";
import { PageWrapper } from "@/components/PageWrapper";

const About = () => {
  return (
    <PageWrapper patternVariant="waves" patternOpacity={0.3}>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
        <AdirePattern variant="circles" className="text-primary" opacity={0.15} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Built for the 
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Solo Hustler</span>
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8 px-2">
              SteerSolo is where one-person businesses look like established brands. 
              We're empowering Africa's independent entrepreneurs with tools that make them shine.
            </p>
          </div>
        </div>
      </section>

      <AdireDivider />

      {/* Mission & Vision */}
      <section className="py-12 sm:py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3 mb-2 sm:mb-4">
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
                <h2 className="text-2xl sm:text-3xl font-bold">Our Mission</h2>
              </div>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                To empower solo entrepreneurs in Africa with simple tools that make them look and operate 
                like established brands — without needing coding, design, or marketing experience.
              </p>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                We're taking the power that big e-commerce platforms have and putting it in one person's hands — affordably.
              </p>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3 mb-2 sm:mb-4">
                <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
                <h2 className="text-2xl sm:text-3xl font-bold">Our Vision</h2>
              </div>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                To be the home of Africa's independent entrepreneurs — a single platform where anyone 
                with a skill, service, or small product line can build, grow, and get seen.
              </p>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                SteerSolo is the digital street market of Africa's future — every small business, one click away.
              </p>
            </div>
          </div>
        </div>
      </section>

      <AdireDivider />

      {/* The Story */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-accent mx-auto mb-4 sm:mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">The Heart of SteerSolo</h2>
            <div className="space-y-4 sm:space-y-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
              <p>
                SteerSolo was born from a simple observation: Africa is full of incredible solo entrepreneurs 
                — the tailor running her business on WhatsApp, the shoe vendor posting daily on Instagram, 
                the skincare seller who DMs every customer manually.
              </p>
              <p>
                These hustlers are building something real, alone — but they deserve to look and feel professional. 
                That's what SteerSolo provides: the polish that turns hustle into brand.
              </p>
              <p className="text-lg sm:text-xl font-semibold text-accent">
                "Even if it's just you — SteerSolo makes it look like a team."
              </p>
            </div>
          </div>
        </div>
      </section>

      <AdireDivider />

      {/* Values */}
      <section className="py-12 sm:py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">Our Core Values</h2>
            <p className="text-base sm:text-xl text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {[
              { icon: Zap, title: "Simplicity", description: "Easy enough for anyone to use, powerful enough to build a real business" },
              { icon: Shield, title: "Trust", description: "Built for transparency and honesty in every transaction" },
              { icon: Users, title: "Empowerment", description: "Making every solo entrepreneur feel capable and confident" },
              { icon: Target, title: "Visibility", description: "Helping small businesses get discovered by the right customers" },
              { icon: Heart, title: "Community", description: "Encouraging connection and growth, not competition" },
              { icon: Globe, title: "Local First", description: "Built for African realities and business contexts" }
            ].map((value, index) => (
              <Card key={index} className="text-center border-2 hover:border-accent transition-all duration-300 hover:-translate-y-1 card-hover">
                <CardHeader className="p-4 sm:p-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <value.icon className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                  </div>
                  <CardTitle className="text-sm sm:text-base">{value.title}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {value.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">How SteerSolo Works</h2>
            <p className="text-base sm:text-xl text-muted-foreground">
              Simple steps to transform your hustle into a professional brand
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-5xl mx-auto">
            {[
              { step: "1", title: "Sign Up", description: "Create your account in seconds" },
              { step: "2", title: "Build Your Store", description: "Add products, set prices, upload photos" },
              { step: "3", title: "Share & Sell", description: "Share your unique store link everywhere" },
              { step: "4", title: "Grow", description: "Manage orders, get reviews, build reputation" }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-white font-bold text-lg sm:text-xl">{step.step}</span>
                </div>
                <h3 className="font-semibold text-sm sm:text-lg mb-1 sm:mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-4 sm:mb-6">
            Ready to Build Your Brand?
          </h2>
          <p className="text-base sm:text-xl text-primary-foreground/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join the movement of solo entrepreneurs building professional businesses across Africa
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link to="/auth/signup">
              <Button size="lg" variant="secondary" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 min-h-[48px] w-full sm:w-auto">
                Start Your Store
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/shops">
              <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 border-primary-foreground text-primary-foreground min-h-[48px] w-full sm:w-auto">
                Explore Shops
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </PageWrapper>
  );
};

export default About;