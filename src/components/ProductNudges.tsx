import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, X, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

const nudges = [
  "Before you sell today, share your link.",
  "Serious sellers prepare first.",
  "Your store is open 24/7.",
  "Structure beats stress.",
  "Clear visuals increase trust.",
  "Identity shift starts with one link.",
  "Stop explaining prices, send your link."
];

export const ProductNudges = () => {
  const [nudgeIndex, setNudgeIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Choose nudge based on day of month to make it feel persistent for a day
    const day = new Date().getDate();
    setNudgeIndex(day % nudges.length);
  }, []);

  if (!isVisible) return null;

  return (
    <Card className="border-none shadow-sm bg-gradient-to-r from-primary/10 via-accent/5 to-gold/5 rounded-2xl overflow-hidden group">
      <CardContent className="p-3 sm:p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
            <Sparkles className="w-5 h-5 animate-pulse text-gold" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
              <Lightbulb className="w-3 h-3" /> Daily Nudge
            </p>
            <p className="text-sm font-semibold text-foreground leading-tight">
              {nudges[nudgeIndex]}
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsVisible(false)}
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </Button>
      </CardContent>
    </Card>
  );
};
