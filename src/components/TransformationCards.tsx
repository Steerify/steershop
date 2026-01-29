import { MessageCircle, ShoppingBag, Image, Store, Users, Heart, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const transformations = [
  {
    before: {
      icon: MessageCircle,
      title: "WhatsApp Chaos",
      description: "Lost in endless chats, repeating prices, forgetting orders"
    },
    after: {
      icon: ShoppingBag,
      title: "Organized Orders",
      description: "One link, clear pricing, automatic order tracking"
    },
    color: "from-red-500/20 to-green-500/20"
  },
  {
    before: {
      icon: Image,
      title: "Blurry Photos",
      description: "Scattered images, no descriptions, unprofessional look"
    },
    after: {
      icon: Store,
      title: "Pro Storefront",
      description: "Beautiful gallery, detailed info, trusted brand"
    },
    color: "from-orange-500/20 to-blue-500/20"
  },
  {
    before: {
      icon: Users,
      title: "Lost Customers",
      description: "No repeat buyers, forgotten contacts, missed sales"
    },
    after: {
      icon: Heart,
      title: "Loyal Fans",
      description: "Customer database, easy follow-ups, repeat orders"
    },
    color: "from-yellow-500/20 to-purple-500/20"
  }
];

export const TransformationCards = () => {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4">
            <span className="text-sm font-semibold text-primary">SEE THE DIFFERENCE</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Transform How You Sell
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From WhatsApp vendor to professional brand owner
          </p>
        </div>

        {/* Transformation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {transformations.map((item, index) => (
            <Card key={index} className="overflow-hidden border-2 hover:border-primary/20 transition-all hover:shadow-lg">
              <CardContent className="p-0">
                {/* Before */}
                <div className="p-6 bg-muted/50 border-b">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-destructive/20 rounded-lg flex items-center justify-center">
                      <item.before.icon className="w-5 h-5 text-destructive" />
                    </div>
                    <span className="text-xs font-bold text-destructive uppercase tracking-wide">Before</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{item.before.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.before.description}</p>
                </div>

                {/* Arrow */}
                <div className="flex justify-center -my-3 relative z-10">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <ArrowRight className="w-5 h-5 text-white rotate-90" />
                  </div>
                </div>

                {/* After */}
                <div className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <item.after.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs font-bold text-primary uppercase tracking-wide">After</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{item.after.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.after.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
