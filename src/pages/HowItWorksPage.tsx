import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Palette, Rocket, ShoppingCart, MessageCircle, CreditCard, ArrowRight, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageWrapper } from "@/components/PageWrapper";

const HowItWorksPage = () => {
  const sellerSteps = [
    {
      step: 1,
      icon: UserPlus,
      title: "Create Your Account",
      description: "Sign up in 60 seconds with your email. No credit card required.",
      time: "1 minute"
    },
    {
      step: 2,
      icon: Palette,
      title: "Set Up Your Store",
      description: "Add your shop name, logo, and description. Make it yours.",
      time: "5 minutes"
    },
    {
      step: 3,
      icon: ShoppingCart,
      title: "Add Your Products",
      description: "Upload photos, set prices, and describe what you're selling.",
      time: "10 minutes"
    },
    {
      step: 4,
      icon: Rocket,
      title: "Share & Start Selling",
      description: "Share your store link on WhatsApp, Instagram, and social media.",
      time: "Ongoing"
    }
  ];

  const buyerSteps = [
    {
      step: 1,
      icon: ShoppingCart,
      title: "Browse Products",
      description: "Explore products from verified Nigerian sellers."
    },
    {
      step: 2,
      icon: MessageCircle,
      title: "Chat with Seller",
      description: "Ask questions directly via WhatsApp before buying."
    },
    {
      step: 3,
      icon: CreditCard,
      title: "Pay Securely",
      description: "Pay with card, bank transfer, or USSD. All payments secured by Paystack."
    },
    {
      step: 4,
      icon: CheckCircle,
      title: "Receive Your Order",
      description: "Seller arranges delivery. You enjoy your purchase."
    }
  ];

  return (
    <PageWrapper patternVariant="dots" patternOpacity={0.3}>
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="container mx-auto px-4 text-center mb-16">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            How SteerSolo Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Whether you're here to sell or shop, we've made it simple for everyone.
          </p>
        </section>

        {/* For Sellers */}
        <section className="container mx-auto px-4 mb-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full mb-4">
              <Rocket className="w-4 h-4" />
              <span className="font-medium">For Sellers</span>
            </div>
            <h2 className="font-display text-3xl font-bold">
              From Zero to Selling in Minutes
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {sellerSteps.map((item) => (
              <Card key={item.step} className="relative hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 mt-2">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{item.description}</p>
                  <span className="text-xs text-primary font-medium">{item.time}</span>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link to="/auth/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90 min-h-[48px]">
                Start Selling Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* For Buyers */}
        <section className="container mx-auto px-4 mb-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full mb-4">
              <ShoppingCart className="w-4 h-4" />
              <span className="font-medium">For Shoppers</span>
            </div>
            <h2 className="font-display text-3xl font-bold">
              Shop with Confidence
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {buyerSteps.map((item) => (
              <Card key={item.step} className="relative hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                  <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-4 mt-2">
                    <item.icon className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link to="/shops">
              <Button size="lg" variant="outline">
                Browse Stores
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* FAQ Preview */}
        <section className="container mx-auto px-4">
          <Card className="bg-muted/50">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="font-display text-2xl font-bold mb-4">
                Still Have Questions?
              </h2>
              <p className="text-muted-foreground mb-6">
                Check out our FAQ or contact our support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/faq">
                  <Button variant="outline">View FAQ</Button>
                </Link>
                <Link to="/feedback">
                  <Button variant="outline">Contact Support</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </PageWrapper>
  );
};

export default HowItWorksPage;
