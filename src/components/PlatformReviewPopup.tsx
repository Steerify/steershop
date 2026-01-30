import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, X, Sparkles, Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PlatformReviewPopupProps {
  onClose?: () => void;
}

export const PlatformReviewPopup = ({ onClose }: PlatformReviewPopupProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    checkShouldShow();
  }, [user]);

  const checkShouldShow = async () => {
    if (!user) return;

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem('platform_review_dismissed');
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 30) return;
    }

    // Check if already submitted
    const submitted = localStorage.getItem('platform_review_submitted');
    if (submitted) return;

    // Fetch profile to check signup date
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, created_at')
      .eq('id', user.id)
      .single();

    if (profile) {
      setUserName(profile.full_name || user.email?.split('@')[0] || 'User');
      
      // Check if signed up more than 5 days ago
      const signupDate = new Date(profile.created_at);
      const daysSinceSignup = (Date.now() - signupDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceSignup >= 5) {
        // Show popup after a short delay
        setTimeout(() => setIsOpen(true), 3000);
        return;
      }
    }

    // Check if user has completed an order
    const { data: orders } = await supabase
      .from('orders')
      .select('id')
      .eq('customer_id', user.id)
      .eq('status', 'completed')
      .limit(1);

    if (orders && orders.length > 0) {
      setTimeout(() => setIsOpen(true), 3000);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('platform_review_dismissed', new Date().toISOString());
    setIsOpen(false);
    onClose?.();
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Please select a rating",
        description: "Tap the stars to rate your experience",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('platform_feedback')
        .insert({
          customer_name: userName,
          customer_email: user?.email || '',
          feedback_type: 'suggestion',
          subject: `${rating}-Star Review`,
          message: feedback || `Rated SteerSolo ${rating} stars`,
          rating: rating,
          user_id: user?.id,
          show_on_homepage: rating >= 4, // Auto-show 4-5 star reviews
        });

      if (error) throw error;

      localStorage.setItem('platform_review_submitted', 'true');
      
      toast({
        title: "Thank you for your feedback! 🎉",
        description: "Your review helps us improve SteerSolo for everyone.",
      });

      setIsOpen(false);
      onClose?.();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit your review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (r: number) => {
    const labels: Record<number, string> = {
      1: "Poor",
      2: "Fair",
      3: "Good",
      4: "Great",
      5: "Excellent!",
    };
    return labels[r] || "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="sm:max-w-md mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            How's your SteerSolo experience?
          </DialogTitle>
          <DialogDescription className="text-center">
            We'd love to hear your feedback! Your review helps other entrepreneurs discover SteerSolo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "w-10 h-10 transition-colors",
                      (hoveredRating || rating) >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    )}
                  />
                </button>
              ))}
            </div>
            {(hoveredRating || rating) > 0 && (
              <span className="text-sm font-medium text-primary animate-in fade-in">
                {getRatingLabel(hoveredRating || rating)}
              </span>
            )}
          </div>

          {/* Feedback Text */}
          <div className="space-y-2">
            <Textarea
              placeholder="Tell us more about your experience (optional)..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={handleDismiss}
              className="text-muted-foreground"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
