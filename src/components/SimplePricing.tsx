import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Rocket, Sparkles, Zap } from "lucide-react";

export const SimplePricing = () => {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">AFFORDABLE PRICING</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Start for Less Than ₦1,000
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            That's less than the cost of 1 plate of jollof rice
          </p>
        </div>

        {/* Single Pricing Card */}
        <div className="max-w-lg mx-auto">
          <Card className="relative overflow-hidden border-2 border-primary/30 shadow-2xl">
            {/* Popular Badge */}
            <div className="absolute top-4 right-4">
              <span className="bg-gradient-to-r from-accent to-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </span>
            </div>

            <CardContent className="p-8">
              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-2xl font-bold text-muted-foreground">₦</span>
                  <span className="text-6xl font-bold text-primary">1,000</span>
                  <span className="text-xl text-muted-foreground">/mo</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  7-day free trial • No card required
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {[
                  "Professional online store",
                  "Unlimited products",
                  "WhatsApp order notifications",
                  "Paystack payment integration",
                  "Custom store branding",
                  "Analytics dashboard",
                  "24/7 customer support"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link to="/auth/signup">
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-accent to-primary text-white text-lg py-6 shadow-lg hover:shadow-xl transition-all"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Your Free Trial
                </Button>
              </Link>

              {/* Trust Badge */}
              <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>Setup in 60 seconds</span>
                </div>
                <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span>Cancel anytime</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comparison Note */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Need more? View our <Link to="/pricing" className="text-primary hover:underline">Pro & Business plans</Link> for advanced features.
          </p>
        </div>
      </div>
    </section>
  );
};
