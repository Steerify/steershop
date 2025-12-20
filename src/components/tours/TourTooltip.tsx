import { TooltipRenderProps } from "react-joyride";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, ArrowRight, Check } from "lucide-react";

export const TourTooltip = ({
  continuous,
  index,
  step,
  size,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps,
  isLastStep
}: TooltipRenderProps) => {
  return (
    <div
      {...tooltipProps}
      className="bg-card border border-primary/20 rounded-xl shadow-xl max-w-sm p-0 overflow-hidden"
    >
      {/* Header gradient bar */}
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
      
      <div className="p-4">
        {/* Close button */}
        <button
          {...closeProps}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: size }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === index 
                  ? "w-6 bg-primary" 
                  : i < index 
                    ? "w-2 bg-primary/40" 
                    : "w-2 bg-muted"
              }`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-2">
            {index + 1} of {size}
          </span>
        </div>

        {/* Title */}
        {step.title && (
          <h3 className="text-lg font-heading font-bold text-foreground mb-2">
            {step.title}
          </h3>
        )}

        {/* Content */}
        <div className="text-sm text-muted-foreground leading-relaxed">
          {step.content}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            {...skipProps}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip Tour
          </Button>

          <div className="flex items-center gap-2">
            {index > 0 && (
              <Button
                variant="outline"
                size="sm"
                {...backProps}
                className="gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                Back
              </Button>
            )}
            
            <Button
              size="sm"
              {...primaryProps}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 gap-1"
            >
              {isLastStep ? (
                <>
                  <Check className="w-3 h-3" />
                  Finish
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-3 h-3" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
