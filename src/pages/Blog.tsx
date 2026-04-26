import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { PageThemeShell, ThemeHeading, PageThemeSection, themeCardClass, themeCtaClass } from "@/components/PageThemeShell";
import { AdirePattern, AdireDivider } from "@/components/patterns/AdirePattern";

export const BLOG_POSTS = [
  {
    slug: "how-to-sell-on-whatsapp-nigeria",
    title: "How to Sell on WhatsApp in Nigeria (The Professional Way)",
    description: "Stop losing customers to slow replies. Learn how to transform your WhatsApp hustle into an automated sales engine using the SteerSolo method.",
    date: "April 26, 2026",
    readTime: "5 min read",
    category: "Sales Strategy",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80",
    featured: true
  },
  {
    slug: "what-is-safebeauty-certification",
    title: "What is the SafeBeauty Certification? (And Why Buyers Look For It)",
    description: "Counterfeit products are destroying trust in Nigerian e-commerce. Discover how the SafeBeauty badge helps genuine vendors stand out and increase their conversion rates.",
    date: "April 20, 2026",
    readTime: "4 min read",
    category: "Trust & Safety",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80",
    featured: false
  },
  {
    slug: "grow-your-online-business-nigeria",
    title: "From 5 to 50 Orders: The 30-Day Growth Playbook for Nigerian Vendors",
    description: "A step-by-step guide to scaling your online business. We analyzed 500+ successful SteerSolo merchants to find out exactly what they do differently.",
    date: "April 15, 2026",
    readTime: "7 min read",
    category: "Growth Playbooks",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
    featured: false
  }
];

const Blog = () => {
  const featuredPost = BLOG_POSTS.find(post => post.featured);
  const regularPosts = BLOG_POSTS.filter(post => !post.featured);

  return (
    <PageThemeShell header={<Navbar />} footer={<Footer />}>
      <Helmet>
        <title>SteerSolo Blog | E-commerce Tips for Nigerian Entrepreneurs</title>
        <meta name="description" content="Discover actionable guides, sales strategies, and growth playbooks for Nigerian solo entrepreneurs, WhatsApp vendors, and small business owners." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden theme-surface-primary">
        <AdirePattern variant="geometric" className="text-primary" opacity={0.05} />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <ThemeHeading
              eyebrow="RESOURCES & INSIGHTS"
              title={<>The <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">Seller's Journal</span></>}
              description="Actionable strategies, growth playbooks, and platform updates for Africa's structured sellers."
            />
          </div>
        </div>
      </section>

      <AdireDivider className="text-accent" />

      <PageThemeSection className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          
          {/* Featured Post */}
          {featuredPost && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-6 font-display flex items-center gap-2">
                <span className="w-8 h-1 bg-accent rounded-full inline-block"></span>
                Featured Insight
              </h2>
              <Link to={`/blog/${featuredPost.slug}`} className="block group">
                <Card className={`overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 ${themeCardClass}`}>
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="h-64 md:h-full overflow-hidden">
                      <img 
                        src={featuredPost.image} 
                        alt={featuredPost.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <CardContent className="p-8 md:p-12 flex flex-col justify-center">
                      <Badge className="w-fit mb-4 bg-accent/10 text-accent hover:bg-accent/20 border-none">
                        {featuredPost.category}
                      </Badge>
                      <h3 className="text-2xl md:text-3xl font-bold font-display mb-4 group-hover:text-primary transition-colors">
                        {featuredPost.title}
                      </h3>
                      <p className="text-muted-foreground text-lg mb-6 line-clamp-3">
                        {featuredPost.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-auto">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {featuredPost.date}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {featuredPost.readTime}
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            </div>
          )}

          {/* Latest Posts Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-6 font-display flex items-center gap-2">
              <span className="w-8 h-1 bg-primary rounded-full inline-block"></span>
              Latest Articles
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {regularPosts.map((post) => (
                <Link key={post.slug} to={`/blog/${post.slug}`} className="block group">
                  <Card className={`h-full overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300 ${themeCardClass}`}>
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <CardHeader className="pb-4">
                      <Badge className="w-fit mb-2 bg-primary/10 text-primary hover:bg-primary/20 border-none">
                        {post.category}
                      </Badge>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base mb-6 line-clamp-2">
                        {post.description}
                      </CardDescription>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {post.date}
                          </div>
                        </div>
                        <span className="flex items-center text-primary font-medium group-hover:translate-x-1 transition-transform">
                          Read <ArrowRight className="w-4 h-4 ml-1" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </PageThemeSection>

      <AdireDivider className="text-primary" />

      {/* Newsletter CTA */}
      <section className="py-16 theme-surface-accent">
        <div className="container mx-auto px-4">
          <Card className={`max-w-4xl mx-auto bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 ${themeCardClass}`}>
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
                Get weekly tips on growing your online store
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join 5,000+ Nigerian vendors receiving our weekly playbook on social commerce, marketing, and sales automation.
              </p>
              <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <button className={`${themeCtaClass.primary} px-6 py-3 rounded-lg font-medium whitespace-nowrap`}>
                  Subscribe
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

    </PageThemeShell>
  );
};

export default Blog;
