import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Menu, X, Sparkles } from "lucide-react";
import { AdireAccent } from "./patterns/AdirePattern";
import logo from "@/assets/steersolo-logo.jpg";

// Simple celebration configuration
interface Celebration {
  name: string;
  icon: string;
  color: string;
  startDate: string;
  endDate: string;
}

const CELEBRATIONS: Celebration[] = [
  {
    name: "Christmas",
    icon: "🎄",
    color: "bg-red-500",
    startDate: "12-20",
    endDate: "12-26"
  },
  {
    name: "New Year",
    icon: "🎆",
    color: "bg-purple-500",
    startDate: "12-30",
    endDate: "01-07"
  },
  {
    name: "Eid",
    icon: "🌟",
    color: "bg-emerald-500",
    startDate: "04-09",
    endDate: "04-11"
  }
];

// Check if celebration is active
const isCelebrationActive = (celebration: Celebration): boolean => {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  const [startMonth, startDay] = celebration.startDate.split('-').map(Number);
  const [endMonth, endDay] = celebration.endDate.split('-').map(Number);
  
  let startDate = new Date(currentYear, startMonth - 1, startDay);
  let endDate = new Date(currentYear, endMonth - 1, endDay);
  
  // Handle New Year spanning across years
  if (endMonth < startMonth) {
    endDate = new Date(currentYear + 1, endMonth - 1, endDay);
  }
  
  return today >= startDate && today <= endDate;
};

const getActiveCelebration = (): Celebration | null => {
  return CELEBRATIONS.find(isCelebrationActive) || null;
};

// Simple celebration badge
const CelebrationBadge = ({ celebration }: { celebration: Celebration }) => {
  return (
    <div className="absolute -top-2 -right-2 animate-bounce">
      <div className={`${celebration.color} text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1`}>
        <span>{celebration.icon}</span>
        <span className="text-[10px]">{celebration.name}</span>
      </div>
    </div>
  );
};

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCelebration, setActiveCelebration] = useState<Celebration | null>(null);

  useEffect(() => {
    const celebration = getActiveCelebration();
    setActiveCelebration(celebration);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Simple celebration banner */}
      {activeCelebration && (
        <div className={`${activeCelebration.color} text-white text-center py-1 px-4`}>
          <div className="flex items-center justify-center gap-2 text-sm font-medium animate-pulse">
            <Sparkles className="w-3 h-3" />
            <span>Celebrating {activeCelebration.name}!</span>
            <Sparkles className="w-3 h-3" />
          </div>
        </div>
      )}
      
      <AdireAccent className="h-1" />
      
      <div className="bg-card/95 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo with celebration badge */}
            <Link to="/" className="flex items-center gap-3 relative">
              <div className="w-10 h-10 rounded-lg overflow-hidden shadow-lg ring-2 ring-primary/20 relative">
                <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
                {activeCelebration && <CelebrationBadge celebration={activeCelebration} />}
              </div>
              <span className="text-2xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SteerSolo
                {activeCelebration && (
                  <span className="ml-2 text-lg animate-pulse inline-block">
                    {activeCelebration.icon}
                  </span>
                )}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link 
                to="/shops" 
                className="text-foreground/80 hover:text-primary transition-colors font-medium"
              >
                Explore Shops
              </Link>
              <Link 
                to="/about" 
                className="text-foreground/80 hover:text-primary transition-colors font-medium"
              >
                About
              </Link>
              <Link 
                to="/feedback" 
                className="text-foreground/80 hover:text-primary transition-colors font-medium"
              >
                Feedback
              </Link>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/auth/login">
                <Button variant="ghost" size="sm" className="font-medium">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
              <Link to="/auth/login?tab=signup">
                <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 font-medium">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Simple */}
      <div 
        className={`md:hidden bg-card border-b border-border overflow-hidden transition-all duration-300 ${
          isMobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="container mx-auto px-4 py-4 space-y-3">
          {/* Celebration indicator in mobile menu */}
          {activeCelebration && (
            <div className="mb-3 p-2 bg-primary/10 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-lg">{activeCelebration.icon}</span>
                <span className="font-medium">Celebrating {activeCelebration.name}</span>
              </div>
            </div>
          )}
          
          <Link 
            to="/shops" 
            className="block py-2 text-foreground/80 hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Explore Shops
          </Link>
          <Link 
            to="/about" 
            className="block py-2 text-foreground/80 hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About
          </Link>
          <Link 
            to="/feedback" 
            className="block py-2 text-foreground/80 hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Feedback
          </Link>
          
          <div className="pt-3 border-t border-border space-y-2">
            <Link to="/auth/login" className="block" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full">
                <User className="w-4 h-4 mr-2" />
                Login
              </Button>
            </Link>
            <Link to="/auth/login?tab=signup" className="block" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full bg-gradient-to-r from-primary to-accent">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;