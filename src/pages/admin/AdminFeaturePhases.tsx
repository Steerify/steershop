import { AdminLayout } from "@/components/AdminLayout";
import { useFeaturePhases } from "@/hooks/useFeaturePhases";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, Unlock, Rocket, Store, Search, ShieldCheck, BarChart3 } from "lucide-react";
import { toast } from "sonner";

const PHASE_ICONS = [Store, Search, ShieldCheck, BarChart3];
const PHASE_COLORS = [
  "bg-primary/10 text-primary border-primary/20",
  "bg-accent/10 text-accent border-accent/20",
  "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  "bg-amber-500/10 text-amber-600 border-amber-500/20",
];

const AdminFeaturePhases = () => {
  const { phases, isLoading, togglePhase } = useFeaturePhases();

  const handleToggle = (key: string, currentEnabled: boolean) => {
    if (key === "feature_phase_1") {
      toast.error("Phase 1 (Core) cannot be disabled — it's the foundation.");
      return;
    }
    togglePhase.mutate(
      { key, enabled: !currentEnabled },
      {
        onSuccess: () => toast.success(`Phase ${!currentEnabled ? "enabled" : "disabled"} successfully`),
        onError: () => toast.error("Failed to toggle phase"),
      }
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="w-6 h-6 text-primary" />
            Feature Phases
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Control which features are available to users. Enable phases progressively as you scale.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {phases.map((phase, index) => {
              const Icon = PHASE_ICONS[index] || Store;
              const colorClass = PHASE_COLORS[index] || PHASE_COLORS[0];
              const phaseNumber = index + 1;

              return (
                <Card
                  key={phase.key}
                  className={`relative overflow-hidden transition-all ${
                    phase.enabled ? "border-primary/30 shadow-sm" : "opacity-75"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            Phase {phaseNumber}: {phase.label}
                            {phase.enabled ? (
                              <Unlock className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                          </CardTitle>
                          <CardDescription className="text-xs mt-0.5">
                            {phase.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Switch
                        checked={phase.enabled}
                        onCheckedChange={() => handleToggle(phase.key, phase.enabled)}
                        disabled={phase.key === "feature_phase_1" || togglePhase.isPending}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {phase.features.map((feature) => (
                        <Badge
                          key={feature}
                          variant={phase.enabled ? "secondary" : "outline"}
                          className="text-xs"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminFeaturePhases;
