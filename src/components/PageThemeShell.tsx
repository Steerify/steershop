import { ReactNode } from "react";
import { AdirePattern } from "@/components/patterns/AdirePattern";
import { cn } from "@/lib/utils";

export type ThemeSurface = "primary" | "accent" | "neutral";

export const themeSurfaceClass: Record<ThemeSurface, string> = {
  primary: "theme-surface-primary",
  accent: "theme-surface-accent",
  neutral: "theme-surface-neutral",
};

export const themeCtaClass: Record<"primary" | "accent" | "ghost", string> = {
  primary: "theme-cta theme-cta-primary",
  accent: "theme-cta theme-cta-accent",
  ghost: "theme-cta theme-cta-ghost",
};

export const themeCardClass = "theme-card";

interface PageThemeShellProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

interface ThemeHeadingProps {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

interface PageThemeSectionProps {
  children: ReactNode;
  className?: string;
  surface?: ThemeSurface;
  spacing?: "default" | "compact";
}

export const PageThemeShell = ({ children, header, footer, className }: PageThemeShellProps) => (
  <div className={cn("min-h-screen theme-page-shell relative overflow-x-hidden", className)}>
    <AdirePattern variant="dots" className="fixed inset-0 opacity-[0.05] pointer-events-none" />
    <div className="theme-bg-layer theme-bg-layer-primary" />
    <div className="theme-bg-layer theme-bg-layer-accent" />

    <div className="relative z-10 flex min-h-screen flex-col">
      {header}
      <div className="flex-1">{children}</div>
      {footer}
    </div>
  </div>
);

export const ThemeHeading = ({
  title,
  description,
  eyebrow,
  align = "center",
  className,
}: ThemeHeadingProps) => (
  <div className={cn("theme-heading", align === "left" ? "text-left" : "text-center", className)}>
    {eyebrow ? <div className="theme-eyebrow">{eyebrow}</div> : null}
    <h1 className="theme-title">{title}</h1>
    {description ? <p className="theme-description">{description}</p> : null}
  </div>
);

export const PageThemeSection = ({
  children,
  className,
  surface = "neutral",
  spacing = "default",
}: PageThemeSectionProps) => (
  <section
    className={cn(
      "theme-section",
      spacing === "compact" ? "py-8 sm:py-10" : "py-12 sm:py-16",
      themeSurfaceClass[surface],
      className,
    )}
  >
    {children}
  </section>
);
