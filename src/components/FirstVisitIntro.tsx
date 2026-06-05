import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface FirstVisitIntroProps {
  /** Unique key per page — used for localStorage so it only shows once */
  storageKey: string;
  title: string;
  description: string;
  bullets?: string[];
  ctaLabel?: string;
}

/**
 * Shows a one-time branded popup the first time a user visits a major page.
 * Dismissal is persisted to localStorage; never shows again on the same device.
 */
export const FirstVisitIntro = ({
  storageKey,
  title,
  description,
  bullets = [],
  ctaLabel = "Got it",
}: FirstVisitIntroProps) => {
  const [open, setOpen] = useState(false);
  const key = `intro_seen_${storageKey}`;

  useEffect(() => {
    try {
      if (!localStorage.getItem(key)) {
        // Slight delay so the page paints first
        const t = setTimeout(() => setOpen(true), 600);
        return () => clearTimeout(t);
      }
    } catch {
      /* localStorage unavailable — silently skip */
    }
  }, [key]);

  const dismiss = () => {
    try {
      localStorage.setItem(key, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) dismiss();
      }}
    >
      <DialogContent className="sm:max-w-md rounded-3xl border-border/60">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-extrabold tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="text-[15px] leading-relaxed text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        {bullets.length > 0 && (
          <ul className="space-y-2 text-sm text-foreground/90 mt-2">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}

        <DialogFooter className="mt-4">
          <Button
            onClick={dismiss}
            className="w-full rounded-full font-semibold"
          >
            {ctaLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
