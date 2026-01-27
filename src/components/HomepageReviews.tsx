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

  // Fallback reviews if none in database
  const fallbackReviews: Review[] = [
    {
      id: '1',
      customer_name: 'Chioma A.',
      message: 'SteerSolo transformed how I run my fashion business. No more endless WhatsApp back-and-forth!',
      rating: 5,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      customer_name: 'Emeka O.',
      message: 'Finally, a platform that understands Nigerian businesses. The Paystack integration is seamless.',
      rating: 5,
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      customer_name: 'Aisha M.',
      message: 'My customers love how professional my store looks now. Sales have increased by 40%!',
      rating: 5,
      created_at: new Date().toISOString(),
    },
  ];

  const displayReviews = reviews.length > 0 ? reviews : fallbackReviews;

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 h-48 bg-muted rounded-lg" />
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            What Our Users Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of Nigerian entrepreneurs who are growing their businesses with SteerSolo
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayReviews.map((review, index) => (
            <Card
              key={review.id}
              className={cn(
                "relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1",
                index === 0 && "md:col-span-2 lg:col-span-1"
              )}
            >
              <CardContent className="p-6">
                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-primary/20 mb-4" />

                {/* Rating Stars */}
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

                {/* Review Text */}
                <p className="text-foreground mb-4 line-clamp-4">
                  "{review.message}"
                </p>

                {/* Reviewer */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                    {review.customer_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{review.customer_name}</p>
                    <p className="text-sm text-muted-foreground">SteerSolo User</p>
                  </div>
                </div>

                {/* Decorative Element */}
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-primary/5 to-transparent rounded-tl-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
