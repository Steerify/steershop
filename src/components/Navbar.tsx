import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Menu, X, LogOut } from "lucide-react";
import { AdireAccent } from "./patterns/AdirePattern";
import steersoloLogo from "@/assets/steersolo-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();
        setUserRole(roleData?.role || null);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (!session?.user) {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
    toast({
      title: "Logged out",
      description: "Come back soon!",
    });
    navigate("/");
  };

  const getDashboardLink = () => {
    if (userRole === "admin") return "/admin";
    if (userRole === "shop_owner") return "/dashboard";
    return "/customer_dashboard";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Main navbar */}
      <div className="bg-card/90 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src={steersoloLogo} 
                alt="SteerSolo" 
                className="w-11 h-11 object-contain group-hover:scale-105 transition-transform"
              />
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
              {user ? (
                <>
                  <Link to={getDashboardLink()}>
                    <Button variant="ghost" size="sm" className="font-medium">
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth?tab=login">
                    <Button variant="ghost" size="sm" className="font-medium">
                      <User className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/auth?tab=signup">
                    <Button size="sm" className="bg-gradient-to-r from-accent to-primary hover:opacity-90 transition-opacity font-medium shadow-lg shadow-accent/20">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
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
            {user ? (
              <>
                <Link to={getDashboardLink()} className="block" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth?tab=login" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    <User className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link to="/auth?tab=signup" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-accent to-primary">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
