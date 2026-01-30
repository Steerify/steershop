import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Eye, Key, Server, FileCheck, ArrowRight, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageWrapper } from "@/components/PageWrapper";

const SecurityPage = () => {
  const securityFeatures = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "All data transmitted between you and SteerSolo is encrypted using TLS 1.3 encryption."
    },
    {
      icon: Shield,
      title: "PCI-DSS Compliance",
      description: "Payment processing meets the highest industry security standards through Paystack."
    },
    {
      icon: Key,
      title: "Secure Authentication",
      description: "Multi-factor authentication options and secure session management protect your account."
    },
    {
      icon: Server,
      title: "Secure Infrastructure",
      description: "Our servers are hosted on enterprise-grade infrastructure with 24/7 monitoring."
    },
    {
      icon: Eye,
      title: "Privacy by Design",
      description: "We collect only essential data and never sell your information to third parties."
    },
    {
      icon: FileCheck,
      title: "Regular Audits",
      description: "Our systems undergo regular security audits to identify and fix vulnerabilities."
    }
  ];

  const dataProtection = [
    "Personal information encrypted at rest",
    "Payment details never stored on our servers",
    "Regular automated backups",
    "GDPR-compliant data handling",
    "Right to data deletion upon request",
    "Transparent data usage policies"
  ];

  return (
    <PageWrapper patternVariant="geometric" patternOpacity={0.2}>
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="container mx-auto px-4 text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-full mb-6">
            <Shield className="w-4 h-4" />
            <span className="font-medium">Security & Privacy</span>
          </div>
          
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Your Security is Our
            <span className="text-green-600"> Top Priority</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We use industry-leading security measures to protect your business data and your customers' information.
          </p>
        </section>

        {/* Security Features */}
        <section className="container mx-auto px-4 mb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((feature) => (
              <Card key={feature.title} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Data Protection */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-center mb-10">
              How We Protect Your Data
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {dataProtection.map((item) => (
                <div key={item} className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Paystack Partnership */}
        <section className="container mx-auto px-4 mb-16">
          <Card className="bg-muted/50">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Lock className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold mb-2">Powered by Paystack</h3>
                  <p className="text-muted-foreground">
                    All payments are processed by Paystack, Africa's leading payment infrastructure provider. Paystack is PCI-DSS Level 1 certified—the highest level of compliance in the payments industry. Your customers' card details are never stored on SteerSolo servers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Links */}
        <section className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="font-display text-3xl font-bold mb-4">
                Have Security Questions?
              </h2>
              <p className="text-lg opacity-90 mb-6 max-w-xl mx-auto">
                Read our full privacy policy or contact our security team for more information.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/privacy">
                  <Button size="lg" variant="secondary">
                    Privacy Policy
                  </Button>
                </Link>
                <Link to="/feedback">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Contact Security Team
                  </Button>
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

export default SecurityPage;
