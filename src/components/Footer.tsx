import { Link } from "react-router-dom";
import { Twitter, Instagram, Mail, Heart } from "lucide-react";
import { AdirePattern, AdireAccent } from "./patterns/AdirePattern";
import logo from "@/assets/steersolo-logo.jpg";

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
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg ring-2 ring-gold/30">
                <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
              </div>
              <span className="font-heading text-2xl font-bold text-gold">SteerSolo</span>
            </Link>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Empowering Nigerian solo entrepreneurs to build, grow, and thrive in the digital economy.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a 
                href="https://instagram.com/steerifygroup" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold/20 hover:text-gold transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://x.com/SteerifyGroup" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold/20 hover:text-gold transition-colors"
                aria-label="X (Twitter)"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <button 
                onClick={() => {
                  const webLink = 'https://www.threads.net/@steerifygroup';
                  window.open(webLink, '_blank', 'noopener,noreferrer');
                }}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold/20 hover:text-gold transition-colors"
                aria-label="Threads"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.33-3.022.88-.732 2.07-1.128 3.446-1.145.935-.012 1.895.085 2.825.287.003-.876-.097-1.585-.298-2.104-.29-.748-.797-1.089-1.773-1.147l-.216-.006c-.93 0-2.17.27-2.74 1.337l-1.787-.98c.754-1.404 2.162-2.248 4.527-2.248l.312.006c1.63.091 2.872.711 3.592 1.793.648.972.977 2.29.977 3.915v.422c1.27.542 2.254 1.34 2.893 2.37.85 1.368 1.058 3.283.057 5.262-1.104 2.183-3.118 3.49-6.015 3.895-.56.078-1.134.118-1.712.12zm.178-7.026c-.918.012-1.682.243-2.212.668-.476.38-.66.823-.634 1.222.027.411.253.825.636 1.073.526.342 1.256.48 2.047.436 1.07-.058 1.859-.443 2.413-1.178.36-.477.616-1.074.758-1.778-.94-.207-1.94-.338-2.89-.444l-.118.001z"/>
                </svg>
              </button>
              <a 
                href="mailto:info@steerifygroup.com" 
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold/20 hover:text-gold transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4 text-gold">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/shops" className="text-primary-foreground/80 hover:text-gold transition-colors text-sm">
                  Browse Shops
                </Link>
              </li>
              <li>
                <Link to="/auth/login?tab=signup" className="text-primary-foreground/80 hover:text-gold transition-colors text-sm">
                  Start Selling
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-primary-foreground/80 hover:text-gold transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-primary-foreground/80 hover:text-gold transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4 text-gold">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/feedback" className="text-primary-foreground/80 hover:text-gold transition-colors text-sm">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-primary-foreground/80 hover:text-gold transition-colors text-sm">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-primary-foreground/80 hover:text-gold transition-colors text-sm">
                  Report Issue
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4 text-gold">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/terms" className="text-primary-foreground/80 hover:text-gold transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-primary-foreground/80 hover:text-gold transition-colors text-sm">
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
