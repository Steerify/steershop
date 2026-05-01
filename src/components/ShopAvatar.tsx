import React from "react";
import { cn } from "@/lib/utils";

interface ShopAvatarProps {
  name: string;
  logoUrl?: string | null;
  className?: string;
  initialsClassName?: string;
}

export const ShopAvatar = ({ name, logoUrl, className, initialsClassName }: ShopAvatarProps) => {
  const getInitials = (shopName: string) => {
    if (!shopName) return "?";
    const parts = shopName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (logoUrl) {
    return (
      <div className={cn("relative overflow-hidden bg-muted", className)}>
        <img
          src={logoUrl}
          alt={name}
          className="w-full h-full object-cover select-none"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center bg-gradient-to-br from-primary to-accent text-white font-bold select-none",
        className
      )}
    >
      <span className={cn("text-xl md:text-2xl", initialsClassName)}>
        {getInitials(name)}
      </span>
    </div>
  );
};
