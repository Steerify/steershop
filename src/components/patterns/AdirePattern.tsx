import { cn } from "@/lib/utils";

interface AdirePatternProps {
  variant?: "dots" | "circles" | "lines" | "geometric" | "dense";
  className?: string;
  opacity?: number;
}

export const AdirePattern = ({ 
  variant = "dots", 
  className,
  opacity = 1 
}: AdirePatternProps) => {
  const patterns = {
    dots: (
      <pattern id="adire-dots" width="30" height="30" patternUnits="userSpaceOnUse">
        <circle cx="7" cy="7" r="2" fill="currentColor" opacity="0.08" />
        <circle cx="22" cy="22" r="2" fill="currentColor" opacity="0.05" />
      </pattern>
    ),
    circles: (
      <pattern id="adire-circles" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="20" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.06" />
        <circle cx="20" cy="20" r="3" fill="currentColor" opacity="0.04" />
      </pattern>
    ),
    lines: (
      <pattern id="adire-lines" width="20" height="20" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="20" y2="20" stroke="currentColor" strokeWidth="0.5" opacity="0.05" />
        <line x1="20" y1="0" x2="0" y2="20" stroke="currentColor" strokeWidth="0.5" opacity="0.05" />
      </pattern>
    ),
    geometric: (
      <pattern id="adire-geometric" width="50" height="50" patternUnits="userSpaceOnUse">
        <rect x="10" y="10" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.06" transform="rotate(45 15 15)" />
        <circle cx="35" cy="35" r="5" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.05" />
        <circle cx="35" cy="35" r="2" fill="currentColor" opacity="0.04" />
      </pattern>
    ),
    dense: (
      <pattern id="adire-dense" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="5" cy="5" r="1.5" fill="currentColor" opacity="0.08" />
        <circle cx="15" cy="15" r="1.5" fill="currentColor" opacity="0.06" />
        <circle cx="10" cy="10" r="1" fill="currentColor" opacity="0.04" />
      </pattern>
    ),
  };

  const patternId = `adire-${variant}`;

  return (
    <svg 
      className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}
      style={{ opacity }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>{patterns[variant]}</defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
};

export const AdireDivider = ({ className }: { className?: string }) => (
  <div className={cn("relative h-4 overflow-hidden", className)}>
    <svg className="w-full h-full text-primary" preserveAspectRatio="none" viewBox="0 0 100 10">
      <defs>
        <pattern id="divider-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="1.5" fill="currentColor" opacity="0.3" />
        </pattern>
      </defs>
      <rect width="100" height="10" fill="url(#divider-pattern)" />
    </svg>
  </div>
);

export const AdireAccent = ({ className }: { className?: string }) => (
  <div className={cn("h-1 rounded-full bg-gradient-to-r from-primary via-accent to-gold", className)} />
);
