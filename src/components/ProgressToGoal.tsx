import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";

interface ProgressToGoalProps {
  current: number;
  goal: number;
  label: string;
  unit?: string;
  showPercentage?: boolean;
  colorClass?: string;
}

export const ProgressToGoal = ({
  current,
  goal,
  label,
  unit = "",
  showPercentage = true,
  colorClass = "bg-primary",
}: ProgressToGoalProps) => {
  const percentage = Math.min((current / goal) * 100, 100);
  const isComplete = current >= goal;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium flex items-center gap-1">
          {isComplete ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-600">Complete!</span>
            </>
          ) : (
            <>
              {current}/{goal} {unit}
              {showPercentage && (
                <span className="text-muted-foreground ml-1">({percentage.toFixed(0)}%)</span>
              )}
            </>
          )}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
      {!isComplete && percentage >= 75 && (
        <p className="text-xs text-primary animate-pulse">
          Almost there! Just {goal - current} {unit} to go! 🔥
        </p>
      )}
    </div>
  );
};

interface ProfileCompletionProps {
  completedSteps: string[];
  allSteps: string[];
}

export const ProfileCompletion = ({ completedSteps, allSteps }: ProfileCompletionProps) => {
  const percentage = (completedSteps.length / allSteps.length) * 100;

  return (
    <div className="space-y-3">
      <ProgressToGoal
        current={completedSteps.length}
        goal={allSteps.length}
        label="Profile Completion"
        unit="steps"
      />
      
      <div className="flex flex-wrap gap-2">
        {allSteps.map((step) => (
          <span
            key={step}
            className={`text-xs px-2 py-1 rounded-full ${
              completedSteps.includes(step)
                ? 'bg-green-500/10 text-green-600'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {completedSteps.includes(step) && '✓ '}{step}
          </span>
        ))}
      </div>
    </div>
  );
};
