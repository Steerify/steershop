import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Menu, X, Sparkles, Star, Gift, TreePine, Firework, Moon, Heart, Calendar } from "lucide-react";
import { AdireAccent } from "./patterns/AdirePattern";
import logo from "@/assets/steersolo-logo.jpg";

// Celebration configuration
interface Celebration {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  icon: string;
  color: string;
  gradient: string;
  animation: 'bounce' | 'pulse' | 'spin' | 'float' | 'wiggle';
  intensity: 'low' | 'medium' | 'high';
  type: 'christian' | 'muslim' | 'general' | 'cultural' | 'new-year';
}

const CELEBRATIONS: Celebration[] = [
  // Christmas (separated from New Year)
  {
    id: 'christmas',
    name: "Christmas",
    startDate: "12-20",
    endDate: "12-26",
    icon: "🎄",
    color: "text-red-500",
    gradient: "from-red-500 to-green-500",
    animation: 'pulse',
    intensity: 'high',
    type: 'christian'
  },
  // New Year
  {
    id: 'new-year',
    name: "New Year",
    startDate: "12-30",
    endDate: "01-07",
    icon: "🎆",
    color: "text-yellow-400",
    gradient: "from-purple-500 to-yellow-400",
    animation: 'spin',
    intensity: 'high',
    type: 'new-year'
  },
  // Eid celebrations with better icons
  {
    id: 'eid-fitr',
    name: "Eid al-Fitr",
    startDate: "04-09",
    endDate: "04-11",
    icon: "🕌",
    color: "text-emerald-500",
    gradient: "from-emerald-400 to-emerald-600",
    animation: 'float',
    intensity: 'medium',
    type: 'muslim'
  },
  {
    id: 'eid-adha',
    name: "Eid al-Adha",
    startDate: "06-16",
    endDate: "06-18",
    icon: "🌟",
    color: "text-amber-500",
    gradient: "from-amber-400 to-amber-600",
    animation: 'twinkle',
    intensity: 'medium',
    type: 'muslim'
  },
  // Ramadan
  {
    id: 'ramadan',
    name: "Ramadan",
    startDate: "03-01",
    endDate: "04-01",
    icon: "🌙",
    color: "text-indigo-500",
    gradient: "from-indigo-500 to-purple-500",
    animation: 'float',
    intensity: 'low',
    type: 'muslim'
  },
  // General celebrations with better icons
  {
    id: 'valentine',
    name: "Valentine's Day",
    startDate: "02-14",
    endDate: "02-14",
    icon: "❤️",
    color: "text-pink-500",
    gradient: "from-pink-400 to-red-400",
    animation: 'pulse',
    intensity: 'medium',
    type: 'general'
  },
  {
    id: 'independence',
    name: "Independence Day",
    startDate: "10-01",
    endDate: "10-01",
    icon: "🇳🇬",
    color: "text-green-600",
    gradient: "from-green-600 to-white",
    animation: 'wiggle',
    intensity: 'medium',
    type: 'cultural'
  },
  {
    id: 'halloween',
    name: "Halloween",
    startDate: "10-31",
    endDate: "10-31",
    icon: "🎃",
    color: "text-orange-500",
    gradient: "from-orange-500 to-purple-500",
    animation: 'bounce',
    intensity: 'medium',
    type: 'general'
  },
  {
    id: 'easter',
    name: "Easter",
    startDate: "04-07",
    endDate: "04-07",
    icon: "🐣",
    color: "text-pink-300",
    gradient: "from-pink-300 to-yellow-300",
    animation: 'bounce',
    intensity: 'medium',
    type: 'christian'
  }
];

