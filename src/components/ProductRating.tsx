import { Star } from "lucide-react";

interface ProductRatingProps {
  rating: number;
  totalReviews?: number;
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
}

export const ProductRating = ({ 
  rating, 
  totalReviews = 0, 
  showCount = true,
  size = "sm" 
}: ProductRatingProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
      {showCount && (
        <span className={`${textSizeClasses[size]} text-muted-foreground`}>
          ({totalReviews})
        </span>
      )}
    </div>
  );
};
