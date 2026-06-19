import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types/api";
import {
  User,
  Menu,
  X,
  Gift,
  Moon,
  Sun,
  Star,
  Home,
  Heart,
  Flag,
  Ghost,
  Egg,
  Sparkles,
  Store,
  MessageSquare,
  CalendarDays,
  Tag,
  Megaphone,
} from "lucide-react";
import { AdireAccent } from "./patterns/AdirePattern";
import logoDark from "@/assets/steersolo-logo-dark.jpg";
import { useTheme } from "next-themes";
import { ShopAvatar } from "./ShopAvatar";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// --- Types ---
interface Celebration {
  name: string;
  startDate: string; // MM-DD
  endDate: string; // MM-DD
  type: "christian" | "muslim" | "general" | "cultural";
  vibe: string;
  ctaLabel: string;
  ctaHref: string;
}

// --- Configuration ---
const CELEBRATIONS: Celebration[] = [
  {
    name: "Christmas",
    startDate: "12-20",
    endDate: "12-27",
    type: "christian",
    vibe: "Festive gifting season",
    ctaLabel: "Holiday-ready shops",
    ctaHref: "/shops",
  },
  {
    name: "New Year",
    startDate: "12-31",
    endDate: "01-02",
    type: "general",
    vibe: "Fresh goals, fresh products",
    ctaLabel: "Start selling stronger",
    ctaHref: "/auth/signup",
  },
  {
    name: "Eid al-Fitr",
    startDate: "04-09",
    endDate: "04-11",
    type: "muslim",
    vibe: "Celebrate with trusted merchants",
    ctaLabel: "View Eid specials",
    ctaHref: "/shops",
  },
  {
    name: "Valentine's Day",
    startDate: "02-14",
    endDate: "02-14",
    type: "general",
    vibe: "Love-inspired gifting",
    ctaLabel: "Discover gift shops",
    ctaHref: "/shops",
  },
  {
    name: "Independence Day",
    startDate: "10-01",
    endDate: "10-01",
    type: "cultural",
    vibe: "Naija-made excellence",
    ctaLabel: "Support local brands",
    ctaHref: "/shops",
  },
  {
    name: "Halloween",
    startDate: "10-31",
    endDate: "10-31",
    type: "general",
    vibe: "Bold looks, spooky vibes",
    ctaLabel: "See trending stores",
    ctaHref: "/shops",
  },
  {
    name: "Easter",
    startDate: "04-07",
    endDate: "04-07",
    type: "christian",
    vibe: "Seasonal deals and joy",
    ctaLabel: "Shop Easter picks",
    ctaHref: "/shops",
  },
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
    <div className="absolute top-1 right-1 text-yellow-400 opacity-80">
      <Sparkles size={14} />
    </div>
    <div className="absolute bottom-1 left-1 text-orange-400 opacity-80">
      <Star size={12} />
    </div>
    <div className="absolute inset-0 border-2 border-yellow-400/20 rounded-xl"></div>
  </div>
);

