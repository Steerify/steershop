import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { storeFollowService } from "@/services/storeFollow.service";
import { useToast } from "@/hooks/use-toast";
import { LoginToastAction } from "./LoginToastAction";

interface StoreFollowButtonProps {
  shopId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const StoreFollowButton = ({
  shopId,
  size = "md",
  className = "",
}: StoreFollowButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      storeFollowService.isFollowing(shopId).then(setIsFollowing);
    }
  }, [shopId, user]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to follow stores",
        variant: "destructive",
        action: <LoginToastAction />,
      });
      return;
    }

    setIsLoading(true);
    // Optimistic update
    setIsFollowing(!isFollowing);

    try {
      const added = await storeFollowService.toggle(shopId);
      setIsFollowing(added);
      toast({
        title: added ? "Following Store 💕" : "Unfollowed Store",
        description: added
          ? "You'll now see updates from this store"
          : "You've unfollowed this store",
      });
    } catch (error: any) {
      setIsFollowing(isFollowing); // Revert
      toast({
        title: "Error",
        description: error.message || "Failed to update follow status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const buttonSize = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-base",
    lg: "h-12 px-6 text-lg",
  }[size];

  return (
    <Button
      variant="outline"
      size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
      onClick={handleToggle}
      disabled={isLoading}
      className={`${buttonSize} rounded-full transition-all ${
        isFollowing
          ? "bg-accent text-primary border-accent hover:bg-accent/90"
          : "hover:bg-primary/10"
      } ${className}`}
      aria-label={isFollowing ? "Unfollow store" : "Follow store"}
    >
      <Heart className={`w-4 h-4 mr-1 ${isFollowing ? "fill-primary" : ""}`} />
      {isFollowing ? "Following" : "Follow Store"}
    </Button>
  );
};
