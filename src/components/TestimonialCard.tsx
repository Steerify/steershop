import { Star, Quote } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  message: string;
  rating?: number;
  role?: string;
}

export const TestimonialCard = ({ name, message, rating = 5, role }: TestimonialCardProps) => (
  <div className="card-spotify p-6 relative">
    <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />
    <div className="flex gap-0.5 mb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < rating ? "text-gold fill-gold" : "text-muted"}`} />
      ))}
    </div>
    <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{message}"</p>
    <div>
      <p className="font-semibold text-sm">{name}</p>
      {role && <p className="text-xs text-muted-foreground">{role}</p>}
    </div>
  </div>
);
