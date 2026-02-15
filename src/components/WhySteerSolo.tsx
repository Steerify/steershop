import { Store, MessageCircle, Shield, CheckCircle, ArrowRight, Handshake } from "lucide-react";
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

const whatsappBrings = [
  "Direct customer chat",
  "Personal relationships",
  "Instant communication",
  "Status updates for marketing",
];

const steersoloAdds = [
  "Professional product catalog",
  "Secure online payments",
  "Automatic order tracking",
  "Customer order history",
  "Sales analytics & insights",
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
              From excessive chats to a real store
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              SteerSolo gives WhatsApp sellers a professional storefront — set up in minutes, built for trust, designed to close more sales.
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

      {/* WhatsApp + SteerSolo = Better Together */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-4">
              <Handshake className="w-4 h-4 text-green-600" />
              <span className="text-green-600 font-semibold text-sm">BETTER TOGETHER</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              WhatsApp + SteerSolo: Your selling superpower
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              You keep selling on WhatsApp. SteerSolo handles payments, catalogs, and tracking.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 mb-10">
            {/* WhatsApp Brings */}
            <Card className="border-green-500/20 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold">What WhatsApp does best</h3>
                </div>
                <ul className="space-y-3">
                  {whatsappBrings.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* SteerSolo Adds */}
            <Card className="border-primary/20 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Store className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">What SteerSolo adds</h3>
                </div>
                <ul className="space-y-3">
                  {steersoloAdds.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Callout */}
          <div className="text-center">
            <p className="text-lg font-semibold mb-4">
              Keep selling on WhatsApp. Let SteerSolo handle <span className="text-primary">payments, catalogs, and tracking</span>.
            </p>
            <Link to="/auth/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Start Your Store Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
