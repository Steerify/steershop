import { Badge } from "@/components/ui/badge";
import { CheckCircle, Shield, MessageCircle, Star, Zap, Award } from "lucide-react";
import { SafeBeautyBadge } from "./SafeBeautyBadge";

interface TrustBadgesProps {
  isVerified?: boolean;
  hasWhatsApp?: boolean;
  totalReviews?: number;
  averageRating?: number;
  responseTime?: string;
  completedOrders?: number;
  tier?: string;
}

export const TrustBadges = ({
  isVerified = false,
  hasWhatsApp = false,
  totalReviews = 0,
  averageRating = 0,
  responseTime,
  completedOrders = 0,
  tier,
}: TrustBadgesProps) => {
  const badges = [];

  if (isVerified && !tier) {
    badges.push({
      icon: <Shield className="w-3 h-3" />,
      label: "Verified Seller",
      className: "bg-primary/10 text-primary border-primary/20",
    });
  }

  if (hasWhatsApp) {
    badges.push({
      icon: <MessageCircle className="w-3 h-3" />,
      label: "Quick Response",
      className: "bg-accent/10 text-accent border-accent/20",
    });
  }

  if (averageRating >= 4.5 && totalReviews >= 5) {
    badges.push({
      icon: <Star className="w-3 h-3 fill-current" />,
      label: "Top Rated",
      className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    });
  } else if (averageRating >= 4.0 && totalReviews >= 3) {
    badges.push({
      icon: <Star className="w-3 h-3" />,
      label: "Highly Rated",
      className: "bg-yellow-600/10 text-yellow-700 border-yellow-600/20",
    });
  }

  if (completedOrders >= 50) {
    badges.push({
      icon: <Award className="w-3 h-3" />,
      label: "Trusted Seller",
      className: "bg-accent/20 text-accent border-accent/30",
    });
  } else if (completedOrders >= 10) {
    badges.push({
      icon: <CheckCircle className="w-3 h-3" />,
      label: "Established",
      className: "bg-primary/10 text-primary border-primary/20",
    });
  }

  if (responseTime) {
    badges.push({
      icon: <Zap className="w-3 h-3" />,
      label: `Replies ${responseTime}`,
      className: "bg-accent/10 text-accent border-accent/20",
    });
  }

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tier && <SafeBeautyBadge tier={tier} size="sm" />}
      {badges.map((badge, index) => (
        <Badge
          key={index}
          variant="outline"
          className={`text-xs ${badge.className}`}
        >
          {badge.icon}
          <span className="ml-1">{badge.label}</span>
        </Badge>
      ))}
    </div>
  );
};
