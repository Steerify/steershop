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
  { name: "Valentine's Day", startDate: "02-13", endDate: "02-15", type: 'general' },
  { name: "Independence Day", startDate: "10-01", endDate: "10-01", type: 'cultural' },
  { name: "Halloween", startDate: "10-30", endDate: "11-01", type: 'general' },
  { name: "Easter", startDate: "04-07", endDate: "04-09", type: 'christian' }
];

// --- Styled Components & Helpers ---

const getCelebrationStyles = (name: string, type: string) => {
  const n = name.toLowerCase();
  if (n.includes("christmas")) return { Icon: Gift, color: "text-red-500", bgColor: "bg-red-500/10" };
  if (type === 'muslim') return { Icon: Moon, color: "text-emerald-500", bgColor: "bg-emerald-500/10" };
  if (n.includes("valentine")) return { Icon: Heart, color: "text-pink-500", bgColor: "bg-pink-500/10" };
  if (n.includes("independence")) return { Icon: Flag, color: "text-green-600", bgColor: "bg-green-600/10" };
  if (n.includes("halloween")) return { Icon: Ghost, color: "text-orange-500", bgColor: "bg-orange-500/10" };
  return { Icon: Sparkles, color: "text-primary", bgColor: "bg-primary/10" };
};

const SantaHat = () => (
  <div className="absolute -top-[16px] -left-[12px] w-14 h-12 -rotate-[15deg] pointer-events-none z-30 drop-shadow-md animate-bounce" style={{ animationDuration: '3s' }}>
    {/* Red Body */}
    <div className="absolute bottom-3 left-3 w-10 h-7 bg-red-600 rounded-t-[80%] rounded-b-sm" />
    {/* Fur Trim */}
    <div className="absolute bottom-2 left-2 w-12 h-3.5 bg-white rounded-full shadow-sm" />
    {/* Pom Pom */}
    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full border border-slate-100" />
  </div>
);

const FireworkFlare = () => (
  <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-2xl">
    {[...Array(3)].map((_, i) => (
      <div 
        key={i}
        className="absolute inset-0 animate-ping opacity-0"
        style={{ 
          animationDelay: `${i * 0.6}s`, 
          animationDuration: '2s',
          boxShadow: `inset 0 0 15px ${i % 2 === 0 ? '#fbbf24' : '#ffffff'}` 
        }}
      />
    ))}
    <div className="absolute top-1 right-1 animate-pulse text-yellow-400"><Sparkles size={12} /></div>
    <div className="absolute bottom-1 left-1 animate-pulse delay-300 text-white"><Star size={10} /></div>
  </div>
);

const CelebrationBadge = ({ celebration }: { celebration: Celebration }) => {
  const { Icon, color, bgColor } = getCelebrationStyles(celebration.name, celebration.type);
  return (
    <div className="absolute -top-1 -right-1 z-30">
      <div className={`flex items-center justify-center w-5 h-5 rounded-full border border-white/50 shadow-sm backdrop-blur-md ${bgColor} ${color}`}>
        <Icon className="w-3 h-3" />
      </div>
    </div>
  );
};

// --- Main Navbar Component ---

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCelebrations, setActiveCelebrations] = useState<Celebration[]>([]);
  const [showCelebrationHint, setShowCelebrationHint] = useState(false);

  useEffect(() => {
    const checkCelebrations = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      
      const active = CELEBRATIONS.filter(c => {
        const [sM, sD] = c.startDate.split('-').map(Number);
        const [eM, eD] = c.endDate.split('-').map(Number);
        
        const start = new Date(currentYear, sM - 1, sD);
        let end = new Date(currentYear, eM - 1, eD);
        
        if (end < start) end.setFullYear(currentYear + 1);
        return now >= start && now <= end;
      });

      setActiveCelebrations(active);
      if (active.length > 0) {
        setShowCelebrationHint(true);
        setTimeout(() => setShowCelebrationHint(false), 8000);
      }
    };

    checkCelebrations();
  }, []);

  const primary = activeCelebrations[0];
  const isChristmas = primary?.name.toLowerCase().includes("christmas");
  const isNewYear = primary?.name.toLowerCase().includes("new year");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Celebration Banner */}
      {showCelebrationHint && primary && (
        <div className="bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 py-1 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              <Sparkles size={12} className="animate-pulse" />
              Season's Greetings: {primary.name}
              <Sparkles size={12} className="animate-pulse" />
            </p>
          </div>
        </div>
      )}
      
      <AdireAccent className="h-1" />
      
      <div className="bg-card/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            
            {/* Brand Logo Section */}
            <Link to="/" className="flex items-center gap-4 group relative">
              <div className="relative">
                {/* Logo Container */}
                <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg ring-1 ring-border group-hover:ring-primary/40 transition-all duration-500 bg-white relative">
                  <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
                  {isNewYear && <FireworkFlare />}
                </div>

                {/* Overlays */}
                {isChristmas && <SantaHat />}
                {!isChristmas && primary && <CelebrationBadge celebration={primary} />}
              </div>

              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                  SteerSolo
                </span>
                {primary && (
                  <span className="text-[9px] font-black text-primary uppercase tracking-tighter">
                    {primary.name} Edition
                  </span>
                )}
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {["Shops", "About", "Feedback"].map((item) => (
                <Link 
                  key={item}
                  to={`/${item.toLowerCase()}`} 
                  className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/auth/login">
                <Button variant="ghost" size="sm" className="font-bold">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
              <Link to="/auth/login?tab=signup">
                <Button size="sm" className="bg-primary hover:opacity-90 font-bold px-6 shadow-md shadow-primary/20">
                  Join Free
                </Button>
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden bg-card border-b transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? "max-h-96" : "max-h-0"}`}>
        <div className="p-4 space-y-4">
          <Link to="/shops" className="block font-medium">Explore Shops</Link>
          <Link to="/about" className="block font-medium">About</Link>
          <Link to="/auth/login" className="block">
            <Button className="w-full">Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;