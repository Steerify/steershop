import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Menu, X } from "lucide-react";
import { AdireAccent } from "./patterns/AdirePattern";
import logo from "@/assets/steersolo-logo.jpg";

// Celebration configuration
interface Celebration {
  name: string;
  startDate: string; // Format: "MM-DD"
  endDate: string;   // Format: "MM-DD"
  icon: string;      // Emoji or custom component
  years?: number[];  // Specific years if applicable
  type: 'christian' | 'muslim' | 'general' | 'cultural';
}

const CELEBRATIONS: Celebration[] = [
  // December celebrations
  {
    name: "Christmas & New Year",
    startDate: "12-01",
    endDate: "01-07", // First week of January
    icon: "🎅", // Santa hat
    type: 'christian'
  },
  {
    name: "Eid al-Fitr",
    startDate: "04-09", // Approximate - will need to calculate Hijri dates
    endDate: "04-11",
    icon: "🌙",
    type: 'muslim'
  },
  {
    name: "Eid al-Adha",
    startDate: "06-16", // Approximate - will need to calculate Hijri dates
    endDate: "06-18",
    icon: "🕌",
    type: 'muslim'
  },
  {
    name: "Ramadan",
    startDate: "03-01", // Approximate - month of Ramadan
    endDate: "04-01",
    icon: "⭐",
    type: 'muslim'
  },
  // General celebrations
  {
    name: "Valentine's Day",
    startDate: "02-14",
    endDate: "02-14",
    icon: "❤️",
    type: 'general'
  },
  {
    name: "Independence Day",
    startDate: "10-01",
    endDate: "10-01",
    icon: "🇳🇬",
    type: 'cultural'
  },
  {
    name: "Halloween",
    startDate: "10-31",
    endDate: "10-31",
    icon: "🎃",
    type: 'general'
  },
  {
    name: "Easter",
    startDate: "04-07", // Approximate date for 2024
    endDate: "04-07",
    icon: "🐣",
    type: 'christian'
  }
];

// Helper function to check if current date is within celebration period
const isCelebrationActive = (celebration: Celebration): boolean => {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  // Parse start date
  const [startMonth, startDay] = celebration.startDate.split('-').map(Number);
  const startDate = new Date(currentYear, startMonth - 1, startDay);
  
  // Parse end date
  const [endMonth, endDay] = celebration.endDate.split('-').map(Number);
  let endDate = new Date(currentYear, endMonth - 1, endDay);
  
  // Handle celebrations that span across years (like Christmas to January)
  if (endMonth < startMonth) {
    endDate = new Date(currentYear + 1, endMonth - 1, endDay);
  }
  
  return today >= startDate && today <= endDate;
};

// Function to get active celebrations
const getActiveCelebrations = (): Celebration[] => {
  const currentDate = new Date();
  const month = currentDate.getMonth() + 1; // 1-12
  const day = currentDate.getDate();
  
  // Special handling for Hijri dates (Muslim celebrations)
  const hijriDate = getHijriDate(currentDate);
  
  return CELEBRATIONS.filter(celebration => {
    // Check if it's a Muslim celebration and calculate based on Hijri calendar
    if (celebration.type === 'muslim') {
      // For simplicity, using approximate Gregorian dates
      // In production, use a proper Hijri calendar library
      return isCelebrationActive(celebration);
    }
    
    return isCelebrationActive(celebration);
  });
};

// Simple Hijri date approximation (for demo purposes)
// In production, use a library like 'hijri-converter'
const getHijriDate = (date: Date): { year: number; month: number; day: number } => {
  // This is a simplified approximation
  const gregorianYear = date.getFullYear();
  const hijriYear = Math.floor((gregorianYear - 622) * (33/32));
  
  return {
    year: hijriYear,
    month: date.getMonth() + 1,
    day: date.getDate()
  };
};

