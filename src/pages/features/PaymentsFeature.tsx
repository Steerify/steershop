import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Shield, Zap, ArrowRight, Banknote, Smartphone, CheckCircle, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageWrapper } from "@/components/PageWrapper";

const PaymentsFeature = () => {
  const paymentMethods = [
    {
      icon: CreditCard,
      title: "Card Payments",
      description: "Accept Visa, Mastercard, and Verve cards. Instant confirmation, no delays."
    },
    {
      icon: Banknote,
      title: "Bank Transfer",
      description: "Customers can pay via direct bank transfer with automatic confirmation."
    },
    {
      icon: Smartphone,
      title: "USSD Payments",
      description: "Perfect for customers without smartphones. Simple dial-to-pay experience."
    },
    {
      icon: Shield,
      title: "Secure Checkout",
      description: "All transactions encrypted and protected by Paystack's security infrastructure."
    }
  ];

  const benefits = [
    "Instant payment notifications",
    "Automatic order confirmation",
    "Next-day settlement to your bank",
    "Transparent transaction fees",
    "Detailed payment reports",
    "Chargeback protection"
  ];

  return (
    <PageWrapper patternVariant="lines" patternOpacity={0.3}>
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="container mx-auto px-4 text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-600 rounded-full mb-6">
            <CreditCard className="w-4 h-4" />
            <span className="font-medium">Secure Payments</span>
          </div>
          
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            Get Paid
            <span className="text-blue-600"> Securely & Instantly</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Accept payments from anywhere in Nigeria. Powered by Paystack, trusted by millions of businesses across Africa.
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-8">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-8 opacity-60" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-8 opacity-60" />
            <div className="text-sm font-medium text-muted-foreground px-3 py-1 border rounded">Verve</div>
          </div>
          
          <Link to="/auth/signup">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white min-h-[48px]">
              Start Accepting Payments
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </section>

        {/* Payment Methods */}
        <section className="container mx-auto px-4 mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {paymentMethods.map((method) => (
              <Card key={method.title} className="text-center hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <method.icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{method.title}</h3>
                  <p className="text-muted-foreground text-sm">{method.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-center mb-10">
              Everything You Need to Accept Payments
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Note */}
        <section className="container mx-auto px-4 mb-16">
          <Card className="bg-muted/50 border-blue-200">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Lock className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold mb-2">Bank-Grade Security</h3>
                  <p className="text-muted-foreground">
                    Your payments are protected by Paystack's PCI-DSS Level 1 certified infrastructure—the same security standard used by major banks worldwide. We never store your customers' card details on our servers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardContent className="p-8 md:p-12 text-center">
              <Zap className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h2 className="font-display text-3xl font-bold mb-4">
                Ready to Accept Payments?
              </h2>
              <p className="text-lg opacity-90 mb-6 max-w-xl mx-auto">
                Set up your store in minutes and start receiving payments today. No technical knowledge required.
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

export default PaymentsFeature;
