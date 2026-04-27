import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  User, Menu, X, Gift, Moon, Sun, Star, 
  Heart, Flag, Ghost, Egg, Sparkles, Store, MessageSquare, CalendarDays
} from "lucide-react";
import { AdireAccent } from "./patterns/AdirePattern";
import logoLight from "@/assets/steersolo-logo.jpg";
import logoDark from "@/assets/steersolo-logo-dark.jpg";
import { useTheme } from "next-themes";

// --- Types ---
interface Celebration {
  name: string;
  startDate: string; // MM-DD
  endDate: string;   // MM-DD
  type: 'christian' | 'muslim' | 'general' | 'cultural';
  vibe: string;
  ctaLabel: string;
  ctaHref: string;
}

// --- Configuration ---
const CELEBRATIONS: Celebration[] = [
  { name: "Christmas", startDate: "12-20", endDate: "12-27", type: 'christian', vibe: "Festive gifting season", ctaLabel: "Holiday-ready shops", ctaHref: "/shops" },
  { name: "New Year", startDate: "12-31", endDate: "01-02", type: 'general', vibe: "Fresh goals, fresh products", ctaLabel: "Start selling stronger", ctaHref: "/pricing" },
  { name: "Eid al-Fitr", startDate: "04-09", endDate: "04-11", type: 'muslim', vibe: "Celebrate with trusted vendors", ctaLabel: "Explore Eid specials", ctaHref: "/shops" },
  { name: "Valentine's Day", startDate: "02-14", endDate: "02-14", type: 'general', vibe: "Love-inspired gifting", ctaLabel: "Discover gift shops", ctaHref: "/shops" },
  { name: "Independence Day", startDate: "10-01", endDate: "10-01", type: 'cultural', vibe: "Naija-made excellence", ctaLabel: "Support local brands", ctaHref: "/shops" },
  { name: "Halloween", startDate: "10-31", endDate: "10-31", type: 'general', vibe: "Bold looks, spooky vibes", ctaLabel: "See trending stores", ctaHref: "/shops" },
  { name: "Easter", startDate: "04-07", endDate: "04-07", type: 'christian', vibe: "Seasonal deals and joy", ctaLabel: "Shop Easter picks", ctaHref: "/shops" }
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

interface NavbarProps {
  shopBranding?: {
    name: string;
    logoUrl: string | null;
  } | null;
}

const Navbar = ({ shopBranding }: NavbarProps = {}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCelebrations, setActiveCelebrations] = useState<Celebration[]>([]);
  const [showCelebrationHint, setShowCelebrationHint] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

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
      const [sM, sD] = active[0].startDate.split('-').map(Number);
      const [eM, eD] = active[0].endDate.split('-').map(Number);
      const start = new Date(currentYear, sM - 1, sD);
      let end = new Date(currentYear, eM - 1, eD);
      if (end < start) end.setFullYear(currentYear + 1);
      const msLeft = end.getTime() - today.getTime();
      setDaysRemaining(Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24))));

      const dismissedKey = `season_banner_dismissed_${active[0].name}_${currentYear}`;
      const dismissed = localStorage.getItem(dismissedKey) === 'true';
      setShowCelebrationHint(!dismissed);
    }
  }, []);

  const primary = activeCelebrations[0];
  const isChristmas = primary?.name.toLowerCase().includes("christmas");
  const isNewYear = primary?.name.toLowerCase().includes("new year");
  const dismissCelebrationHint = () => {
    if (!primary) return;
    const year = new Date().getFullYear();
    localStorage.setItem(`season_banner_dismissed_${primary.name}_${year}`, 'true');
    setShowCelebrationHint(false);
  };

  const logo = theme === 'dark' ? logoDark : logoLight;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Celebration Hint Banner */}
      {showCelebrationHint && primary && (
        <div className="bg-gradient-to-r from-primary via-primary/90 to-accent text-white border-b border-primary/40">
          <div className="container mx-auto px-3 py-2">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold">{primary.name} Season</span>
              <span className="text-white/80 hidden sm:inline">• {primary.vibe}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px]">
                <CalendarDays className="w-3 h-3" /> {daysRemaining === 0 ? 'Today only' : `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} left`}
              </span>
              <Link to={primary.ctaHref} className="underline underline-offset-2 font-semibold">
                {primary.ctaLabel}
              </Link>
              <button onClick={dismissCelebrationHint} className="rounded-md px-1.5 py-0.5 hover:bg-white/15" aria-label="Dismiss celebration banner">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      <AdireAccent className="h-1" />
      
      <div className="bg-card/90 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-3 md:py-2.5">
          <div className="flex items-center justify-between">
            
            {/* Logo Section */}
            <div className="flex items-center gap-3 group relative">
              <div
                className={`w-12 h-12 rounded-xl overflow-hidden shadow-lg ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300 group-hover:scale-105 relative select-none ${theme === 'dark' ? '' : 'bg-white'}`}
                onContextMenu={(e) => e.preventDefault()}
                aria-label="Brand logo"
              >
                <img
                  src={shopBranding?.logoUrl || logo}
                  alt={shopBranding?.name || "SteerSolo"}
                  className="w-full h-full object-cover"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
                
                {/* Visual Effects (Non-animated) */}
                {!shopBranding && isNewYear && <FireworkFlare />}
                {!shopBranding && isChristmas && <SantaHat />}
                {!shopBranding && !isChristmas && primary && <CelebrationBadge celebration={primary} />}
              </div>

              {/* Updated typography to match index page */}
              <span className="hidden min-[360px]:inline font-display text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {shopBranding?.name || "SteerSolo"}
                {!shopBranding && primary && (
                  <span className="ml-2 text-lg inline-block text-primary">
                    {isChristmas ? "🎄" : <Sparkles className="inline w-5 h-5" />}
                  </span>
                )}
              </span>
            </div>

            {/* Desktop Nav - Updated typography */}
            <div className="hidden md:flex items-center gap-6 font-display">
              {[
                { label: "Shops", href: "/shops" },
                { label: "Blog", href: "/blog" },
                { label: "About", href: "/about" },
                { label: "Ambassador", href: "/ambassador-program" },
                { label: "Feedback", href: "/feedback" },
              ].map((item) => (
                <Link 
                  key={item.label}
                  to={item.href}
                  className="text-sm lg:text-base text-foreground/80 hover:text-primary transition-colors font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
                >
                  Explore {item.label}
                </Link>
              ))}
            </div>

            {/* Desktop Auth - Updated typography */}
            <div className="hidden md:flex items-center gap-2.5 font-display">
              {/* Dark Mode Toggle */}
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              )}
              <Link to="/shopper">
                <Button variant="ghost" size="sm" className="h-9 px-3 text-sm font-medium hover:bg-primary/10 hover:text-primary">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
              <Link to="/auth/login?tab=signup">
                <Button size="sm" className="h-9 px-4 text-sm bg-gradient-to-r from-primary via-accent to-primary hover:brightness-110 transition-all font-semibold shadow-lg shadow-primary/30 border border-white/20">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Button */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-muted relative" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {activeCelebrations.length > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></div>
              )}
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Updated typography */}
      <div className={`md:hidden bg-card/95 backdrop-blur-xl border-b border-border overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="container mx-auto px-4 py-4 space-y-1 font-display">
          {/* Mobile Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-3 w-full min-h-[48px] py-3 px-4 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors font-medium"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-5 w-5 text-yellow-500" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          )}
          <div className="section-divider my-1" />
          <Link to="/shops" className="flex items-center gap-3 min-h-[48px] py-3 px-4 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors font-medium">
            <Store className="w-5 h-5" />
            Explore Shops
          </Link>
          <div className="section-divider my-1" />
          <Link to="/blog" className="flex items-center gap-3 min-h-[48px] py-3 px-4 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors font-medium">
            <MessageSquare className="w-5 h-5" />
            Blog
          </Link>
          <div className="section-divider my-1" />
          <Link to="/about" className="flex items-center gap-3 min-h-[48px] py-3 px-4 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors font-medium">
            <Star className="w-5 h-5" />
            About
          </Link>
          <div className="section-divider my-1" />
          <Link to="/feedback" className="flex items-center gap-3 min-h-[48px] py-3 px-4 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors font-medium">
            <MessageSquare className="w-5 h-5" />
            Feedback
          </Link>
          <div className="section-divider my-1" />
          <Link to="/ambassador-program" className="flex items-center gap-3 min-h-[48px] py-3 px-4 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors font-medium">
            <Gift className="w-5 h-5" />
            Ambassador Program
          </Link>
          <div className="pt-4 border-t border-border space-y-3">
            <Link to="/shopper">
              <Button variant="outline" className="w-full min-h-[48px] border-primary/30 font-display">Login</Button>
            </Link>
            <Link to="/auth/login?tab=signup">
              <Button className="w-full min-h-[48px] bg-gradient-to-r from-primary via-accent to-primary hover:brightness-110 transition-all font-display font-semibold shadow-lg shadow-primary/25 border border-white/20">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