// Celebration icon component
const CelebrationIcon = ({ celebration }: { celebration: Celebration }) => {
  if (celebration.name.includes("Christmas")) {
    return (
      <div className="absolute -top-3 -right-3 transform rotate-12">
        <div className="text-2xl animate-bounce" style={{ animationDuration: '2s' }}>
          {celebration.icon}
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75"></div>
      </div>
    );
  }
  
  return (
    <div className="absolute -top-2 -right-2">
      <div className="text-lg bg-background/80 backdrop-blur-sm rounded-full p-1 shadow-lg">
        {celebration.icon}
      </div>
    </div>
  );
};

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCelebrations, setActiveCelebrations] = useState<Celebration[]>([]);
  const [showCelebrationHint, setShowCelebrationHint] = useState(false);

  useEffect(() => {
    // Check for active celebrations on component mount
    const celebrations = getActiveCelebrations();
    setActiveCelebrations(celebrations);
    
    // Show celebration hint if there are active celebrations
    if (celebrations.length > 0) {
      setShowCelebrationHint(true);
      // Hide hint after 5 seconds
      const timer = setTimeout(() => {
        setShowCelebrationHint(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Get the primary celebration (prioritize Christmas/New Year if active)
  const primaryCelebration = activeCelebrations.find(c => 
    c.name.includes("Christmas") || c.name.includes("New Year")
  ) || activeCelebrations[0];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Celebration hint banner */}
      {showCelebrationHint && primaryCelebration && (
        <div className="bg-gradient-to-r from-primary/20 to-accent/20 border-b border-primary/30">
          <div className="container mx-auto px-4 py-1 text-center">
            <span className="text-sm font-medium flex items-center justify-center gap-2">
              <span className="animate-pulse">{primaryCelebration.icon}</span>
              <span>Celebrating {primaryCelebration.name}!</span>
              <span className="animate-pulse">{primaryCelebration.icon}</span>
            </span>
          </div>
        </div>
      )}
      
      {/* Adire accent line */}
      <AdireAccent className="h-1" />
      
      {/* Main navbar */}
      <div className="bg-card/90 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo with celebration decoration */}
            <Link to="/" className="flex items-center gap-3 group relative">
              <div className="w-11 h-11 rounded-xl overflow-hidden shadow-lg ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300 group-hover:scale-105 relative">
                <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
                
                {/* Celebration decorations */}
                {primaryCelebration && (
                  <CelebrationIcon celebration={primaryCelebration} />
                )}
                
                {/* Multiple celebration indicators */}
                {activeCelebrations.length > 1 && (
                  <div className="absolute -bottom-1 -left-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    +{activeCelebrations.length - 1}
                  </div>
                )}
              </div>
              <span className="text-2xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SteerSolo
                {activeCelebrations.length > 0 && (
                  <span className="ml-2 text-lg animate-pulse inline-block">
                    {primaryCelebration?.icon}
                  </span>
                )}
              </span>
              
              {/* Celebration tooltip */}
              {activeCelebrations.length > 0 && (
                <div className="absolute -bottom-8 left-0 bg-background border border-border rounded-lg p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  <div className="text-xs font-medium">
                    {activeCelebrations.map(c => c.name).join(', ')}
                  </div>
                </div>
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link 
                to="/shops" 
                className="text-foreground/80 hover:text-primary transition-colors font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
              >
                Explore Shops
              </Link>
              <Link 
                to="/about" 
                className="text-foreground/80 hover:text-primary transition-colors font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
              >
                About
              </Link>
              <Link 
                to="/feedback" 
                className="text-foreground/80 hover:text-primary transition-colors font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
              >
                Feedback
              </Link>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/auth/login">
                <Button variant="ghost" size="sm" className="font-medium hover:bg-primary/10 hover:text-primary">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
              <Link to="/auth/login?tab=signup">
                <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity font-medium shadow-lg shadow-primary/20">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors relative"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {activeCelebrations.length > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping"></div>
              )}
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden bg-card/95 backdrop-blur-xl border-b border-border overflow-hidden transition-all duration-300 ${
          isMobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="container mx-auto px-4 py-4 space-y-4">
          {/* Active celebrations in mobile menu */}
          {activeCelebrations.length > 0 && (
            <div className="mb-4 p-3 bg-primary/10 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="text-lg">{primaryCelebration?.icon}</span>
                <span>Celebrating {activeCelebrations.map(c => c.name).join(', ')}</span>
              </div>
            </div>
          )}
          
          <Link 
            to="/shops" 
            className="block py-3 px-4 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Explore Shops
          </Link>
          <Link 
            to="/about" 
            className="block py-3 px-4 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About
          </Link>
          <Link 
            to="/feedback" 
            className="block py-3 px-4 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Feedback
          </Link>
          
          <div className="pt-4 border-t border-border space-y-3">
            <Link to="/auth/login" className="block" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full border-primary/30 hover:bg-primary/10">
                <User className="w-4 h-4 mr-2" />
                Login
              </Button>
            </Link>
            <Link to="/auth/login?tab=signup" className="block" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
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