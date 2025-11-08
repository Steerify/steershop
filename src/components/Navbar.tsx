import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Store, User } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SteerSolo
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/shops" className="text-foreground hover:text-accent transition-colors">
              Explore Shops
            </Link>
            <Link to="/about" className="text-foreground hover:text-accent transition-colors">
              About
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/auth/login">
              <Button variant="ghost" size="sm">
                <User className="w-4 h-4 mr-2" />
                Login
              </Button>
            </Link>
            <Link to="/auth/signup">
              <Button size="sm" className="bg-accent hover:bg-accent/90">
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
