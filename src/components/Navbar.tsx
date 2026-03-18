import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Menu, X, Moon, Sun, Search, ShoppingBag } from "lucide-react";
import logoLight from "@/assets/steersolo-logo.jpg";
import logoDark from "@/assets/steersolo-logo-dark.jpg";
import { useTheme } from "next-themes";

interface NavbarProps {
  shopBranding?: {
    name: string;
    logoUrl: string | null;
  } | null;
}

const Navbar = ({ shopBranding }: NavbarProps = {}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const logo = theme === 'dark' ? logoDark : logoLight;

  return (
    <nav className="shopify-nav">
      {/* Announcement Bar */}
      <div className="announcement-bar">
        Free forever plan — Start selling in 10 minutes
      </div>

      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to={shopBranding ? "#" : "/"}
            onClick={shopBranding ? (e) => e.preventDefault() : undefined}
            className="flex items-center gap-2.5 shrink-0"
          >
            <div className={`w-9 h-9 rounded-lg overflow-hidden ${theme === 'dark' ? '' : 'bg-background'}`}>
              <img
                src={shopBranding?.logoUrl || logo}
                alt={shopBranding?.name || "SteerSolo"}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-display text-lg font-bold text-foreground tracking-tight">
              {shopBranding?.name || "SteerSolo"}
            </span>
          </Link>

          {/* Center Nav — Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Shops", to: "/shops" },
              { label: "About", to: "/about" },
              { label: "Pricing", to: "/pricing" },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Icons — Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-full h-9 w-9"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}
            <Link to="/shops">
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" aria-label="Search">
                <Search className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" aria-label="Account">
                <User className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth/login?tab=signup">
              <Button size="sm" className="ml-2 h-9 rounded-full bg-foreground text-background hover:bg-foreground/90 text-xs font-medium px-5">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-background border-t border-border overflow-hidden transition-all duration-300 ${
          isMobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="container mx-auto px-4 py-4 space-y-1">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-3 w-full min-h-[44px] py-3 px-4 rounded-lg hover:bg-muted transition-colors text-sm font-medium"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          )}
          <Link to="/shops" className="flex items-center gap-3 min-h-[44px] py-3 px-4 rounded-lg hover:bg-muted transition-colors text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
            Shops
          </Link>
          <Link to="/about" className="flex items-center gap-3 min-h-[44px] py-3 px-4 rounded-lg hover:bg-muted transition-colors text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
            About
          </Link>
          <Link to="/pricing" className="flex items-center gap-3 min-h-[44px] py-3 px-4 rounded-lg hover:bg-muted transition-colors text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
            Pricing
          </Link>
          <Link to="/feedback" className="flex items-center gap-3 min-h-[44px] py-3 px-4 rounded-lg hover:bg-muted transition-colors text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
            Feedback
          </Link>
          <div className="pt-3 border-t border-border space-y-2">
            <Link to="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full min-h-[44px]">Login</Button>
            </Link>
            <Link to="/auth/login?tab=signup" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full min-h-[44px] bg-foreground text-background hover:bg-foreground/90">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
