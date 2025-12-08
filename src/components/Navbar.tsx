import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Store, User, Menu, X } from "lucide-react";
import { AdireAccent } from "./patterns/AdirePattern";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Main navbar */}
      <div className="bg-card/90 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-accent/25 transition-all duration-300 group-hover:scale-105">
                <Store className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-display font-bold gradient-text">
                SteerSolo
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link 
                to="/shops" 
                className="text-foreground/80 hover:text-accent transition-colors font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent after:transition-all hover:after:w-full"
              >
                Explore Shops
              </Link>
              <Link 
                to="/about" 
                className="text-foreground/80 hover:text-accent transition-colors font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent after:transition-all hover:after:w-full"
              >
                About
              </Link>
              <Link 
                to="/feedback" 
                className="text-foreground/80 hover:text-accent transition-colors font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent after:transition-all hover:after:w-full"
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
              <Link to="/auth/signup">
                <Button size="sm" className="bg-gradient-to-r from-accent to-primary hover:opacity-90 transition-opacity font-medium shadow-lg shadow-accent/20">
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

        {/* Adire accent line */}
        <AdireAccent className="h-0.5 opacity-60" />
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden bg-card/95 backdrop-blur-xl border-b border-border overflow-hidden transition-all duration-300 ${
          isMobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="container mx-auto px-4 py-4 space-y-4">
          <Link 
            to="/shops" 
            className="block py-3 px-4 rounded-lg hover:bg-muted transition-colors font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Explore Shops
          </Link>
          <Link 
            to="/about" 
            className="block py-3 px-4 rounded-lg hover:bg-muted transition-colors font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About
          </Link>
          <Link 
            to="/feedback" 
            className="block py-3 px-4 rounded-lg hover:bg-muted transition-colors font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Feedback
          </Link>
          
          <div className="pt-4 border-t border-border space-y-3">
            <Link to="/auth/login" className="block" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full">
                <User className="w-4 h-4 mr-2" />
                Login
              </Button>
            </Link>
            <Link to="/auth/signup" className="block" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full bg-gradient-to-r from-accent to-primary">
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