// Enhanced celebration check with better date handling
const isCelebrationActive = (celebration: Celebration): boolean => {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  const [startMonth, startDay] = celebration.startDate.split('-').map(Number);
  const [endMonth, endDay] = celebration.endDate.split('-').map(Number);
  
  let startDate = new Date(currentYear, startMonth - 1, startDay);
  let endDate = new Date(currentYear, endMonth - 1, endDay);
  
  // Handle celebrations that span across years
  if (endMonth < startMonth) {
    endDate = new Date(currentYear + 1, endMonth - 1, endDay);
  }
  
  // For New Year that starts in December and ends in January
  if (celebration.id === 'new-year') {
    if (startMonth === 12 && endMonth === 1) {
      if (today.getMonth() + 1 >= startMonth) { // December
        startDate = new Date(currentYear, startMonth - 1, startDay);
        endDate = new Date(currentYear + 1, endMonth - 1, endDay);
      } else { // January
        startDate = new Date(currentYear - 1, startMonth - 1, startDay);
        endDate = new Date(currentYear, endMonth - 1, endDay);
      }
    }
  }
  
  return today >= startDate && today <= endDate;
};

const getActiveCelebrations = (): Celebration[] => {
  return CELEBRATIONS.filter(isCelebrationActive);
};

// Animation classes for different celebration types
const getAnimationClass = (animation: string, intensity: string) => {
  const baseClasses: Record<string, string> = {
    bounce: 'animate-bounce',
    pulse: 'animate-pulse',
    spin: 'animate-spin',
    float: 'animate-float',
    wiggle: 'animate-wiggle',
    twinkle: 'animate-ping'
  };
  
  const intensityClasses: Record<string, string> = {
    low: 'animation-duration-3000',
    medium: 'animation-duration-2000',
    high: 'animation-duration-1000'
  };
  
  return `${baseClasses[animation] || ''} ${intensityClasses[intensity] || ''}`;
};

