import { AdirePattern } from "@/components/patterns/AdirePattern";
import { cn } from "@/lib/utils";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  patternVariant?: "dots" | "circles" | "lines" | "geometric" | "dense" | "waves";
  patternOpacity?: number;
}

export const PageWrapper = ({ 
  children, 
  className,
  patternVariant = "dots",
  patternOpacity = 0.5
}: PageWrapperProps) => (
  <div className={cn("min-h-screen bg-background relative", className)}>
    <AdirePattern 
      variant={patternVariant} 
      className="fixed inset-0 pointer-events-none z-0" 
      opacity={patternOpacity} 
    />
    <div className="relative z-10">
      {children}
    </div>
  </div>
);
