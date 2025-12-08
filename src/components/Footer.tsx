import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Mail, Heart } from "lucide-react";
import { AdirePattern, AdireAccent } from "./patterns/AdirePattern";

export const Footer = () => {
  return (
    <footer className="relative bg-primary text-primary-foreground overflow-hidden">
      {/* Adire Pattern Overlay */}
      <AdirePattern variant="circles" className="text-white" opacity={0.1} />
      
      {/* Top accent line */}
      <AdireAccent className="h-1" />
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <h3 className="font-display text-2xl font-bold mb-4">SteerSolo</h3>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Empowering Nigerian solo entrepreneurs to build, grow, and thrive in the digital economy.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="mailto:hello@steersolo.com" 
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/shops" className="text-primary-foreground/80 hover:text-white transition-colors text-sm">
                  Browse Shops
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-primary-foreground/80 hover:text-white transition-colors text-sm">
                  Start Selling
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-primary-foreground/80 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-primary-foreground/80 hover:text-white transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/feedback" className="text-primary-foreground/80 hover:text-white transition-colors text-sm">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-primary-foreground/80 hover:text-white transition-colors text-sm">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-primary-foreground/80 hover:text-white transition-colors text-sm">
                  Report Issue
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-primary-foreground/80 hover:text-white transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-primary-foreground/80 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-primary-foreground/70 text-sm">
              © {new Date().getFullYear()} SteerSolo. All rights reserved.
            </p>
            <div className="flex items-center gap-1 text-sm text-primary-foreground/70">
              Made with <Heart className="w-4 h-4 text-destructive fill-destructive animate-pulse-soft" /> in Nigeria 🇳🇬
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
