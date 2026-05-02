import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ShoppingBag, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const collections = [
  {
    id: "fashion-hubs",
    title: "Top Fashion Hubs",
    location: "Lagos",
    description: "Discover the trendiest Adire, Aso-oke, and modern Nigerian fashion.",
    image: "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&q=80&w=800",
    count: 24,
    color: "bg-indigo-500",
    icon: ShoppingBag,
    link: "/shops?category=fashion"
  },
  {
    id: "tech-gadgets",
    title: "Verified Tech Shops",
    location: "Online",
    description: "Quality smartphones, laptops, and accessories from trusted vendors.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800",
    count: 18,
    color: "bg-emerald-500",
    icon: Zap,
    link: "/shops?category=electronics"
  },
  {
    id: "beauty-wellness",
    title: "Beauty & Glow",
    location: "Abuja",
    description: "Organic skincare, haircare, and wellness products for the Naija glow.",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800",
    count: 32,
    color: "bg-pink-500",
    icon: Heart,
    link: "/shops?category=beauty"
  }
];

export const CollectionsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3 h-3" />
              <span>Curated Collections</span>
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Shop Smarter with <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Curated Hubs</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We've grouped the best stores together to help you find exactly what you need without the "Paradox of Choice."
            </p>
          </div>
          <Link to="/shops">
            <Button variant="outline" className="rounded-xl group h-12 px-6">
              View All Shops
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <Link 
              key={collection.id} 
              to={collection.link}
              className="group relative h-[450px] rounded-3xl overflow-hidden shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img 
                  src={collection.image} 
                  alt={collection.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-10 h-10 rounded-xl ${collection.color} flex items-center justify-center text-white shadow-lg`}>
                    <collection.icon className="w-5 h-5" />
                  </div>
                  <span className="text-white/80 text-sm font-medium">{collection.location}</span>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                  {collection.title}
                </h3>
                
                <p className="text-white/70 text-sm mb-6 line-clamp-2">
                  {collection.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold">
                    {collection.count}+ Shops
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 shadow-xl">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
