import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { CheckCircle, ArrowRight, Star } from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
}

interface Section {
  title: string;
  description: string;
  points: string[];
}

interface SEOPageProps {
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCTA: string;
  sections: Section[];
  faqs: FAQ[];
  testimonial?: {
    quote: string;
    name: string;
    business: string;
  };
}

export const SEOPageTemplate = ({
  metaTitle,
  metaDescription,
  heroTitle,
  heroSubtitle,
  heroCTA,
  sections,
  faqs,
  testimonial,
}: SEOPageProps) => {
  useEffect(() => {
    document.title = metaTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", metaDescription);
    else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = metaDescription;
      document.head.appendChild(meta);
    }

    // FAQ Schema
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map((f) => ({
        "@type": "Question",
        "name": f.question,
        "acceptedAnswer": { "@type": "Answer", "text": f.answer },
      })),
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "seo-page-faq";
    script.text = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    return () => {
      document.getElementById("seo-page-faq")?.remove();
    };
  }, [metaTitle, metaDescription, faqs]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative py-16 sm:py-24 bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-3xl sm:text-5xl font-bold text-foreground leading-tight mb-6">
            {heroTitle}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed">
            {heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto text-base px-8">
                {heroCTA} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link to="/shops">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8">
                Explore Stores
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      {sections.map((section, idx) => (
        <section
          key={idx}
          className={`py-12 sm:py-16 ${idx % 2 === 0 ? "bg-background" : "bg-muted/30"}`}
        >
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              {section.title}
            </h2>
            <p className="text-muted-foreground mb-8 text-base sm:text-lg leading-relaxed">
              {section.description}
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {section.points.map((point, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <span className="text-foreground text-sm sm:text-base">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Testimonial */}
      {testimonial && (
        <section className="py-12 sm:py-16 bg-primary/5">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-gold fill-gold" />
              ))}
            </div>
            <blockquote className="text-lg sm:text-xl italic text-foreground mb-4 leading-relaxed">
              "{testimonial.quote}"
            </blockquote>
            <p className="font-semibold text-foreground">{testimonial.name}</p>
            <p className="text-sm text-muted-foreground">{testimonial.business}</p>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to Start Selling?
          </h2>
          <p className="text-primary-foreground/80 mb-6">
            Join 500+ Nigerian entrepreneurs already using SteerSolo. 15-day free trial, no credit card required.
          </p>
          <Link to="/auth/signup">
            <Button size="lg" variant="secondary" className="text-base px-8">
              Create Your Free Store <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SEOPageTemplate;
