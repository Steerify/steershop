import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Star, Sparkles, X } from "lucide-react";

interface OrderItem {
  id: string;
  product_id: string;
  products?: {
    id: string;
    name: string;
    image_url: string | null;
  };
}

interface OrderReviewPromptProps {
  orderId: string;
  orderItems: OrderItem[];
  onReviewsSubmitted?: () => void;
}

export const OrderReviewPrompt = ({ orderId, orderItems, onReviewsSubmitted }: OrderReviewPromptProps) => {
  const { toast } = useToast();
  const [unreviewedItems, setUnreviewedItems] = useState<OrderItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<OrderItem | null>(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkUnreviewedProducts();
  }, [orderItems]);

  const checkUnreviewedProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const productIds = orderItems
        .filter(item => item.product_id && item.products)
        .map(item => item.product_id);

      if (productIds.length === 0) return;

      // Check which products have already been reviewed
      const { data: existingReviews } = await supabase
        .from("product_reviews")
        .select("product_id")
        .eq("customer_id", user.id)
        .eq("order_id", orderId)
        .in("product_id", productIds);

      const reviewedProductIds = new Set(existingReviews?.map(r => r.product_id) || []);
      
      const unreviewed = orderItems.filter(
        item => item.product_id && item.products && !reviewedProductIds.has(item.product_id)
      );

      setUnreviewedItems(unreviewed);
    } catch (error) {
      console.error("Error checking reviews:", error);
    }
  };

  const handleOpenReview = (item: OrderItem) => {
    setCurrentItem(item);
    setRating(0);
    setComment("");
    setIsOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!currentItem || rating === 0) {
      toast({
        title: "Please select a rating",
        description: "Choose at least 1 star",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please login to submit a review");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const { error } = await supabase
        .from("product_reviews")
        .insert({
          product_id: currentItem.product_id,
          customer_id: user.id,
          customer_name: profile?.full_name || "Customer",
          order_id: orderId,
          rating,
          comment: comment.trim() || null,
        });

      if (error) throw error;

      toast({
        title: "Review Submitted! 🎉",
        description: "Thank you for your feedback!",
      });

      setIsOpen(false);
      setCurrentItem(null);
      setRating(0);
      setComment("");
      
      // Refresh the unreviewed items list
      checkUnreviewedProducts();
      onReviewsSubmitted?.();
    } catch (error: any) {
      toast({
        title: "Failed to submit review",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (unreviewedItems.length === 0) return null;

  return (
    <>
      {/* Review Prompt Banner */}
      <Card className="border-accent/50 bg-gradient-to-r from-accent/10 via-primary/5 to-accent/10 mb-4 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold/60 flex items-center justify-center flex-shrink-0 animate-pulse-soft">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1 flex items-center gap-2">
                <Star className="w-4 h-4 text-gold fill-gold" />
                How was your order?
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                You have {unreviewedItems.length} product{unreviewedItems.length > 1 ? "s" : ""} to review. 
                Help other shoppers by sharing your experience!
              </p>
              <div className="flex flex-wrap gap-2">
                {unreviewedItems.slice(0, 3).map((item) => (
                  <Button
                    key={item.id}
                    size="sm"
                    variant="outline"
                    className="bg-background hover:bg-accent hover:text-accent-foreground border-accent/30"
                    onClick={() => handleOpenReview(item)}
                  >
                    <Star className="w-3 h-3 mr-1" />
                    Rate {item.products?.name?.slice(0, 15)}{(item.products?.name?.length || 0) > 15 ? "..." : ""}
                  </Button>
                ))}
                {unreviewedItems.length > 3 && (
                  <Button size="sm" variant="ghost" className="text-accent">
                    +{unreviewedItems.length - 3} more
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-gold fill-gold" />
              Rate Your Purchase
            </DialogTitle>
            <DialogDescription>
              Share your experience with {currentItem?.products?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Product Preview */}
            {currentItem?.products && (
              <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                {currentItem.products.image_url ? (
                  <img
                    src={currentItem.products.image_url}
                    alt={currentItem.products.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Star className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h4 className="font-medium">{currentItem.products.name}</h4>
                </div>
              </div>
            )}

            {/* Star Rating */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">Tap a star to rate</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${
                        star <= (hoveredRating || rating)
                          ? "fill-gold text-gold"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm mt-2 text-accent font-medium">
                  {rating === 5 && "Excellent! 🎉"}
                  {rating === 4 && "Great! 👍"}
                  {rating === 3 && "Good 👌"}
                  {rating === 2 && "Fair 😐"}
                  {rating === 1 && "Poor 😔"}
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <Textarea
                placeholder="Tell us more about your experience (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsOpen(false)}
              >
                Skip
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-accent to-primary hover:opacity-90"
                onClick={handleSubmitReview}
                disabled={rating === 0 || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};