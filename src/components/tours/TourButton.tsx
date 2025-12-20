import { Button } from "@/components/ui/button";
import { HelpCircle, RotateCcw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TourButtonProps {
  onStartTour: () => void;
  hasSeenTour: boolean;
  onResetTour?: () => void;
}

export const TourButton = ({ onStartTour, hasSeenTour, onResetTour }: TourButtonProps) => {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={onStartTour}
              className="gap-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
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
