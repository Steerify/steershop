import { Button } from "@/components/ui/button";
import { HelpCircle, RotateCcw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TourButtonProps {
  onStartTour: () => void;
  hasSeenTour: boolean;
  onResetTour?: () => void;
  className?: string;
}

export const TourButton = ({ onStartTour, hasSeenTour, onResetTour, className }: TourButtonProps) => {
  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-2 w-full", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={onStartTour}
              className="w-full h-11 sm:h-10 gap-2 rounded-xl border-primary/30 bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5 text-foreground hover:border-primary/50 hover:shadow-md hover:shadow-primary/20 hover:-translate-y-0.5 transition-all"
            >
              <HelpCircle className="w-4 h-4" />
              {hasSeenTour ? "Help Tour" : "Take Tour"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{hasSeenTour ? "Retake the guided tour" : "Take a guided tour of this page"}</p>
          </TooltipContent>
        </Tooltip>

        {hasSeenTour && onResetTour && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onResetTour}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset tour progress</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};
