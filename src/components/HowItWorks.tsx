import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Palette, Rocket, ArrowRight, Search, ShoppingBag, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface HowItWorksProps {
  audience?: "entrepreneurs" | "customers";
}

const entrepreneurSteps = [
  {
    number: "01",
    title: "Sign Up Free",
    description: "Create your account in 60 seconds. No credit card required, 15-day free trial.",
    icon: UserPlus,
    color: "from-blue-500 to-cyan-500",
  },
  {
    number: "02",
    title: "Set Up Your Store",
    description: "Add your products, customize your storefront, and connect your payment methods.",
    icon: Palette,
    color: "from-primary to-accent",
  },
  {
    number: "03",
    title: "Start Selling",
    description: "Share your store link on WhatsApp, Instagram, and start receiving orders.",
    icon: Rocket,
    color: "from-green-500 to-emerald-500",
  },
];

const customerSteps = [
  {
    number: "01",
    title: "Discover Shops",
    description: "Browse unique products from passionate Nigerian entrepreneurs.",
    icon: Search,
    color: "from-blue-500 to-cyan-500",
  },
  {
    number: "02",
    title: "Shop with Ease",
    description: "Add items to cart, chat with sellers on WhatsApp, and pay securely.",
    icon: ShoppingBag,
    color: "from-primary to-accent",
  },
  {
    number: "03",
    title: "Enjoy & Repeat",
    description: "Receive quality products and earn rewards for loyal shopping.",
    icon: Heart,
    color: "from-green-500 to-emerald-500",
  },
];

export const HowItWorks = ({ audience = "entrepreneurs" }: HowItWorksProps) => {
  const steps = audience === "entrepreneurs" ? entrepreneurSteps : customerSteps;
  const ctaText = audience === "entrepreneurs" ? "Start Your Free Trial" : "Start Shopping";
  const ctaLink = audience === "entrepreneurs" ? "/auth/signup" : "/shops";
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4">
            <span className="text-sm font-semibold text-primary">SIMPLE 3-STEP PROCESS</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Get Started in Minutes
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            No technical skills required. Launch your professional online store today.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              <Card className="h-full hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
                <CardContent className="p-6 md:p-8">
                  {/* Step Number */}
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${step.color} text-white font-bold text-lg mb-4`}>
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>

              {/* Connector Arrow (hidden on last item and mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-8 h-8 text-primary/30" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to={ctaLink}>
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-white px-8 py-6 text-lg">
              {ctaText}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            {audience === "entrepreneurs" ? "No credit card required • Setup in 60 seconds" : "Free to browse • Secure payments"}
          </p>
        </div>
      </div>
    </section>
  );
};
