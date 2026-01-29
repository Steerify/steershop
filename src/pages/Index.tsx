import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  Store,
  ShoppingBag,
  CheckCircle,
  Shield,
  Zap,
  Users,
  TrendingUp,
  Award,
  Sparkles,
  ChevronRight,
  Star,
  Building,
  Target,
  BarChart,
  MessageSquare,
  Globe,
  Lock,
  Clock,
  Heart,
  Search,
  Play,
  X,
  Menu,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TrustBadgesSection } from "@/components/TrustBadgesSection";

const Index = () => {
  const [activeAudience, setActiveAudience] = useState<"sellers" | "buyers">("sellers");

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Storefront</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/features" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Features</Link>
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Pricing</Link>
              <Link to="/case-studies" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Success Stories</Link>
              <Link to="/help" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Help</Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/auth/login">
                <Button variant="ghost" className="text-sm">Sign in</Button>
              </Link>
              <Link to="/auth/signup">
                <Button className="bg-blue-600 hover:bg-blue-700 text-sm px-6">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Google-style minimalism */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              Trusted by 5,000+ Nigerian businesses
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
              {activeAudience === "sellers" ? (
                <>
                  Sell online.
                  <span className="block text-blue-600 mt-2">Just WhatsApp.</span>
                </>
              ) : (
                <>
                  Shop unique products.
                  <span className="block text-blue-600 mt-2">Direct from makers.</span>
                </>
              )}
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              {activeAudience === "sellers" 
                ? "Create a professional store in minutes. Share one link. Receive orders directly to your WhatsApp. No tech skills needed."
                : "Discover authentic products from Nigerian entrepreneurs. Chat directly with sellers. Enjoy personalized service and secure payments."}
            </p>

            {/* Simplified Audience Toggle */}
            <div className="flex justify-center mb-10">
              <div className="inline-flex p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setActiveAudience("sellers")}
                  className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                    activeAudience === "sellers" 
                      ? "bg-white shadow-sm text-gray-900" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Store className="w-4 h-4 inline mr-2" />
                  For Sellers
                </button>
                <button
                  onClick={() => setActiveAudience("buyers")}
                  className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                    activeAudience === "buyers" 
                      ? "bg-white shadow-sm text-gray-900" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 inline mr-2" />
                  For Shoppers
                </button>
              </div>
            </div>

            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link to={activeAudience === "sellers" ? "/auth/signup" : "/shops"}>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-shadow">
                  {activeAudience === "sellers" ? "Start Free Trial" : "Browse Stores"}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="border-gray-300 px-8 py-6 text-lg">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-blue-500 mr-2" />
                Set up in 5 minutes
              </div>
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-purple-500 mr-2" />
                Secure payments
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Logos */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          <p className="text-center text-gray-500 text-sm font-medium mb-8">TRUSTED BY BUSINESSES ACROSS NIGERIA</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center">
            {["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano"].map((city) => (
              <div key={city} className="text-gray-700 font-semibold">{city}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {activeAudience === "sellers" 
                ? "Everything you need to sell online" 
                : "Why shop with independent sellers"}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {activeAudience === "sellers"
                ? "From first sale to scaling your business"
                : "Get more than just products—get stories and service"}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {activeAudience === "sellers" ? (
              <>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                      <MessageSquare className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">WhatsApp Order Management</h3>
                    <p className="text-gray-600 mb-4">Receive and manage orders directly in WhatsApp. No apps to download for customers.</p>
                    <Link to="/features/whatsapp" className="text-blue-600 text-sm font-medium flex items-center">
                      Learn more <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Business Growth Tools</h3>
                    <p className="text-gray-600 mb-4">Analytics, customer management, and marketing tools to help you grow.</p>
                    <Link to="/features/growth" className="text-blue-600 text-sm font-medium flex items-center">
                      Learn more <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                      <Shield className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Trust & Credibility</h3>
                    <p className="text-gray-600 mb-4">Professional storefront builds customer confidence and reduces payment disputes.</p>
                    <Link to="/features/trust" className="text-blue-600 text-sm font-medium flex items-center">
                      Learn more <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                      <Heart className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Unique Products</h3>
                    <p className="text-gray-600 mb-4">Discover items you won't find in regular stores, each with a story.</p>
                    <Link to="/shops" className="text-blue-600 text-sm font-medium flex items-center">
                      Browse shops <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                      <MessageSquare className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Direct Communication</h3>
                    <p className="text-gray-600 mb-4">Chat directly with sellers via WhatsApp for personalized service.</p>
                    <Link to="/how-it-works" className="text-blue-600 text-sm font-medium flex items-center">
                      How it works <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                      <Lock className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Secure Payments</h3>
                    <p className="text-gray-600 mb-4">Pay via Paystack or direct transfer with purchase protection.</p>
                    <Link to="/security" className="text-blue-600 text-sm font-medium flex items-center">
                      Security details <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Join 5,000+ businesses growing with Storefront
              </h2>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center mb-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="ml-2 text-gray-900 font-semibold">4.9/5</span>
                  </div>
                  <p className="text-gray-600">Average seller rating</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">₦2.8B+</div>
                  <p className="text-gray-600">Total sales processed</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">98%</div>
                  <p className="text-gray-600">Customer satisfaction rate</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-start mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-900 font-semibold mb-1">Chidinma's Boutique</p>
                  <p className="text-gray-600 text-sm">Fashion & Apparel, Lagos</p>
                </div>
              </div>
              <p className="text-gray-700 italic mb-6">
                "Storefront helped us move from chaotic WhatsApp orders to a proper business. 
                Sales increased by 300% in 3 months."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                  <img src="https://i.pravatar.cc/40?img=1" alt="Customer" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Chidinma Okoro</p>
                  <p className="text-xs text-gray-500">Business Owner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing/CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {activeAudience === "sellers" ? "Simple, transparent pricing" : "Free to browse"}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {activeAudience === "sellers"
                ? "Start free. Grow with our business tools."
                : "No fees. No sign-up required. Just browse and connect."}
            </p>
          </div>

          {activeAudience === "sellers" ? (
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-2 border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">Starter</CardTitle>
                  <CardDescription>Perfect for getting started</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">₦0</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {["1 storefront", "50 products", "Basic WhatsApp orders", "Email support"].map((feature) => (
                      <li key={feature} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full">Start Free</Button>
                </CardContent>
              </Card>
              <Card className="border-2 border-blue-500 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">Business</CardTitle>
                  <CardDescription>For growing businesses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">₦1,000</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {["Unlimited products", "Advanced analytics", "Paystack integration", "Priority support", "Custom domain", "Customer management"].map((feature) => (
                      <li key={feature} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-blue-500 mr-3" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Start 7-Day Free Trial</Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <ShoppingBag className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Ready to discover?</h3>
                  <p className="text-gray-600 mb-8">
                    Browse unique products from Nigerian entrepreneurs. No account needed to start.
                  </p>
                  <Link to="/shops">
                    <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                      <Search className="w-5 h-5 mr-2" />
                      Explore Stores
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to {activeAudience === "sellers" ? "grow your business?" : "shop differently?"}
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            {activeAudience === "sellers"
              ? "Join thousands of Nigerian entrepreneurs selling smarter."
              : "Connect directly with makers and discover unique products."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={activeAudience === "sellers" ? "/auth/signup" : "/shops"}>
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-10 py-6 text-lg">
                {activeAudience === "sellers" ? "Get Started Free" : "Start Shopping"}
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10 px-10 py-6 text-lg"
              onClick={() => setActiveAudience(activeAudience === "sellers" ? "buyers" : "sellers")}
            >
              View {activeAudience === "sellers" ? "Shopper" : "Seller"} Experience
            </Button>
          </div>
          <p className="text-gray-400 text-sm mt-8">
            {activeAudience === "sellers" 
              ? "7-day free trial • Cancel anytime • No setup fees"
              : "No account required • Secure payments • Direct seller support"}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;