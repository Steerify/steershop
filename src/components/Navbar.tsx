import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Menu, X } from "lucide-react";
import { AdireAccent } from "./patterns/AdirePattern";
import logo from "@/assets/steersolo-logo.jpg";

// Celebration configuration
interface Celebration {
  name: string;
  startDate: string;
  endDate: string;
  icon: string;
  type: 'christian' | 'muslim' | 'general' | 'cultural';
}

const CELEBRATIONS: Celebration[] = [
  // December celebrations
  {
    name: "Christmas",
    startDate: "12-20",
    endDate: "12-26",
    icon: "🎄",
    type: 'christian'
  },
  {
    name: "New Year",
    startDate: "12-30",
    endDate: "01-07",
    icon: "🎆",
    type: 'general'
  },
  {
    name: "Eid al-Fitr",
    startDate: "04-09",
    endDate: "04-11",
    icon: "🌙",
    type: 'muslim'
  },
  {
    name: "Eid al-Adha",
    startDate: "06-16",
    endDate: "06-18",
    icon: "🕌",
    type: 'muslim'
  },
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
  }
];

// Helper function to check if current date is within celebration period
const isCelebrationActive = (celebration: Celebration): boolean => {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  const [startMonth, startDay] = celebration.startDate.split('-').map(Number);
  const [endMonth, endDay] = celebration.endDate.split('-').map(Number);
  
  let startDate = new Date(currentYear, startMonth - 1, startDay);
  let endDate = new Date(currentYear, endMonth - 1, endDay);
  
  // Handle celebrations that span across years (like New Year)
  if (endMonth < startMonth) {
    endDate = new Date(currentYear + 1, endMonth - 1, endDay);
  }
  
  return today >= startDate && today <= endDate;
};

// Function to get active celebrations
const getActiveCelebrations = (): Celebration[] => {
  return CELEBRATIONS.filter(isCelebrationActive);
};

// Celebration icon component
const CelebrationIcon = ({ celebration }: { celebration: Celebration }) => {
  if (celebration.name.includes("Christmas")) {
    return (
      <div className="absolute -top-3 -right-3">
        <div className="text-2xl animate-bounce" style={{ animationDuration: '2s' }}>
          {celebration.icon}
        </div>
        {/* Christmas tinsel effect */}
        <div className="absolute -top-1 -right-1 w-4 h-4">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-red-500 to-green-500 animate-ping opacity-75"></div>
        </div>
      </div>
    );
  }
  
  if (celebration.name.includes("New Year")) {
    return (
      <div className="absolute -top-3 -right-3">
        <div className="text-2xl animate-pulse" style={{ animationDuration: '1.5s' }}>
          {celebration.icon}
        </div>
      </div>
    );
  }
  
  return (
    <div className="absolute -top-2 -right-2">
      <div className="text-lg bg-background/80 backdrop-blur-sm rounded-full p-1 shadow-lg animate-pulse">
        {celebration.icon}
      </div>
    </div>
  );
};

// Add padding to the top of the page to account for fixed navbar
const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCelebrations, setActiveCelebrations] = useState<Celebration[]>([]);
  const [showCelebrationHint, setShowCelebrationHint] = useState(false);

  useEffect(() => {
    // Add padding to body to prevent content from being hidden under navbar
    document.body.style.paddingTop = '80px'; // Adjust this value based on your navbar height
    
    // Check for active celebrations on component mount
    const celebrations = getActiveCelebrations();
    setActiveCelebrations(celebrations);
    
    // Show celebration hint if there are active celebrations
    if (celebrations.length > 0) {
      setShowCelebrationHint(true);
      const timer = setTimeout(() => {
        setShowCelebrationHint(false);
      }, 5000);
      return () => clearTimeout(timer);
    }

    // Cleanup function
    return () => {
      document.body.style.paddingTop = '0';
    };
  }, []);

  // Get the primary celebration (prioritize Christmas if active)
  const primaryCelebration = activeCelebrations.find(c => 
    c.name.includes("Christmas")
  ) || activeCelebrations[0];

  return (
    <>
      {/* Celebration hint banner - fixed at top */}
      {showCelebrationHint && primaryCelebration && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary/20 to-accent/20 border-b border-primary/30">
          <div className="container mx-auto px-4 py-1 text-center">
            <span className="text-sm font-medium flex items-center justify-center gap-2">
              <span className="animate-pulse">{primaryCelebration.icon}</span>
              <span>Celebrating {primaryCelebration.name}!</span>
              <span className="animate-pulse">{primaryCelebration.icon}</span>
            </span>
          </div>
        </div>
      )}
      
      {/* Main navbar - positioned below the celebration banner */}
      <nav className="fixed top-0 left-0 right-0 z-40" style={{ 
        top: showCelebrationHint && primaryCelebration ? '2rem' : '0' 
      }}>
        {/* Adire accent line */}
        <AdireAccent className="h-1" />
        
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
                <div className="flex flex-col">
                  <span className="text-2xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    SteerSolo
                  </span>
                  {activeCelebrations.length > 0 && (
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <span className="animate-pulse">{primaryCelebration?.icon}</span>
                      <span>{primaryCelebration?.name}</span>
                    </span>
                  )}
                </div>
              </Link>

              {/* Desktop Navigation - using proper flex layout */}
              <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
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

              {/* Desktop Auth Buttons - properly spaced */}
              <div className="hidden md:flex items-center gap-3 ml-4">
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
    </>
  );
};

export default Navbar;