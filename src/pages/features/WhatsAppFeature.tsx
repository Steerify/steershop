import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, CheckCircle, ArrowRight, Smartphone, Bell, Clock, Users, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageWrapper } from "@/components/PageWrapper";

const WhatsAppFeature = () => {
  const benefits = [
    {
      icon: Smartphone,
      title: "No App Downloads",
      description: "Your customers don't need to download any app. They order through your store and communicate via WhatsApp."
    },
    {
      icon: Bell,
      title: "Instant Notifications",
      description: "Get instant order alerts on WhatsApp. Never miss a sale, even when you're on the go."
    },
    {
      icon: Clock,
      title: "Quick Response",
      description: "Respond to customer queries instantly through familiar WhatsApp interface."
    },
    {
      icon: Users,
      title: "Personal Touch",
      description: "Build relationships with customers through direct, personal communication."
    }
  ];

  const steps = [
    "Customer browses your store and adds items to cart",
    "They checkout and choose to contact via WhatsApp",
    "You receive order details directly in WhatsApp",
    "Confirm, deliver, and build lasting relationships"
  ];

  return (
    <PageWrapper patternVariant="dots" patternOpacity={0.3}>
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="container mx-auto px-4 text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-full mb-6">
            <MessageCircle className="w-4 h-4" />
            <span className="font-medium">WhatsApp Integration</span>
          </div>
          
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Manage Orders on
            <span className="text-green-500"> WhatsApp</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Turn your WhatsApp into a powerful order management tool. Receive orders, chat with customers, and grow your business—all from your phone.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/signup">
              <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline">
                See Demo Store
              </Button>
            </Link>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="container mx-auto px-4 mb-16">
          <h2 className="font-display text-3xl font-bold text-center mb-10">
            Why Nigerian Sellers Love This
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-7 h-7 text-green-500" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-center mb-10">
              How It Works
            </h2>
            
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="text-lg">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-8 md:p-12 text-center">
              <Zap className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h2 className="font-display text-3xl font-bold mb-4">
                Ready to Simplify Your Orders?
              </h2>
              <p className="text-lg opacity-90 mb-6 max-w-xl mx-auto">
                Join thousands of Nigerian entrepreneurs who've transformed their WhatsApp into a sales machine.
              </p>
              <Link to="/auth/signup">
                <Button size="lg" variant="secondary">
                  Start Your Free 15-Day Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </PageWrapper>
  );
};

export default WhatsAppFeature;
