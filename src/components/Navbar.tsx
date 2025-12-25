import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Menu, X } from "lucide-react";
import { AdireAccent } from "./patterns/AdirePattern";
import logo from "@/assets/steersolo-logo.jpg";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Adire accent line */}
      <AdireAccent className="h-1" />
      
      {/* Main navbar */}
      <div className="bg-card/90 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-xl overflow-hidden shadow-lg ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300 group-hover:scale-105">
                <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
              </div>
              <span className="text-2xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SteerSolo
              </span>
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

      {/* Mobile Menu */}
      <div 
        className={`md:hidden bg-card/95 backdrop-blur-xl border-b border-border overflow-hidden transition-all duration-300 ${
          isMobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="container mx-auto px-4 py-4 space-y-4">
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
