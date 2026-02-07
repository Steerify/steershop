import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, BadgeCheck, Star, Lock, CreditCard, ArrowRight, Users, Award } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageWrapper } from "@/components/PageWrapper";

const TrustFeature = () => {
  const trustFeatures = [
    {
      icon: BadgeCheck,
      title: "Verified Business Badge",
      description: "Earn verification status by maintaining high ratings and consistent sales. Stand out from the crowd."
    },
    {
      icon: Star,
      title: "Customer Reviews",
      description: "Collect and display authentic reviews from your customers. Build social proof that converts."
    },
    {
      icon: Lock,
      title: "Secure Payments",
      description: "All payments processed through Paystack—Nigeria's most trusted payment provider."
    },
    {
      icon: CreditCard,
      title: "Multiple Payment Options",
      description: "Accept cards, bank transfers, and USSD. Let customers pay however they prefer."
    }
  ];

  const verificationSteps = [
    {
      step: "1",
      title: "Complete Your Profile",
      description: "Add your business information, logo, and products"
    },
    {
      step: "2",
      title: "Get Customer Reviews",
      description: "Deliver great products and service to earn positive reviews"
    },
    {
      step: "3",
      title: "Maintain High Standards",
      description: "Keep your rating above 4.0 and process orders consistently"
    },
    {
      step: "4",
      title: "Earn Your Badge",
      description: "Automatic verification when you meet the criteria"
    }
  ];

  return (
    <PageWrapper patternVariant="geometric" patternOpacity={0.3}>
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="container mx-auto px-4 text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-600 rounded-full mb-6">
            <Shield className="w-4 h-4" />
            <span className="font-medium">Trust & Credibility</span>
          </div>
          
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            Build Trust,
            <span className="text-purple-600"> Win Customers</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            In online business, trust is everything. SteerSolo gives you the tools to build credibility and convert hesitant browsers into confident buyers.
          </p>
          
          <Link to="/auth/signup">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white min-h-[48px]">
              Build Your Credibility
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </section>

        {/* Trust Features */}
        <section className="container mx-auto px-4 mb-16">
          <div className="grid md:grid-cols-2 gap-6">
            {trustFeatures.map((feature) => (
              <Card key={feature.title} className="hover:shadow-lg transition-all">
                <CardContent className="p-6 flex gap-4">
                  <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <feature.icon className="w-7 h-7 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Verification Path */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-center mb-4">
              Path to Verified Status
            </h2>
            <p className="text-muted-foreground text-center mb-10">
              Earn the trusted seller badge and boost your conversion rates
            </p>
            
            <div className="space-y-6">
              {verificationSteps.map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                    {item.step}
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="container mx-auto px-4 mb-16">
          <Card className="bg-muted/50">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <Users className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold mb-1">5,000+</p>
                  <p className="text-muted-foreground">Trusted Sellers</p>
                </div>
                <div>
                  <Star className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
                  <p className="text-3xl font-bold mb-1">4.8★</p>
                  <p className="text-muted-foreground">Average Rating</p>
                </div>
                <div>
                  <Award className="w-10 h-10 text-green-500 mx-auto mb-3" />
                  <p className="text-3xl font-bold mb-1">98%</p>
                  <p className="text-muted-foreground">Customer Satisfaction</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
            <CardContent className="p-8 md:p-12 text-center">
              <BadgeCheck className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h2 className="font-display text-3xl font-bold mb-4">
                Start Building Trust Today
              </h2>
              <p className="text-lg opacity-90 mb-6 max-w-xl mx-auto">
                Create your professional store and start your journey to becoming a verified seller.
              </p>
              <Link to="/auth/signup">
                <Button size="lg" variant="secondary">
                  Create Your Store
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

export default TrustFeature;
