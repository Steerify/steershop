import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, ShieldAlert, Award, Crown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const TIER_CONFIG: Record<string, {
  label: string;
  icon: React.ElementType;
  className: string;
  description: string;
}> = {
  listed: {
    label: 'Listed',
    icon: Shield,
    className: 'bg-muted text-muted-foreground border-border',
    description: 'This shop is listed on SteerSolo',
  },
  checked: {
    label: 'Checked',
    icon: ShieldAlert,
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    description: '3+ orders completed, 7+ days active',
  },
  trusted: {
    label: 'Trusted',
    icon: ShieldCheck,
    className: 'bg-accent/10 text-accent-foreground border-accent/20',
    description: '10+ orders, 3.5+ rating, 30+ days active',
  },
  verified: {
    label: 'Verified',
    icon: Award,
    className: 'bg-primary/10 text-primary border-primary/20',
    description: 'Bank-verified, 25+ orders, 4.0+ rating',
  },
  approved: {
    label: 'SafeBeauty Approved',
    icon: Crown,
    className: 'bg-accent/15 text-accent-foreground border-accent/30 font-semibold',
    description: 'Top-tier vendor: verified, 50+ orders, 4.5+ rating, NAFDAC compliant products',
  },
};

interface SafeBeautyBadgeProps {
  tier: string;
  showTooltip?: boolean;
  size?: 'sm' | 'md';
}

export const SafeBeautyBadge = ({ tier, showTooltip = true, size = 'sm' }: SafeBeautyBadgeProps) => {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.listed;
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  const badge = (
    <Badge variant="outline" className={`${textSize} ${config.className} gap-1`}>
      <Icon className={iconSize} />
      {config.label}
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-48">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const SAFEBEAUTY_TIERS = ['listed', 'checked', 'trusted', 'verified', 'approved'] as const;
export type SafeBeautyTier = typeof SAFEBEAUTY_TIERS[number];
