import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
  {
    name: "Chinelo Nwosu",
    location: "Lagos → London",
    role: "Fashion Designer",
    content: "SteerSolo took my Ankara designs from Instagram to international boutiques. My UK orders tripled in 3 months!",
    rating: 5
  },
  {
    name: "David Chen",
    location: "Hong Kong",
    role: "Tech Accessories",
    content: "As an international seller, I needed something that works globally. SteerSolo handles my African customers perfectly.",
    rating: 5
  },
  {
    name: "Fatima Abdullahi",
    location: "Kano → Dubai",
    role: "Perfume Business",
    content: "My perfume business went from WhatsApp to serving customers in 8 countries. The multi-currency feature is a game-changer.",
    rating: 5
  },
  {
    name: "Marcus Johnson",
    location: "New York",
    role: "Art Collector",
    content: "I buy African art from SteerSolo stores. The experience is seamless and the sellers are incredibly professional.",
    rating: 5
  }
];

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="relative max-w-6xl mx-auto">
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {testimonials.map((testimonial, index) => (
            <div key={index} className="w-full flex-shrink-0 px-4">
              <Card className="border-0 bg-card/50 backdrop-blur-sm h-full">
                <CardContent className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-lg italic mb-6">"{testimonial.content}"</p>
                  <div>
                    <div className="font-bold text-xl">{testimonial.name}</div>
                    <div className="text-muted-foreground">{testimonial.role}</div>
                    <div className="text-accent font-semibold mt-2">{testimonial.location}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={prev}
          className="p-2 rounded-full bg-card/50 backdrop-blur-sm border hover:bg-accent/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? "bg-primary w-8" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="p-2 rounded-full bg-card/50 backdrop-blur-sm border hover:bg-accent/10 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}