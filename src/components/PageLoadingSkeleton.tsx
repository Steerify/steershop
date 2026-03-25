import logoLight from "@/assets/steersolo-logo.jpg";
import logoDark from "@/assets/steersolo-logo-dark.jpg";
import { useTheme } from "next-themes";

export const PageLoadingSkeleton = () => {
  const { theme } = useTheme();
  const logo = theme === 'dark' ? logoDark : logoLight;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="flex flex-col items-center gap-5">
        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg ring-2 ring-primary/20 animate-pulse">
          <img src={logo} alt="SteerSolo" className="w-full h-full object-cover" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-muted-foreground text-sm font-medium tracking-wide">Your Daily Selling System</p>
      </div>
    </div>
  );
};
