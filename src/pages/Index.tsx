import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Store, Zap, Shield, TrendingUp, Users, ShoppingBag, Star, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import heroImage from "@/assets/hero-image.jpg";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";


const Index = () => {
  const [activeAudience, setActiveAudience] = useState<"customers" | "entrepreneurs">("customers");
  const [offers, setOffers] = useState<any[]>([]);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    const { data } = await supabase
      .from("special_offers")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    setOffers(data || []);
  };

  const customerOffer = offers.find(o => o.target_audience === "customers");
  const entrepreneurOffer = offers.find(o => o.target_audience === "entrepreneurs");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Audience Selector */}
      <section className="pt-28 pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">
              {activeAudience === "customers" ? "Discover Amazing" : "Build Your"}
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {activeAudience === "customers" ? "Local Businesses" : "Dream Business"}
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {activeAudience === "customers" 
                ? "Shop from trusted solo entrepreneurs in your community" 
                : "Turn your passion into profit with Africa's simplest store builder"}
            </p>
            
            <Tabs 
              value={activeAudience} 
              onValueChange={(value) => setActiveAudience(value as "customers" | "entrepreneurs")}
              className="w-full max-w-md mx-auto"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="customers" className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  I Want to Shop
                </TabsTrigger>
                <TabsTrigger value="entrepreneurs" className="flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  I Want to Sell
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Dynamic Content Based on Audience */}
      {activeAudience === "customers" ? (
        <CustomerExperience offer={customerOffer} />
      ) : (
        <EntrepreneurExperience offer={entrepreneurOffer} />
      )}

      {/* Unified CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            {activeAudience === "customers" 
              ? "Ready to Shop Local?" 
              : "Ready to Launch Your Store?"}
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            {activeAudience === "customers"
              ? "Support real entrepreneurs and discover unique products in your community"
              : "Join hundreds of Nigerian entrepreneurs already growing their business with SteerSolo"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {activeAudience === "customers" ? (
              <>
                <Link to="/shops">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                    Explore Shops
                    <ShoppingBag className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  onClick={() => setActiveAudience("entrepreneurs")}
                >
                  I Want to Sell Instead
                  <Store className="ml-2 w-5 h-5" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth/signup">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  onClick={() => setActiveAudience("customers")}
                >
                  I Want to Shop Instead
                  <ShoppingBag className="ml-2 w-5 h-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p className="mb-4">© 2025 SteerSolo. Empowering Nigerian Entrepreneurs.</p>
            <div className="flex justify-center gap-6 flex-wrap">
              <Link to="/about" className="hover:text-accent transition-colors">About</Link>
              <Link to="/contact" className="hover:text-accent transition-colors">Contact</Link>
              <Link to="/terms" className="hover:text-accent transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-accent transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Customer-Focused Experience
const CustomerExperience = ({ offer }: { offer?: any }) => {
  return (
    <>
      {/* Hero for Customers */}
      <section className="py-12 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full">
                <Star className="w-4 h-4 text-accent" />
                <span className="text-accent font-semibold text-sm">Shop Local · Support Real People</span>
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                Discover the Heart
                <br />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  of Nigerian
                </span>
                <br />
                Entrepreneurship
              </h2>
              
              {offer && (
                <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{offer.title}</h3>
                        <p className="opacity-90">
                          {offer.description}
                          {offer.code && <> Use code: <strong>{offer.code}</strong></>}
                        </p>
                        {offer.valid_until && (
                          <p className="text-sm opacity-80 mt-1">
                            Valid until {format(new Date(offer.valid_until), "MMM dd, yyyy")}
                          </p>
                        )}
                      </div>
                      <Button variant="secondary" asChild>
                        <Link to={offer.button_link}>
                          {offer.button_text}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <p className="text-xl text-muted-foreground max-w-xl">
                Shop directly from passionate Nigerian entrepreneurs. Every purchase supports 
                real people building their dreams from the ground up.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/shops">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-lg px-8">
                    Browse Shops
                    <ShoppingBag className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/auth/signup">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl" />
              <img 
                src={heroImage} 
                alt="Customers shopping from local Nigerian businesses"
                className="relative rounded-2xl shadow-2xl w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits for Customers */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Shop with SteerSolo?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience shopping that's personal, authentic, and meaningful
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-accent transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Shop Real People</CardTitle>
                <CardDescription>
                  Connect directly with the entrepreneurs behind every product. No big corporations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-accent transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Direct Communication</CardTitle>
                <CardDescription>
                  Chat with shop owners on WhatsApp. Ask questions, get recommendations, build relationships.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-accent transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Trusted & Verified</CardTitle>
                <CardDescription>
                  Every shop is verified. Read real reviews from real customers.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-accent transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Unique Finds</CardTitle>
                <CardDescription>
                  Discover products you won't find anywhere else. Support local creativity and innovation.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-accent transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Local Delivery</CardTitle>
                <CardDescription>
                  Fast, reliable delivery within Nigeria. Support your local economy.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-accent transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>AI Recommendations</CardTitle>
                <CardDescription>
                  Get personalized shop recommendations based on your interests and preferences.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
};

// Entrepreneur-Focused Experience
const EntrepreneurExperience = ({ offer }: { offer?: any }) => {
  return (
    <>
      {/* Hero for Entrepreneurs */}
      <section className="py-12 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full">
                <Store className="w-4 h-4 text-accent" />
                <span className="text-accent font-semibold text-sm">₦1,000/month · Start in Minutes</span>
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                Your Business,
                <br />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Your Brand,
                </span>
                <br />
                Your Freedom
              </h2>
              
              {offer && (
                <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{offer.title}</h3>
                        <p className="opacity-90">
                          {offer.description}
                          {offer.code && <> Use code: <strong>{offer.code}</strong></>}
                        </p>
                        {offer.valid_until && (
                          <p className="text-sm opacity-80 mt-1">
                            Valid until {format(new Date(offer.valid_until), "MMM dd, yyyy")}
                          </p>
                        )}
                      </div>
                      <Button variant="secondary" asChild>
                        <Link to={offer.button_link}>
                          {offer.button_text}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <p className="text-xl text-muted-foreground max-w-xl">
                SteerSolo empowers Nigerian solo entrepreneurs with a simple, professional, 
                and affordable online store. Look like a pro, even if it's just you.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth/signup">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-lg px-8">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/my-store">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    See Demo
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-accent">500+</div>
                  <div className="text-sm text-muted-foreground">Active Shops</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent">10k+</div>
                  <div className="text-sm text-muted-foreground">Products Sold</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent">98%</div>
                  <div className="text-sm text-muted-foreground">Satisfaction</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl" />
              <img 
                src={heroImage} 
                alt="Nigerian entrepreneurs building their business"
                className="relative rounded-2xl shadow-2xl w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features for Entrepreneurs */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Succeed Solo</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built specifically for Nigerian entrepreneurs with features that matter
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-2 hover:border-accent transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Store className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Professional Storefront</CardTitle>
                <CardDescription>
                  Get a unique, shareable store link that makes you look like a established brand
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-accent transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>5-Minute Setup</CardTitle>
                <CardDescription>
                  Launch your store in minutes, not days. WhatsApp-simple, e-commerce powerful
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-accent transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Nigerian Payments</CardTitle>
                <CardDescription>
                  Accept payments with Paystack or bank transfer. Built for local realities
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-accent transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>AI-Powered Growth</CardTitle>
                <CardDescription>
                  Get recommended to customers who'll love your products. Grow without marketing stress
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-xl text-muted-foreground">
                One affordable price, unlimited possibilities. No commissions, no hidden fees.
              </p>
            </div>
            
            <Card className="border-2 border-accent overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-accent p-1">
                <div className="bg-card p-8">
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-3xl mb-2">Solo Plan</CardTitle>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-bold">₦1,000</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <CardDescription className="text-lg">
                      Everything you need to run your business professionally
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {[
                        "Your own custom storefront",
                        "Unlimited products & orders",
                        "WhatsApp integration",
                        "Paystack & bank transfer",
                        "Order management dashboard",
                        "Customer reviews & ratings",
                        "AI shop recommendations",
                        "Mobile-friendly design",
                        "7-day free trial"
                      ].map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                            <div className="w-2 h-2 bg-card rounded-full" />
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="pt-6">
                      <Link to="/auth/signup" className="block">
                        <Button className="w-full bg-accent hover:bg-accent/90 text-lg py-6">
                          Start Your Free Trial
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;