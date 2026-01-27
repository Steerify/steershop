import { Shield, CreditCard, MessageCircle, CheckCircle, Lock, Award } from "lucide-react";

const badges = [
  {
    icon: CreditCard,
    title: "Secured by Paystack",
    description: "Industry-leading payment security",
  },
  {
    icon: Lock,
    title: "SSL Encrypted",
    description: "Your data is always protected",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Integrated",
    description: "Direct customer communication",
  },
  {
    icon: Shield,
    title: "Verified Businesses",
    description: "Trusted entrepreneurs only",
  },
  {
    icon: Award,
    title: "Nigerian-Built",
    description: "Made for local businesses",
  },
  {
    icon: CheckCircle,
    title: "24/7 Support",
    description: "Help when you need it",
  },
];

export const TrustBadgesSection = () => {
  return (
    <section className="py-12 md:py-16 bg-muted/30 border-y border-border/50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
            Trusted by Nigerian Entrepreneurs
          </h2>
          <p className="text-muted-foreground">
            Built with security and reliability at its core
          </p>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-4 rounded-xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                <badge.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{badge.title}</h3>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
            </div>
          ))}
        </div>

        {/* Payment Partners */}
        <div className="mt-10 pt-8 border-t border-border/50">
          <p className="text-center text-sm text-muted-foreground mb-4">Payment Partners</p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {/* Paystack Logo Placeholder */}
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border/50">
              <div className="w-8 h-8 bg-[#00C3F7]/20 rounded flex items-center justify-center">
                <span className="text-[#00C3F7] font-bold text-xs">PS</span>
              </div>
              <span className="text-sm font-medium">Paystack</span>
            </div>
            
            {/* Bank Transfer */}
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border/50">
              <div className="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm font-medium">Bank Transfer</span>
            </div>

            {/* USSD */}
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border/50">
              <div className="w-8 h-8 bg-purple-500/20 rounded flex items-center justify-center">
                <span className="text-purple-600 font-bold text-xs">*</span>
              </div>
              <span className="text-sm font-medium">USSD</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
