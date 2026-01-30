import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, BarChart, Users, Target, Zap, ArrowRight, LineChart, PieChart, Activity } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageWrapper } from "@/components/PageWrapper";

const GrowthFeature = () => {
  const tools = [
    {
      icon: BarChart,
      title: "Sales Analytics",
      description: "Track daily, weekly, and monthly sales. Understand what's working and what needs improvement."
    },
    {
      icon: Users,
      title: "Customer Management",
      description: "Keep track of repeat customers. Build relationships that turn buyers into loyal fans."
    },
    {
      icon: Target,
      title: "AI Marketing Tools",
      description: "Get AI-powered suggestions to improve your product descriptions and attract more customers."
    },
    {
      icon: Activity,
      title: "Order Tracking",
      description: "Monitor order status from pending to delivered. Keep customers informed at every step."
    },
    {
      icon: LineChart,
      title: "Revenue Reports",
      description: "See exactly how much you're making. Export reports for your records or accountant."
    },
    {
      icon: PieChart,
      title: "Product Performance",
      description: "Know which products sell best. Make data-driven decisions about your inventory."
    }
  ];

  return (
    <PageWrapper patternVariant="circles" patternOpacity={0.3}>
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="container mx-auto px-4 text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full mb-6">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">Business Growth</span>
          </div>
          
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Tools to
            <span className="text-primary"> Grow Your Business</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            From your first sale to scaling to thousands of customers—SteerSolo gives you everything you need to understand and grow your business.
          </p>
          
          <Link to="/auth/signup">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Start Growing Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </section>

        {/* Tools Grid */}
        <section className="container mx-auto px-4 mb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Card key={tool.title} className="hover:shadow-lg transition-all hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <tool.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{tool.title}</h3>
                  <p className="text-muted-foreground">{tool.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 mb-16">
          <Card className="bg-muted/50">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <p className="text-4xl font-bold text-primary mb-2">300%</p>
                  <p className="text-muted-foreground">Average sales increase after 3 months</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-primary mb-2">4.9★</p>
                  <p className="text-muted-foreground">Average store rating</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-primary mb-2">₦2.8B+</p>
                  <p className="text-muted-foreground">Total sales processed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-primary to-accent text-white">
            <CardContent className="p-8 md:p-12 text-center">
              <Zap className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h2 className="font-display text-3xl font-bold mb-4">
                Ready to Scale Your Business?
              </h2>
              <p className="text-lg opacity-90 mb-6 max-w-xl mx-auto">
                Get access to all growth tools with a 15-day free trial. No credit card required.
              </p>
              <Link to="/auth/signup">
                <Button size="lg" variant="secondary">
                  Start Free Trial
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

export default GrowthFeature;
