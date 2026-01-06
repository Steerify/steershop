import { Trophy, Package, Zap, Award, Crown, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface BadgeData {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_name: string;
  color: string;
  requirement_type?: string;
  requirement_value?: number;
  earned_at?: string;
}

interface BadgeDisplayProps {
  badges: BadgeData[];
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Trophy,
  Package,
  Zap,
  Award,
  Crown,
  Flame,
};

const colorMap: Record<string, string> = {
  amber: 'from-amber-400 to-amber-600 text-amber-950',
  blue: 'from-blue-400 to-blue-600 text-blue-950',
  purple: 'from-purple-400 to-purple-600 text-purple-950',
  green: 'from-green-400 to-green-600 text-green-950',
  orange: 'from-orange-400 to-orange-600 text-orange-950',
  red: 'from-red-400 to-red-600 text-red-950',
  gold: 'from-yellow-400 to-yellow-600 text-yellow-950',
};

const sizeMap = {
  sm: { container: 'w-8 h-8', icon: 'w-4 h-4' },
  md: { container: 'w-10 h-10', icon: 'w-5 h-5' },
  lg: { container: 'w-14 h-14', icon: 'w-7 h-7' },
};

export const BadgeDisplay = ({ badges, size = 'md', showTooltip = true, className }: BadgeDisplayProps) => {
  if (badges.length === 0) {
    return null;
  }

  const renderBadge = (badge: BadgeData) => {
    const IconComponent = iconMap[badge.icon_name] || Trophy;
    const colorClass = colorMap[badge.color] || colorMap.gold;
    const sizeClass = sizeMap[size];

    const badgeElement = (
      <div
        key={badge.id}
        className={cn(
          "rounded-full flex items-center justify-center bg-gradient-to-br shadow-lg ring-2 ring-white/20 transition-transform hover:scale-110",
          colorClass,
          sizeClass.container
        )}
      >
        <IconComponent className={sizeClass.icon} />
      </div>
    );

    if (showTooltip) {
      return (
        <Tooltip key={badge.id}>
          <TooltipTrigger asChild>
            {badgeElement}
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[200px]">
            <div className="text-center">
              <p className="font-semibold">{badge.name}</p>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    }

    return badgeElement;
  };

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {badges.map(renderBadge)}
    </div>
  );
};

interface BadgeProgressProps {
  allBadges: BadgeData[];
  earnedBadges: BadgeData[];
  currentValue: number;
  requirementType: 'sales' | 'products' | 'orders';
}

export const BadgeProgress = ({ allBadges, earnedBadges, currentValue, requirementType }: BadgeProgressProps) => {
  const relevantBadges = allBadges.filter(b => b.requirement_type === requirementType);
  const earnedIds = new Set(earnedBadges.map(b => b.id));
  
  // Find next badge to earn
  const nextBadge = relevantBadges.find(b => !earnedIds.has(b.id));
  
  if (!nextBadge) {
    return (
      <div className="text-sm text-muted-foreground text-center py-2">
        🎉 You've earned all {requirementType} badges!
      </div>
    );
  }

  const progress = Math.min((currentValue / (nextBadge as any).requirement_value) * 100, 100);
  const remaining = (nextBadge as any).requirement_value - currentValue;

  const IconComponent = iconMap[nextBadge.icon_name] || Trophy;
  const colorClass = colorMap[nextBadge.color] || colorMap.gold;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br opacity-50",
            colorClass
          )}>
            <IconComponent className="w-3 h-3" />
          </div>
          <span className="text-muted-foreground">Next: {nextBadge.name}</span>
        </div>
        <span className="font-medium">{currentValue}/{(nextBadge as any).requirement_value}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn("h-full bg-gradient-to-r transition-all duration-500", colorClass.replace('text-', 'from-').split(' ')[0])}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {remaining > 0 ? `${remaining} more ${requirementType} to unlock!` : 'Almost there!'}
      </p>
    </div>
  );
};
