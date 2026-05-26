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
    label: 'SteerSolo Safe Listed',
    icon: Shield,
    className: 'bg-white/5 text-white/70 border-white/10',
    description: 'Merchant verified, store live. Entry-level trust signal for new buyers.',
  },
  checked: {
    label: 'SteerSolo Safe Checked',
    icon: ShieldAlert,
    className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    description: 'At least one product batch confirmed genuine through our process.',
  },
  trusted: {
    label: 'SteerSolo Safe Trusted',
    icon: ShieldCheck,
    className: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    description: '30+ days active, real buyer reviews, zero unresolved complaints.',
  },
  verified: {
    label: 'SteerSolo Safe Verified',
    icon: Award,
    className: 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30 font-bold',
    description: 'Full identity check — the highest trust signal on the platform.',
  },
  approved: {
    label: 'SteerSolo Safe Premium',
    icon: Crown,
    className: 'bg-amber-500/20 text-amber-500 border-amber-500/30 font-bold',
    description: 'Top-tier merchant: fully verified with exceptional track record and compliance.',
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
