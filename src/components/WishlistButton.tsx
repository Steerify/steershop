import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { wishlistService } from "@/services/wishlist.service";
import { useToast } from "@/hooks/use-toast";

interface WishlistButtonProps {
  productId: string;
  size?: "sm" | "icon";
  className?: string;
}

export const WishlistButton = ({ productId, size = "icon", className = "" }: WishlistButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      wishlistService.isInWishlist(productId).then(setIsWishlisted);
    }
  }, [productId, user]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to save products to your wishlist",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // Optimistic update
    setIsWishlisted(!isWishlisted);

    try {
      const added = await wishlistService.toggle(productId);
      setIsWishlisted(added);
      toast({
        title: added ? "Added to Wishlist ❤️" : "Removed from Wishlist",
        description: added ? "Product saved to your wishlist" : "Product removed from wishlist",
      });
    } catch (error: any) {
      setIsWishlisted(isWishlisted); // Revert
      toast({
        title: "Error",
        description: error.message || "Failed to update wishlist",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleToggle}
      disabled={isLoading}
      className={`${isWishlisted ? "text-red-500 border-red-500/30 hover:bg-red-500/10" : "hover:text-red-500 hover:border-red-500/30"} ${className}`}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500" : ""}`} />
    </Button>
  );
};
