import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Heart, Target, Users, Zap, Shield, Globe } from "lucide-react";
import Navbar from "@/components/Navbar";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
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

      {/* Mission & Vision */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-8 h-8 text-accent" />
                <h2 className="text-3xl font-bold">Our Mission</h2>
              </div>
              <p className="text-lg text-muted-foreground">
                To empower solo entrepreneurs in Africa with simple tools that make them look and operate 
                like established brands — without needing coding, design, or marketing experience.
              </p>
              <p className="text-lg text-muted-foreground">
                We're taking the power that big e-commerce platforms have and putting it in one person's hands — affordably.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-8 h-8 text-accent" />
                <h2 className="text-3xl font-bold">Our Vision</h2>
              </div>
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
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Heart className="w-12 h-12 text-accent mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-6">The Heart of SteerSolo</h2>
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
              <p className="text-xl font-semibold text-accent">
                "Even if it's just you — SteerSolo makes it look like a team."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Core Values</h2>
            <p className="text-xl text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              <Card key={index} className="text-center border-2 hover:border-accent transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle>{value.title}</CardTitle>
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
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How SteerSolo Works</h2>
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
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">{step.step}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Build Your Brand?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join the movement of solo entrepreneurs building professional businesses across Africa
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Start Your Store
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/shops">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground">
                Explore Shops
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p className="mb-4">© 2025 SteerSolo. Empowering Nigerian Entrepreneurs.</p>
            <div className="flex justify-center gap-6 flex-wrap">
              <Link to="/" className="hover:text-accent transition-colors">Home</Link>
              <Link to="/about" className="hover:text-accent transition-colors">About</Link>
              <Link to="/contact" className="hover:text-accent transition-colors">Contact</Link>
              <Link to="/terms" className="hover:text-accent transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-accent transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;