// Celebration icon component with enhanced animations
const CelebrationIcon = ({ celebration }: { celebration: Celebration }) => {
  const { id, icon, color, gradient, animation, intensity } = celebration;
  
  // Special Christmas icon with multiple decorations
  if (id === 'christmas') {
    return (
      <div className="absolute -top-4 -right-4">
        {/* Main tree */}
        <div className={`text-3xl ${getAnimationClass(animation, intensity)} relative`}>
          <span className="drop-shadow-[0_0_10px_rgba(220,38,38,0.7)]">🎄</span>
          
          {/* Floating ornaments */}
          <div className="absolute -top-1 -left-2 text-xs animate-bounce animation-delay-100">
            <span className="text-red-400">🔴</span>
          </div>
          <div className="absolute -top-2 -right-1 text-xs animate-bounce animation-delay-300">
            <span className="text-blue-400">🔵</span>
          </div>
          <div className="absolute -bottom-2 left-0 text-xs animate-bounce animation-delay-500">
            <span className="text-yellow-400">🟡</span>
          </div>
          
          {/* Star on top */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-sm animate-spin animation-duration-3000">
            <span className="text-yellow-300">⭐</span>
          </div>
        </div>
        
        {/* Snowflakes */}
        <div className="absolute -top-6 left-2 text-xs animate-float animation-duration-5000">
          <span className="text-blue-200 opacity-70">❄️</span>
        </div>
        <div className="absolute -top-5 right-0 text-xs animate-float animation-duration-4000 animation-delay-1000">
          <span className="text-blue-200 opacity-70">❄️</span>
        </div>
      </div>
    );
  }
  
  // Special New Year icon with fireworks
  if (id === 'new-year') {
    return (
      <div className="absolute -top-4 -right-4">
        {/* Main firework */}
        <div className={`text-3xl ${getAnimationClass('pulse', 'high')} relative`}>
          <span className="drop-shadow-[0_0_10px_rgba(250,204,21,0.7)]">🎆</span>
        </div>
        
        {/* Smaller fireworks around */}
        <div className="absolute -top-2 -left-2 text-sm animate-ping animation-duration-2000">
          <span className="text-purple-400">✨</span>
        </div>
        <div className="absolute -top-1 -right-3 text-sm animate-ping animation-duration-1500 animation-delay-500">
          <span className="text-pink-400">✨</span>
        </div>
        <div className="absolute -bottom-2 left-0 text-sm animate-ping animation-duration-1000 animation-delay-1000">
          <span className="text-blue-400">✨</span>
        </div>
        
        {/* Countdown numbers effect */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold animate-bounce animation-duration-500">
          <span className="bg-gradient-to-r from-purple-500 to-yellow-400 bg-clip-text text-transparent">
            🎉
          </span>
        </div>
      </div>
    );
  }
  
  // Special Eid icon
  if (id === 'eid-fitr' || id === 'eid-adha') {
    return (
      <div className="absolute -top-3 -right-3">
        <div className={`text-2xl ${getAnimationClass(animation, intensity)} relative`}>
          <span className="drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">{icon}</span>
          
          {/* Star effects */}
          <div className="absolute -top-1 -right-1 text-xs animate-pulse">
            <span className="text-yellow-300">✨</span>
          </div>
          <div className="absolute -bottom-1 -left-1 text-xs animate-pulse animation-delay-300">
            <span className="text-yellow-300">✨</span>
          </div>
        </div>
      </div>
    );
  }
  
  // Default celebration icon with effects
  return (
    <div className="absolute -top-3 -right-3">
      <div className={`text-xl ${getAnimationClass(animation, intensity)} relative`}>
        <div className={`rounded-full p-2 bg-gradient-to-br ${gradient} shadow-lg backdrop-blur-sm`}>
          <span className="drop-shadow-md">{icon}</span>
        </div>
        
        {/* Sparkle effect */}
        <div className="absolute -top-1 -right-1">
          <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

// Celebration decorations for the logo
const LogoCelebrationDecorations = ({ celebrations }: { celebrations: Celebration[] }) => {
  const primaryCelebration = celebrations.find(c => 
    c.id === 'christmas' || c.id === 'new-year'
  ) || celebrations[0];
  
  if (!primaryCelebration) return null;
  
  // Special decoration for Christmas
  if (primaryCelebration.id === 'christmas') {
    return (
      <>
        <CelebrationIcon celebration={primaryCelebration} />
        
        {/* Garland around logo */}
        <div className="absolute -inset-1 rounded-xl border-2 border-red-400/30 animate-pulse pointer-events-none">
          <div className="absolute -top-1 left-1/4 w-1 h-1 bg-green-400 rounded-full animate-ping"></div>
          <div className="absolute -top-1 right-1/4 w-1 h-1 bg-red-400 rounded-full animate-ping animation-delay-300"></div>
          <div className="absolute -bottom-1 left-1/3 w-1 h-1 bg-yellow-400 rounded-full animate-ping animation-delay-600"></div>
        </div>
        
        {/* Snow effect */}
        <div className="absolute -inset-2 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i}
              className="absolute text-xs text-blue-100 animate-float"
              style={{
                left: `${20 + i * 30}%`,
                top: `${10 + i * 20}%`,
                animationDelay: `${i * 700}ms`,
                animationDuration: `${3000 + i * 1000}ms`
              }}
            >
              ❄️
            </div>
          ))}
        </div>
      </>
    );
  }
  
  // Special decoration for New Year
  if (primaryCelebration.id === 'new-year') {
    return (
      <>
        <CelebrationIcon celebration={primaryCelebration} />
        
        {/* Confetti effect */}
        <div className="absolute -inset-2 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="absolute text-xs animate-float"
              style={{
                left: `${10 + i * 20}%`,
                top: `${5 + i * 10}%`,
                animationDelay: `${i * 300}ms`,
                animationDuration: `${2000 + i * 500}ms`
              }}
            >
              {['🎉', '✨', '🎊', '🥳', '🎈'][i]}
            </div>
          ))}
        </div>
        
        {/* Glowing border */}
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-purple-500/20 to-yellow-400/20 animate-pulse pointer-events-none"></div>
      </>
    );
  }
  
  // Default decoration for other celebrations
  return (
    <>
      <CelebrationIcon celebration={primaryCelebration} />
      <div className={`absolute -inset-1 rounded-xl bg-gradient-to-r ${primaryCelebration.gradient} opacity-10 animate-pulse pointer-events-none`}></div>
    </>
  );
};

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCelebrations, setActiveCelebrations] = useState<Celebration[]>([]);
  const [showCelebrationHint, setShowCelebrationHint] = useState(false);

  useEffect(() => {
    const celebrations = getActiveCelebrations();
    setActiveCelebrations(celebrations);
    
    if (celebrations.length > 0) {
      setShowCelebrationHint(true);
      const timer = setTimeout(() => {
        setShowCelebrationHint(false);
      }, 8000); // Show for longer
      return () => clearTimeout(timer);
    }
  }, []);

  const primaryCelebration = activeCelebrations.find(c => 
    ['christmas', 'new-year'].includes(c.id)
  ) || activeCelebrations[0];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Enhanced celebration hint banner */}
      {showCelebrationHint && primaryCelebration && (
        <div className={`bg-gradient-to-r ${primaryCelebration.gradient}/20 to-background border-b border-primary/30 relative overflow-hidden`}>
          {/* Animated background particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-current rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 200}ms`,
                  animationDuration: `${2000 + Math.random() * 3000}ms`
                }}
              />
            ))}
          </div>
          
          <div className="container mx-auto px-4 py-2 text-center relative">
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="w-4 h-4 animate-spin animation-duration-2000" />
              <span className="text-sm font-semibold flex items-center gap-2">
                <span className="text-xl animate-bounce">{primaryCelebration.icon}</span>
                <span>Celebrating {primaryCelebration.name}!</span>
                <span className="text-xl animate-bounce animation-delay-300">{primaryCelebration.icon}</span>
              </span>
              <Sparkles className="w-4 h-4 animate-spin animation-duration-2000 animation-delay-1000" />
            </div>
          </div>
        </div>
      )}
      
      {/* Adire accent line with celebration color */}
      <div className={`h-1 bg-gradient-to-r ${primaryCelebration?.gradient || 'from-primary to-accent'} animate-pulse animation-duration-2000`} />
      
      {/* Main navbar */}
      <div className="bg-card/95 backdrop-blur-xl border-b border-border/50 relative">
        {/* Floating celebration particles */}
        {activeCelebrations.length > 0 && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute text-xs animate-float"
                style={{
                  left: `${10 + i * 12}%`,
                  top: '10%',
                  animationDelay: `${i * 400}ms`,
                  animationDuration: `${3000 + i * 500}ms`
                }}
              >
                {primaryCelebration?.icon}
              </div>
            ))}
          </div>
        )}
        
        <div className="container mx-auto px-4 py-4 relative">
          <div className="flex items-center justify-between">
            {/* Logo with enhanced celebration decorations */}
            <Link to="/" className="flex items-center gap-3 group relative">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-2xl ring-2 ring-primary/30 group-hover:ring-primary/50 transition-all duration-300 group-hover:scale-110 relative">
                <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
                
                {/* Celebration decorations */}
                {activeCelebrations.length > 0 && (
                  <LogoCelebrationDecorations celebrations={activeCelebrations} />
                )}
                
                {/* Celebration count badge */}
                {activeCelebrations.length > 1 && (
                  <div className="absolute -bottom-2 -left-2 bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-bounce animation-duration-1500">
                    +{activeCelebrations.length - 1}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col">
                <span className="text-2xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  SteerSolo
                </span>
                
                {/* Celebration indicator in text */}
                {activeCelebrations.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      Celebrating
                    </span>
                    <span className="text-sm font-semibold flex items-center gap-1">
                      {primaryCelebration?.icon}
                      <span className={`text-xs bg-gradient-to-r ${primaryCelebration?.gradient} bg-clip-text text-transparent`}>
                        {primaryCelebration?.name}
                      </span>
                      {activeCelebrations.length > 1 && (
                        <span className="text-xs text-muted-foreground">
                          & {activeCelebrations.length - 1} more
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Celebration details tooltip */}
              {activeCelebrations.length > 0 && (
                <div className="absolute -bottom-10 left-0 bg-background/95 backdrop-blur-sm border border-border rounded-xl p-3 shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 min-w-[200px]">
                  <div className="text-xs font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    Active Celebrations
                  </div>
                  <div className="space-y-2">
                    {activeCelebrations.map(celebration => (
                      <div key={celebration.id} className="flex items-center gap-2">
                        <div className={`text-lg ${getAnimationClass(celebration.animation, celebration.intensity)}`}>
                          {celebration.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-medium">{celebration.name}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {celebration.startDate} - {celebration.endDate}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                <Button size="sm" className="relative overflow-hidden bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity font-medium shadow-lg shadow-primary/20 group">
                  <span className="relative z-10">Get Started</span>
                  
                  {/* Celebration sparkle effect on button */}
                  {activeCelebrations.length > 0 && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <Sparkles className="absolute -right-2 -top-2 w-4 h-4 text-yellow-300 animate-pulse" />
                    </>
                  )}
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button with celebration indicator */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors relative group"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {activeCelebrations.length > 0 && (
                <>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full animate-ping"></div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full"></div>
                </>
              )}
              
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <>
                  <Menu className="w-6 h-6" />
                  {/* Celebration indicator dots */}
                  {activeCelebrations.length > 0 && (
                    <div className="absolute -bottom-1 inset-x-0 flex justify-center gap-1">
                      {[...Array(Math.min(activeCelebrations.length, 3))].map((_, i) => (
                        <div 
                          key={i}
                          className="w-1 h-1 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse"
                          style={{ animationDelay: `${i * 200}ms` }}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      <div 
        className={`md:hidden bg-card/98 backdrop-blur-xl border-b border-border overflow-hidden transition-all duration-500 ${
          isMobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="container mx-auto px-4 py-4 space-y-4">
          {/* Active celebrations section */}
          {activeCelebrations.length > 0 && (
            <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-semibold">Active Celebrations</span>
                </div>
                <div className="flex gap-1">
                  {activeCelebrations.map((celebration, i) => (
                    <div 
                      key={celebration.id}
                      className={`text-lg ${getAnimationClass(celebration.animation, celebration.intensity)}`}
                      style={{ animationDelay: `${i * 200}ms` }}
                    >
                      {celebration.icon}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                {activeCelebrations.map(celebration => (
                  <div key={celebration.id} className="flex items-center gap-3 p-2 rounded-lg bg-background/50">
                    <div className={`text-2xl ${getAnimationClass(celebration.animation, celebration.intensity)}`}>
                      {celebration.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{celebration.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {celebration.type.charAt(0).toUpperCase() + celebration.type.slice(1)} Celebration
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Navigation Links */}
          <div className="space-y-1">
            <Link 
              to="/shops" 
              className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors font-medium group"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <span>Explore Shops</span>
            </Link>
            
            <Link 
              to="/about" 
              className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors font-medium group"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
                <Star className="w-4 h-4" />
              </div>
              <span>About</span>
            </Link>
            
            <Link 
              to="/feedback" 
              className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors font-medium group"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
                <Heart className="w-4 h-4" />
              </div>
              <span>Feedback</span>
            </Link>
          </div>
          
          {/* Auth Buttons */}
          <div className="pt-4 border-t border-border space-y-3">
            <Link to="/auth/login" className="block" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full border-primary/30 hover:bg-primary/10 group">
                <User className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Login
              </Button>
            </Link>
            <Link to="/auth/login?tab=signup" className="block" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full relative overflow-hidden bg-gradient-to-r from-primary to-accent hover:opacity-90 group">
                <span className="relative z-10">Get Started</span>
                {activeCelebrations.length > 0 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;