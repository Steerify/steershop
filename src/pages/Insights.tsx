import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const articles = [
  {
    title: "How to sell on WhatsApp in Nigeria without messy DMs",
    description: "A practical structure for turning WhatsApp conversations into clean storefront orders and repeat sales.",
    href: "/insights/whatsapp-selling-nigeria",
  },
  {
    title: "Marketplace growth playbook for Nigerian sellers",
    description: "How to combine storefront branding, trust, and distribution so new buyers can discover your business faster.",
    href: "/insights/marketplace-growth-playbook",
  },
  {
    title: "How to build a trusted online storefront in Nigeria",
    description: "The trust signals and page structure that help customers choose your store with confidence.",
    href: "/insights/trusted-storefront-nigeria",
  },
];

const Insights = () => {
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "SteerSolo Insights",
    itemListElement: articles.map((article, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://steersolo.com${article.href}`,
      name: article.title,
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>SteerSolo Insights | Guides for Nigerian online sellers</title>
        <meta name="description" content="Read SteerSolo insights, guides, and practical playbooks for WhatsApp selling, storefront growth, and trusted online commerce in Nigeria." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://steersolo.com/insights" />
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
      </Helmet>
      <Navbar />

      <section className="pt-28 pb-12 bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b border-border/60">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-xs uppercase tracking-wider text-accent font-semibold mb-3">SteerSolo Content Hub</p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Insights for Nigerian sellers</h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Practical articles on online selling, storefront trust, payments, and growth. Built for small businesses using WhatsApp and social channels.
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="container mx-auto px-4 max-w-4xl grid gap-4 sm:gap-5">
          {articles.map((article) => (
            <Card key={article.href} className="border-border/60 hover:border-primary/30 transition-colors">
              <CardContent className="p-6 sm:p-7">
                <h2 className="font-display text-xl font-bold mb-2">{article.title}</h2>
                <p className="text-muted-foreground text-sm sm:text-base mb-4">{article.description}</p>
                <Link to={article.href}>
                  <Button variant="outline" className="rounded-xl">
                    Read article <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Insights;
