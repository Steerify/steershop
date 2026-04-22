import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { generateKeywordBank } from "@/utils/seoKeywords";

interface ArticleSection {
  heading: string;
  body: string;
}

interface SEOArticlePageTemplateProps {
  title: string;
  description: string;
  slug: string;
  keywords: string[];
  publishedDate: string;
  updatedDate: string;
  sectionIntro: string;
  sections: ArticleSection[];
}

const SEOArticlePageTemplate = ({
  title,
  description,
  slug,
  keywords,
  publishedDate,
  updatedDate,
  sectionIntro,
  sections,
}: SEOArticlePageTemplateProps) => {
  const canonical = `https://steersolo.com/insights/${slug}`;
  const keywordBank = generateKeywordBank({ coreTopics: keywords, limit: 3000 });

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: publishedDate,
    dateModified: updatedDate,
    author: {
      "@type": "Organization",
      name: "SteerSolo",
    },
    publisher: {
      "@type": "Organization",
      name: "SteerSolo",
      url: "https://steersolo.com",
    },
    mainEntityOfPage: canonical,
    keywords: keywordBank.join(", "),
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title} | SteerSolo Insights</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywordBank.join(", ")} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${title} | SteerSolo Insights`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:site_name" content="SteerSolo" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${title} | SteerSolo Insights`} />
        <meta name="twitter:description" content={description} />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>

      <Navbar />

      <section className="pt-28 pb-14 bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b border-border/60">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-xs uppercase tracking-wider text-accent font-semibold mb-3">SteerSolo Insights</p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">{title}</h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-3xl">{description}</p>
          <div className="mt-4 text-xs text-muted-foreground">
            Published {new Date(publishedDate).toLocaleDateString()} · Updated {new Date(updatedDate).toLocaleDateString()}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="container mx-auto px-4 max-w-4xl space-y-6">
          <Card className="border-border/60 bg-card/80">
            <CardContent className="p-6 sm:p-8">
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{sectionIntro}</p>
            </CardContent>
          </Card>

          {sections.map((section) => (
            <Card key={section.heading} className="border-border/60">
              <CardContent className="p-6 sm:p-8">
                <h2 className="font-display text-xl sm:text-2xl font-bold mb-3">{section.heading}</h2>
                <p className="text-muted-foreground leading-relaxed">{section.body}</p>
              </CardContent>
            </Card>
          ))}

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-bold">Ready to apply this to your store?</h3>
              <p className="text-muted-foreground text-sm mt-1">Set up your SteerSolo storefront and start selling with more structure.</p>
            </div>
            <Link to="/vendor" className="sm:shrink-0">
              <Button className="rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90">
                Create free store <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SEOArticlePageTemplate;