const CelebrationBadge = ({ celebration }: { celebration: Celebration }) => {
  const n = celebration.name.toLowerCase();
  let color = "text-primary";
  let bgColor = "bg-primary/10";
  let Icon = Sparkles;

  if (n.includes("valentine")) {
    color = "text-pink-500";
    bgColor = "bg-pink-500/10";
    Icon = Heart;
  } else if (celebration.type === "muslim") {
    color = "text-accent";
    bgColor = "bg-accent/10";
    Icon = Moon;
  } else if (n.includes("independence")) {
    color = "text-primary";
    bgColor = "bg-primary/10";
    Icon = Flag;
  }

  return (
    <div className="absolute -top-1 -right-1 z-30">
      <div
        className={`flex items-center justify-center w-5 h-5 rounded-full border border-background shadow-sm backdrop-blur-md ${bgColor} ${color}`}
      >
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
  const [activeCelebrations, setActiveCelebrations] = useState<Celebration[]>(
    [],
  );
  const [showCelebrationHint, setShowCelebrationHint] = useState(false);
  const [showRestoredBanner, setShowRestoredBanner] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Show "Back to Dashboard" banner when user lands here via post-login session restore
  useEffect(() => {
    const state = location.state as { restoredFromLogin?: boolean } | null;
    if (state?.restoredFromLogin) {
      setShowRestoredBanner(true);
    } else {
      setShowRestoredBanner(false);
    }
  }, [location]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const today = new Date();
    const currentYear = today.getFullYear();

    const active = CELEBRATIONS.filter(c => {
      const [sM, sD] = c.startDate.split("-").map(Number);
      const [eM, eD] = c.endDate.split("-").map(Number);
      const start = new Date(currentYear, sM - 1, sD);
      let end = new Date(currentYear, eM - 1, eD);
      if (end < start) end.setFullYear(currentYear + 1);
      return today >= start && today <= end;
    });

    setActiveCelebrations(active);

    if (active.length > 0) {
      const [sM, sD] = active[0].startDate.split("-").map(Number);
      const [eM, eD] = active[0].endDate.split("-").map(Number);
      const start = new Date(currentYear, sM - 1, sD);
      let end = new Date(currentYear, eM - 1, eD);
      if (end < start) end.setFullYear(currentYear + 1);
      const msLeft = end.getTime() - today.getTime();
      setDaysRemaining(Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24))));

      const dismissedKey = `season_banner_dismissed_${active[0].name}_${currentYear}`;
      const dismissed = localStorage.getItem(dismissedKey) === "true";
      setShowCelebrationHint(!dismissed);
    }
  }, []);

  const primary = activeCelebrations[0];
  const isChristmas = primary?.name.toLowerCase().includes("christmas");
  const isNewYear = primary?.name.toLowerCase().includes("new year");
  const dismissCelebrationHint = () => {
    if (!primary) return;
    const year = new Date().getFullYear();
    localStorage.setItem(
      `season_banner_dismissed_${primary.name}_${year}`,
      "true",
    );
    setShowCelebrationHint(false);
  };

  const logo = logoDark;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      {/* Restored-session "Back to Dashboard" Banner */}
      {showRestoredBanner && user && (
        <div className="bg-gradient-to-r from-[hsl(215,65%,22%)] to-[hsl(145,55%,26%)] text-white border-b border-white/10 shadow-sm relative z-50 pointer-events-auto">
          <div className="container mx-auto px-3 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-medium">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Home className="w-3 h-3" />
                </div>
                <span>You've been returned to where you left off.</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-white hover:bg-white/15 text-xs px-3 rounded-full"
                  onClick={() => navigate("/dashboard")}
                >
                  ← Back to Dashboard
                </Button>
                <button
                  onClick={() => setShowRestoredBanner(false)}
                  className="rounded-full p-1 hover:bg-white/15 transition-colors"
                  aria-label="Dismiss banner"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Celebration Hint Banner */}
      {showCelebrationHint && primary && (
        <div className="bg-gradient-to-r from-primary via-primary/90 to-accent text-white border-b border-primary/40 shadow-sm relative z-50 pointer-events-auto">
          <div className="container mx-auto px-3 py-2">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold">{primary.name} Season</span>
              <span className="text-white/80 hidden sm:inline">
                • {primary.vibe}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px]">
                <CalendarDays className="w-3 h-3" />{" "}
                {daysRemaining === 0
                  ? "Today only"
                  : `${daysRemaining} day${daysRemaining > 1 ? "s" : ""} left`}
              </span>
              <Link
                to={primary.ctaHref}
                className="underline underline-offset-2 font-semibold hover:text-white/80 transition-colors"
              >
                {primary.ctaLabel}
              </Link>
              <button
                onClick={dismissCelebrationHint}
                className="rounded-md px-1.5 py-0.5 hover:bg-white/15 transition-colors"
                aria-label="Dismiss celebration banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Pill Navbar Container */}
      <div className="px-2 sm:px-4 md:px-6 pt-3 sm:pt-4 transition-all duration-300">
        <div className="max-w-[1200px] mx-auto relative pointer-events-auto">
          <div
            className={cn(
              "bg-card/85 backdrop-blur-2xl border transition-all duration-500 shadow-sm sm:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.1)] rounded-[2rem]",
              user?.role === "ENTREPRENEUR"
                ? "border-indigo-600/30 shadow-[0_4px_20px_rgba(79,70,229,0.15)]"
                : "border-border/60",
            )}
          >
            <div className="px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between">
              {/* Logo Section */}
              <Link
                to={(() => {
                  const path = location.pathname;
                  // If on dashboard routes, stay there
                  if (
                    path.startsWith("/dashboard") ||
                    path.startsWith("/admin") ||
                    path.startsWith("/shopper") ||
                    path.startsWith("/customer")
                  ) {
                    return path; // Stay on current dashboard
                  }
                  // Otherwise go home
                  return "/";
                })()}
                className="flex items-center gap-3 group relative"
              >
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden shadow-sm ring-1 ring-border group-hover:ring-primary/40 transition-all duration-300 group-hover:scale-[1.03] relative select-none ${theme === "dark" ? "" : "bg-white"}`}
                  onContextMenu={e => e.preventDefault()}
                  aria-label="Brand logo"
                >
                  {shopBranding ? (
                    <ShopAvatar
                      name={shopBranding.name}
                      logoUrl={shopBranding.logoUrl}
                      className="w-full h-full"
                      initialsClassName="text-lg"
                    />
                  ) : (
                    <img
                      src={logo}
                      alt="SteerSolo"
                      className="w-full h-full object-cover"
                      draggable={false}
                      onContextMenu={e => e.preventDefault()}
                    />
                  )}

                  {/* Visual Effects (Non-animated) */}
                  {!shopBranding && isNewYear && <FireworkFlare />}
                  {!shopBranding && isChristmas && <SantaHat />}
                  {!shopBranding && !isChristmas && primary && (
                    <CelebrationBadge celebration={primary} />
                  )}
                </div>

                {/* Updated typography to match index page */}
                <span className="hidden min-[400px]:inline font-display text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {shopBranding?.name || "SteerSolo"}
                  {!shopBranding && primary && (
                    <span className="ml-1.5 text-base inline-block text-primary">
                      {isChristmas ? (
                        "🎄"
                      ) : (
                        <Sparkles className="inline w-4 h-4" />
                      )}
                    </span>
                  )}
                </span>
              </Link>

              {/* Desktop Nav - Updated typography */}
              <div className="hidden lg:flex items-center gap-6 font-display absolute left-1/2 -translate-x-1/2">
                {[
                  { label: "Marketplace", href: "/shops" },
                  { label: "Pricing", href: "/pricing" },
                  { label: "Steerify Ads", href: "/ads" },
                  { label: "About", href: "/about" },
                ].map(item => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="text-[13px] font-semibold text-foreground/70 hover:text-primary transition-colors tracking-wide"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Desktop Auth - Updated typography */}
              <div className="hidden md:flex items-center gap-2 font-display">
                {/* Dark Mode Toggle */}
                {mounted && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                    className="rounded-full w-9 h-9 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border/50"
                    aria-label="Toggle theme"
                  >
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </Button>
                )}
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-muted/50 border border-transparent hover:border-border/50 transition-all">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shadow-sm ring-1 ring-white/20">
                          {(user?.firstName ||
                            user?.email ||
                            "U")[0].toUpperCase()}
                        </div>
                        <div className="hidden lg:block text-left">
                          <p className="text-[11px] font-bold leading-none mb-0.5">
                            {user?.firstName || "User"}
                          </p>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[8px] h-3 px-1.5 border-none",
                              user?.role === "ENTREPRENEUR"
                                ? "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400"
                                : "bg-primary/10 text-primary dark:text-accent",
                            )}
                          >
                            {user?.role === "ENTREPRENEUR"
                              ? "Merchant Mode"
                              : "Shopper Mode"}
                          </Badge>
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 mt-2 rounded-2xl p-1 shadow-xl border-border/60"
                    >
                      <DropdownMenuLabel className="px-3 py-2.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                          Signed in as
                        </p>
                        <p className="text-sm font-bold truncate">
                          {user.email}
                        </p>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-border/60" />
                      <DropdownMenuItem asChild>
                        <Link
                          to={
                            user?.role === "ENTREPRENEUR"
                              ? "/dashboard"
                              : "/shopper"
                          }
                          className="flex items-center gap-3 cursor-pointer rounded-xl px-3 py-2.5"
                        >
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold text-sm">
                            {user?.role === "ENTREPRENEUR"
                              ? "Merchant Dashboard"
                              : "My Orders"}
                          </span>
                        </Link>
                      </DropdownMenuItem>
                      {user?.role === "ENTREPRENEUR" && (
                        <DropdownMenuItem asChild>
                          <Link
                            to="/my-store"
                            className="flex items-center gap-3 cursor-pointer rounded-xl px-3 py-2.5"
                          >
                            <Store className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold text-sm">
                              Manage My Store
                            </span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="bg-border/60" />
                      <DropdownMenuItem
                        onClick={() => signOut()}
                        className="flex items-center gap-3 cursor-pointer rounded-xl px-3 py-2.5 text-destructive focus:text-destructive focus:bg-destructive/10"
                      >
                        <X className="w-4 h-4" />
                        <span className="font-bold text-sm">Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Link to="/shopper">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-4 rounded-full text-[13px] font-semibold hover:bg-muted text-muted-foreground hover:text-foreground"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link to="/auth/login?tab=signup">
                      <Button
                        size="sm"
                        className="h-9 px-5 rounded-full text-[13px] font-bold shadow-md hover:shadow-lg transition-all bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Button */}
              <div className="flex md:hidden items-center gap-1.5">
                {mounted && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                    className="rounded-full w-9 h-9 hover:bg-muted text-muted-foreground"
                    aria-label="Toggle theme"
                  >
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <button
                  className="p-2 rounded-full hover:bg-muted text-foreground transition-colors relative"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                >
                  {activeCelebrations.length > 0 && (
                    <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background"></div>
                  )}
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Floating Mobile Menu */}
          <div
            className={`md:hidden absolute top-full left-0 right-0 mt-3 bg-card/95 backdrop-blur-2xl border border-border/60 rounded-[2rem] shadow-xl overflow-hidden transition-all duration-400 origin-top ${isMobileMenuOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 pointer-events-none"}`}
          >
            <div className="px-5 py-6 space-y-1 font-display">
              <Link
                to="/shops"
                className="flex items-center gap-4 py-3.5 px-2 rounded-xl hover:bg-muted/50 text-foreground transition-colors font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Store className="w-5 h-5 text-muted-foreground" />
                Marketplace
              </Link>
              <Link
                to="/pricing"
                className="flex items-center gap-4 py-3.5 px-2 rounded-xl hover:bg-muted/50 text-foreground transition-colors font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Tag className="w-5 h-5 text-muted-foreground" />
                Pricing
              </Link>
              <Link
                to="/ads"
                className="flex items-center gap-4 py-3.5 px-2 rounded-xl hover:bg-muted/50 text-foreground transition-colors font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Megaphone className="w-5 h-5 text-muted-foreground" />
                Steerify Ads
              </Link>
              <Link
                to="/about"
                className="flex items-center gap-4 py-3.5 px-2 rounded-xl hover:bg-muted/50 text-foreground transition-colors font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Star className="w-5 h-5 text-muted-foreground" />
                About
              </Link>
              <div className="h-px bg-border/60 my-2" />
              <Link
                to="/feedback"
                className="flex items-center gap-4 py-3.5 px-2 rounded-xl hover:bg-muted/50 text-foreground transition-colors font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
                Feedback
              </Link>
              <Link
                to="/ambassador-program"
                className="flex items-center gap-4 py-3.5 px-2 rounded-xl hover:bg-muted/50 text-foreground transition-colors font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Gift className="w-5 h-5 text-muted-foreground" />
                Ambassador Program
              </Link>

              <div className="pt-6 mt-2 border-t border-border/60 space-y-3">
                {user ? (
                  <>
                    <Link
                      to={
                        user?.role === "ENTREPRENEUR"
                          ? "/dashboard"
                          : "/shopper"
                      }
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button className="w-full h-12 rounded-full font-bold shadow-md bg-primary text-primary-foreground">
                        {user?.role === "ENTREPRENEUR"
                          ? "Merchant Dashboard"
                          : "My Orders"}
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full h-12 rounded-full font-bold border-border/60"
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/shopper"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button
                        variant="outline"
                        className="w-full h-12 rounded-full font-bold border-border/60"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link
                      to="/auth/login?tab=signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button className="w-full h-12 rounded-full font-bold shadow-md bg-primary text-primary-foreground">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
