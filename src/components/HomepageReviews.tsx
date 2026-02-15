import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  customer_name: string;
  message: string;
  rating: number;
  created_at: string;
}

export const HomepageReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_feedback')
        .select('id, customer_name, message, rating, created_at')
        .eq('show_on_homepage', true)
        .gte('rating', 4)
        .order('rating', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Hide entire section if no real reviews
  if (isLoading || reviews.length === 0) return null;

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            What Our Sellers Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of Nigerian entrepreneurs who are growing their businesses with SteerSolo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <Card
              key={review.id}
              className={cn(
                "relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1",
                index === 0 && "md:col-span-2 lg:col-span-1"
              )}
            >
              <CardContent className="p-6">
                <Quote className="w-8 h-8 text-primary/20 mb-4" />
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i < review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      )}
                    />
                  ))}
                </div>
                <p className="text-foreground mb-4 line-clamp-4">
                  "{review.message}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                    {review.customer_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{review.customer_name}</p>
                    <p className="text-sm text-muted-foreground">SteerSolo User</p>
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-primary/5 to-transparent rounded-tl-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
