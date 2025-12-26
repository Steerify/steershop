import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  User, Menu, X, Gift, Moon, Star, 
  Heart, Flag, Ghost, Egg, Sparkles 
} from "lucide-react";
import { AdireAccent } from "./patterns/AdirePattern";
import logo from "@/assets/steersolo-logo.jpg";

// --- Types ---
interface Celebration {
  name: string;
  startDate: string; // MM-DD
  endDate: string;   // MM-DD
  type: 'christian' | 'muslim' | 'general' | 'cultural';
}

// --- Configuration ---
const CELEBRATIONS: Celebration[] = [
  { name: "Christmas", startDate: "12-20", endDate: "12-27", type: 'christian' },
  { name: "New Year", startDate: "12-31", endDate: "01-02", type: 'general' },
  { name: "Eid al-Fitr", startDate: "04-09", endDate: "04-11", type: 'muslim' },
  { name: "Valentine's Day", startDate: "02-14", endDate: "02-14", type: 'general' },
  { name: "Independence Day", startDate: "10-01", endDate: "10-01", type: 'cultural' },
  { name: "Halloween", startDate: "10-31", endDate: "10-31", type: 'general' },
  { name: "Easter", startDate: "04-07", endDate: "04-07", type: 'christian' }
];

// --- Static Decorations ---

const SantaHat = () => (
  <div className="absolute -top-[18px] -left-[14px] w-14 h-12 -rotate-[12deg] pointer-events-none z-30 drop-shadow-sm">
    <div className="absolute bottom-3 left-3 w-10 h-7 bg-red-600 rounded-t-[80%] rounded-b-sm" />
    <div className="absolute bottom-2 left-2 w-12 h-3.5 bg-white rounded-full shadow-sm" />
    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full border border-slate-100" />
  </div>
);

const FireworkFlare = () => (
  <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-xl">
    <div className="absolute top-1 right-1 text-yellow-400 opacity-80"><Sparkles size={14} /></div>
    <div className="absolute bottom-1 left-1 text-orange-400 opacity-80"><Star size={12} /></div>
    <div className="absolute inset-0 border-2 border-yellow-400/20 rounded-xl"></div>
  </div>
);

const CelebrationBadge = ({ celebration }: { celebration: Celebration }) => {
  const n = celebration.name.toLowerCase();
  let color = "text-primary";
  let bgColor = "bg-primary/10";
  let Icon = Sparkles;

  if (n.includes("valentine")) { color = "text-pink-500"; bgColor = "bg-pink-500/10"; Icon = Heart; }
  else if (celebration.type === 'muslim') { color = "text-emerald-500"; bgColor = "bg-emerald-500/10"; Icon = Moon; }
  else if (n.includes("independence")) { color = "text-green-600"; bgColor = "bg-green-600/10"; Icon = Flag; }

  return (
    <div className="absolute -top-1 -right-1 z-30">
      <div className={`flex items-center justify-center w-5 h-5 rounded-full border border-background shadow-sm backdrop-blur-md ${bgColor} ${color}`}>
        <Icon className="w-3 h-3" />
      </div>
    </div>
  );
};

// --- Navbar Component ---

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCelebrations, setActiveCelebrations] = useState<Celebration[]>([]);
  const [showCelebrationHint, setShowCelebrationHint] = useState(false);

  useEffect(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    const active = CELEBRATIONS.filter(c => {
      const [sM, sD] = c.startDate.split('-').map(Number);
      const [eM, eD] = c.endDate.split('-').map(Number);
      const start = new Date(currentYear, sM - 1, sD);
      let end = new Date(currentYear, eM - 1, eD);
      if (end < start) end.setFullYear(currentYear + 1);
      return today >= start && today <= end;
    });

    setActiveCelebrations(active);
    if (active.length > 0) {
      setShowCelebrationHint(true);
      const timer = setTimeout(() => setShowCelebrationHint(false), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const primary = activeCelebrations[0];
  const isChristmas = primary?.name.toLowerCase().includes("christmas");
  const isNewYear = primary?.name.toLowerCase().includes("new year");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Celebration Hint Banner */}
      {showCelebrationHint && primary && (
        <div className="bg-gradient-to-r from-primary/20 to-accent/20 border-b border-primary/30">
          <div className="container mx-auto px-4 py-1 text-center">
            <span className="text-sm font-medium flex items-center justify-center gap-2 font-sans">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Celebrating {primary.name}!</span>
              <Sparkles className="w-4 h-4 text-primary" />
            </span>
          </div>
        </div>
      )}
      
      <AdireAccent className="h-1" />
      
      <div className="bg-card/90 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            
            {/* Logo Section */}
            <Link to="/" className="flex items-center gap-3 group relative">
              <div className="w-11 h-11 rounded-xl overflow-hidden shadow-lg ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300 group-hover:scale-105 relative bg-white">
                <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
                
                {/* Visual Effects (Non-animated) */}
                {isNewYear && <FireworkFlare />}
                {isChristmas && <SantaHat />}
                {!isChristmas && primary && <CelebrationBadge celebration={primary} />}
              </div>

              {/* Updated typography to match index page */}
              <span className="font-display text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SteerSolo
                {primary && (
                  <span className="ml-2 text-lg inline-block text-primary">
                    {isChristmas ? "🎄" : <Sparkles className="inline w-5 h-5" />}
                  </span>
                )}
              </span>
            </Link>

            {/* Desktop Nav - Updated typography */}
            <div className="hidden md:flex items-center gap-8 font-display">
              {["Shops", "About", "Feedback"].map((label) => (
                <Link 
                  key={label}
                  to={`/${label.toLowerCase()}`} 
                  className="text-foreground/80 hover:text-primary transition-colors font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
                >
                  Explore {label}
                </Link>
              ))}
            </div>

            {/* Desktop Auth - Updated typography */}
            <div className="hidden md:flex items-center gap-3 font-display">
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

            {/* Mobile Button */}
            <button className="md:hidden p-2 rounded-lg hover:bg-muted relative" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {activeCelebrations.length > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></div>
              )}
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Updated typography */}
      <div className={`md:hidden bg-card/95 backdrop-blur-xl border-b border-border overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="container mx-auto px-4 py-4 space-y-4 font-display">
          <Link to="/shops" className="block py-3 px-4 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors font-medium">Explore Shops</Link>
          <Link to="/about" className="block py-3 px-4 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors font-medium">About</Link>
          <div className="pt-4 border-t border-border space-y-3">
            <Link to="/auth/login">
              <Button variant="outline" className="w-full border-primary/30 font-display">Login</Button>
            </Link>
            <Link to="/auth/login?tab=signup">
              <Button className="w-full bg-gradient-to-r from-primary to-accent font-display">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;