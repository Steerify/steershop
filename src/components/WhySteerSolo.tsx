import { Store, MessageCircle, Shield, CheckCircle, X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const explainerCards = [
  {
    icon: Store,
    title: "Your Own Store",
    description: "Get a professional online storefront with a unique link you can share anywhere — WhatsApp, Instagram, or in person.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp-Powered",
    description: "Receive order notifications and talk to customers directly on WhatsApp. No new apps to learn.",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Accept payments via Paystack or bank transfer. Track every order and naira in your dashboard.",
  },
];

const comparisonFeatures = [
  { feature: "Professional product catalog", social: false, steersolo: true },
  { feature: "Automatic order tracking", social: false, steersolo: true },
  { feature: "Secure online payments", social: false, steersolo: true },
  { feature: "One shareable store link", social: false, steersolo: true },
  { feature: "Customer order history", social: false, steersolo: true },
  { feature: "Sales analytics & insights", social: false, steersolo: true },
  { feature: "Free to start posting", social: true, steersolo: true },
  { feature: "Large existing audience", social: true, steersolo: false, steersololabel: "You bring yours" },
];

export const WhySteerSolo = () => {
  return (
    <>
      {/* What is SteerSolo? */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary mb-2 tracking-wide uppercase">WHAT IS STEERSOLO?</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Your business deserves more than a WhatsApp Status
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              SteerSolo gives Nigerian entrepreneurs a professional online store — set up in minutes, powered by WhatsApp, and built for trust.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {explainerCards.map((card) => (
              <Card key={card.title} className="border-0 shadow-sm hover:shadow-md transition-shadow text-center">
                <CardContent className="p-8">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-5">
                    <card.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                  <p className="text-muted-foreground text-sm">{card.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why not just sell on social media? */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Why not just sell on social media?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Social media is great for marketing. But selling needs structure.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* Comparison Table */}
            <div className="rounded-xl border overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-3 bg-muted/50 font-semibold text-sm">
                <div className="p-4">Feature</div>
                <div className="p-4 text-center">Social Media</div>
                <div className="p-4 text-center text-primary">SteerSolo</div>
              </div>
              
              {/* Rows */}
              {comparisonFeatures.map((row, idx) => (
                <div 
                  key={row.feature} 
                  className={`grid grid-cols-3 text-sm ${idx % 2 === 0 ? "bg-background" : "bg-muted/20"} border-t`}
                >
                  <div className="p-4 font-medium">{row.feature}</div>
                  <div className="p-4 flex justify-center">
                    {row.social ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-destructive/60" />
                    )}
                  </div>
                  <div className="p-4 flex justify-center">
                    {row.steersolo ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <span className="text-xs text-muted-foreground">{row.steersololabel}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Callout */}
            <div className="mt-8 text-center">
              <p className="text-lg font-semibold mb-4">
                Use social media for <span className="text-muted-foreground">marketing</span>. Use SteerSolo for <span className="text-primary">selling</span>.
              </p>
              <Link to="/auth/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Start Your Store Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
