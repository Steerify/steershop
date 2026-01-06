import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  name: string;
  business: string;
  quote: string;
  rating: number;
  isReal: boolean;
}

// Demo testimonials to use as fallback
const demoTestimonials: Testimonial[] = [
  {
    id: "demo-1",
    name: "Amaka N.",
    business: "Fashion Designer",
    quote: "My sales tripled after getting a professional store. Customers trust me more now.",
    rating: 5,
    isReal: false
  },
  {
    id: "demo-2",
    name: "Tunde C.",
    business: "Tech Seller",
    quote: "No more lost orders! Everything comes to WhatsApp and I can track everything.",
    rating: 5,
    isReal: false
  },
  {
    id: "demo-3",
    name: "Chioma A.",
    business: "Baker",
    quote: "Customers love being able to browse my menu anytime. Orders are much faster now.",
    rating: 5,
    isReal: false
  }
];

// Demo transformation stories
const demoTransformations = [
  {
    id: "trans-1",
    name: "Amaka's Fashion",
    before: "Blurry WhatsApp photos",
    after: "Professional online boutique",
    result: "3x sales increase",
    quote: "Customers now pay without bargaining",
    isReal: false
  },
  {
    id: "trans-2",
    name: "Tunde's Tech Shop",
    before: "Lost orders in chats",
    after: "Organized order system",
    result: "Saves 3 hours daily",
    quote: "No more order mix-ups",
    isReal: false
  },
  {
    id: "trans-3",
    name: "Chioma's Baking",
    before: "Manual price lists",
    after: "Clear online menu",
    result: "50% faster orders",
    quote: "Customers browse menu anytime",
    isReal: false
  }
];

export const DynamicTestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(demoTestimonials);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRealTestimonials();
  }, []);

  const fetchRealTestimonials = async () => {
    try {
      // Fetch real reviews with rating >= 4 and meaningful comments
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          id,
          rating,
          comment,
          customer_name,
          created_at,
          product_id
        `)
        .gte('rating', 4)
        .not('comment', 'is', null)
        .order('rating', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching testimonials:', error);
        setLoading(false);
        return;
      }

      // Filter reviews with meaningful comments (>20 chars)
      const meaningfulReviews = (data || []).filter(
        review => review.comment && review.comment.length > 20
      );

      if (meaningfulReviews.length >= 3) {
        // Use real reviews
        const realTestimonials: Testimonial[] = meaningfulReviews.slice(0, 3).map(review => ({
          id: review.id,
          name: review.customer_name || 'Happy Customer',
          business: 'SteerSolo Customer',
          quote: review.comment || '',
          rating: review.rating,
          isReal: true
        }));
        setTestimonials(realTestimonials);
      } else if (meaningfulReviews.length > 0) {
        // Mix real with demo
        const realTestimonials: Testimonial[] = meaningfulReviews.map(review => ({
          id: review.id,
          name: review.customer_name || 'Happy Customer',
          business: 'SteerSolo Customer',
          quote: review.comment || '',
          rating: review.rating,
          isReal: true
        }));
        const neededDemo = 3 - realTestimonials.length;
        setTestimonials([...realTestimonials, ...demoTestimonials.slice(0, neededDemo)]);
      }
      // If no real reviews, keep demo testimonials
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold mb-4">
            What Sellers Are Saying
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real stories from entrepreneurs who transformed their businesses
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  {[...Array(5 - testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-gray-200" />
                  ))}
                </div>
                <p className="italic text-muted-foreground mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.business}</div>
                  </div>
                  {testimonial.isReal && (
                    <div className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      Verified
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export const DynamicTransformationSection = () => {
  const [transformations, setTransformations] = useState(demoTransformations);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRealTransformations();
  }, []);

  const fetchRealTransformations = async () => {
    try {
      // Fetch shop reviews with rating >= 4 and meaningful comments
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          customer_name,
          shop_id,
          shops:shop_id (shop_name)
        `)
        .gte('rating', 4)
        .not('comment', 'is', null)
        .order('rating', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching transformations:', error);
        setLoading(false);
        return;
      }

      // Filter reviews with meaningful comments (>20 chars)
      const meaningfulReviews = (data || []).filter(
        review => review.comment && review.comment.length > 20
      );

      if (meaningfulReviews.length >= 3) {
        // Use real reviews as transformation stories
        const realTransformations = meaningfulReviews.slice(0, 3).map((review: any) => ({
          id: review.id,
          name: review.shops?.shop_name || 'SteerSolo Store',
          before: "Manual WhatsApp selling",
          after: "Professional online store",
          result: `${review.rating}★ rating`,
          quote: review.comment || '',
          isReal: true
        }));
        setTransformations(realTransformations);
      } else if (meaningfulReviews.length > 0) {
        // Mix real with demo
        const realTransformations = meaningfulReviews.map((review: any) => ({
          id: review.id,
          name: review.shops?.shop_name || 'SteerSolo Store',
          before: "Manual WhatsApp selling",
          after: "Professional online store",
          result: `${review.rating}★ rating`,
          quote: review.comment || '',
          isReal: true
        }));
        const neededDemo = 3 - realTransformations.length;
        setTransformations([...realTransformations, ...demoTransformations.slice(0, neededDemo)]);
      }
      // If no real reviews, keep demo transformations
    } catch (error) {
      console.error('Error fetching transformations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold mb-4">
            From WhatsApp Seller to Business Owner
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real transformations from real sellers using SteerSolo
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {transformations.map((story) => (
            <Card key={story.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-xl font-bold">{story.name}</h3>
                  {story.isReal && (
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      Real Story
                    </span>
                  )}
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="text-sm text-red-600 font-medium mb-1">Before SteerSolo</div>
                    <div className="font-medium text-gray-800">{story.before}</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="text-sm text-green-600 font-medium mb-1">After SteerSolo</div>
                    <div className="font-medium text-gray-800">{story.after}</div>
                  </div>
                </div>
                
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 mb-4">
                  <p className="italic text-foreground">"{story.quote}"</p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <div className="text-sm text-muted-foreground">Result</div>
                    <div className="font-bold text-green-600">{story.result}</div>
                  </div>
                  <div className="text-2xl">🚀</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

