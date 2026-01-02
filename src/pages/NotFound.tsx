import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import Navbar from "@/components/Navbar";
import { Home, Store, MessageCircle, Compass, MapPin, Sparkles } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
      <AdirePattern variant="geometric" className="fixed inset-0 opacity-10 pointer-events-none" />
      
      {/* Animated floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 animate-float">
          <Compass className="w-8 h-8 sm:w-12 sm:h-12 text-primary/20" />
        </div>
        <div className="absolute top-40 right-20 animate-float stagger-2">
          <MapPin className="w-6 h-6 sm:w-10 sm:h-10 text-accent/20" />
        </div>
        <div className="absolute bottom-40 left-1/4 animate-float stagger-3">
          <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-gold/30" />
        </div>
        <div className="absolute bottom-20 right-1/4 animate-float stagger-1">
          <Home className="w-6 h-6 sm:w-8 sm:h-8 text-primary/15" />
        </div>
      </div>

      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16 relative z-10">
        <div className="text-center max-w-2xl mx-auto animate-fade-up">
          {/* Large 404 Number */}
          <div className="relative mb-6 sm:mb-8">
            <h1 className="text-[120px] sm:text-[180px] lg:text-[220px] font-heading font-bold leading-none bg-gradient-to-r from-primary via-accent to-gold bg-clip-text text-transparent opacity-90 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full animate-pulse-soft" />
            </div>
          </div>

          {/* Nigerian-inspired messaging */}
          <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-foreground">
              Wahala! Page Not Found
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto px-4">
              Omo, this road no dey go anywhere. The page you're looking for has either moved or doesn't exist.
            </p>
          </div>

          {/* African Proverb */}
          <div className="mb-8 sm:mb-10 px-4">
            <blockquote className="italic text-sm sm:text-base text-muted-foreground border-l-4 border-accent pl-4 py-2 bg-accent/5 rounded-r-lg inline-block text-left">
              "No matter how far you have gone on a wrong road, turn back."
              <footer className="text-xs sm:text-sm text-primary mt-1 not-italic font-medium">
                — African Proverb
              </footer>
            </blockquote>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
            <Button 
              asChild 
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground min-h-[48px] text-base font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <Link to="/">
                <Home className="w-5 h-5 mr-2" />
                Go Home
              </Link>
            </Button>

            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="w-full sm:w-auto border-primary/30 hover:bg-primary/10 hover:text-primary min-h-[48px] text-base font-medium"
            >
              <Link to="/shops">
                <Store className="w-5 h-5 mr-2" />
                Browse Shops
              </Link>
            </Button>

            <Button 
              asChild 
              variant="ghost" 
              size="lg"
              className="w-full sm:w-auto hover:bg-accent/10 hover:text-accent min-h-[48px] text-base font-medium"
            >
              <Link to="/feedback">
                <MessageCircle className="w-5 h-5 mr-2" />
                Get Help
              </Link>
            </Button>
          </div>

          {/* Attempted path display */}
          <div className="mt-8 sm:mt-10 px-4">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Looking for: 
              <code className="ml-2 px-2 py-1 bg-muted rounded text-foreground font-mono text-xs break-all">
                {location.pathname}
              </code>
            </p>
          </div>
        </div>
      </main>

      {/* Footer accent */}
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-gold" />
    </div>
  );
};

export default NotFound;
