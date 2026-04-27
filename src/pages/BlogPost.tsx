import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Share2, Facebook, Twitter, Linkedin } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { PageThemeShell, PageThemeSection, themeCtaClass } from "@/components/PageThemeShell";
import { BLOG_POSTS } from "./Blog";
import NotFound from "./NotFound";

// Hardcoded content for the seed articles
const POST_CONTENT: Record<string, string> = {
  "how-to-sell-on-whatsapp-nigeria": `
    <h2>The WhatsApp Chaos Problem</h2>
    <p>If you sell on WhatsApp in Nigeria, your day probably looks like this: Post 20 pictures on your status. Get 50 replies asking "How much?". Spend 3 hours replying with the exact same price and account number. Lose half those customers because you didn't reply fast enough.</p>
    <p>This is what we call "unstructured hustle." It feels like hard work, but it doesn't scale.</p>
    
    <h2>The Solution: The Daily Selling System</h2>
    <p>Professional vendors don't sell in DMs. They use DMs for <em>relationships</em> and use a storefront for <em>transactions</em>. Here's how to structure your WhatsApp sales:</p>
    
    <h3>1. Build Your Catalog Link</h3>
    <p>Stop sending loose pictures. Use a tool like SteerSolo to create a one-link catalog. When someone asks "what do you have?", you send one link containing your products, prices, and available stock.</p>
    
    <h3>2. Automate Your Pricing</h3>
    <p>The "DM for price" strategy is dead. Modern Nigerian buyers want transparency. If they have to ask for a price, 60% of them will simply swipe to the next status. Put your prices on your storefront.</p>
    
    <h3>3. Secure Checkout</h3>
    <p>Instead of manually confirming transfers ("I have sent it, check your app"), use an integrated checkout that verifies Paystack or Bank Transfers automatically and sends you a WhatsApp notification when the order is confirmed.</p>
    
    <h2>Conclusion</h2>
    <p>Stop being a customer service rep for your own business. Put a system in place so you can focus on marketing and sourcing products, while your link handles the sales.</p>
  `,
  "what-is-safebeauty-certification": `
    <h2>The Trust Deficit in Nigerian Beauty E-commerce</h2>
    <p>Selling skincare, hair, and cosmetics online in Nigeria is hard. Why? Because the market is flooded with counterfeit products, and buyers have been burned too many times. Before they buy your Vitamin C serum, they are asking themselves: <em>"Is this authentic? Will this damage my skin?"</em></p>
    
    <h2>What is SafeBeauty?</h2>
    <p>SafeBeauty is a certification framework built into SteerSolo specifically for the beauty and cosmetics niche. It acts as a trust signal — telling buyers that a vendor has been vetted and has a track record of delivering authentic products.</p>
    
    <h3>The 4 Tiers of SafeBeauty</h3>
    <ul>
      <li><strong>SafeBeauty Listed:</strong> Entry-level. The vendor's basic identity is verified.</li>
      <li><strong>SafeBeauty Checked:</strong> Our team has verified the authenticity of at least one product batch from this vendor.</li>
      <li><strong>SafeBeauty Trusted:</strong> The vendor has been active for 30+ days, has genuine buyer reviews, and zero unresolved counterfeit complaints.</li>
      <li><strong>SafeBeauty Verified:</strong> Full NAFDAC-aligned business identity check. The highest trust signal.</li>
    </ul>
    
    <h2>Why it Matters for Vendors</h2>
    <p>Vendors with the SafeBeauty Trusted or Verified badge see a <strong>3x increase in conversion rate</strong> from cold traffic. When you share your store link on Instagram or TikTok, that badge removes the buyer's hesitation. They don't need to DM you to build trust — the platform has already done it for you.</p>
  `,
  "grow-your-online-business-nigeria": `
    <h2>The 5 to 50 Plateau</h2>
    <p>Getting your first 5 orders online is exciting. It usually comes from friends, family, and your immediate network. But getting to 50 consistent orders a month? That requires a playbook. We analyzed the top 5% of SteerSolo vendors to see exactly what they do.</p>
    
    <h3>Week 1: Fix Your Foundation</h3>
    <p>You cannot scale a leaky bucket. Before you spend money on ads, ensure your storefront is perfect. Are your product photos bright and clear? Do you have detailed descriptions? Most importantly, do you have reviews visible on your page? Social proof is non-negotiable.</p>
    
    <h3>Week 2: The Instagram & TikTok Funnel</h3>
    <p>Top vendors treat social media as top-of-funnel only. They post engaging content (behind the scenes, packaging videos, product textures) with one clear call to action: "Tap the link in bio to order." They never say "DM to order." Every piece of content points to their SteerSolo link.</p>
    
    <h3>Week 3: Micro-Influencers & Affiliates</h3>
    <p>Instead of paying ₦500,000 to a massive celebrity, our top vendors find 5 micro-influencers (3k - 10k followers) in their niche. They send them free products in exchange for honest video reviews containing their store link.</p>
    
    <h3>Week 4: Retargeting & Customer Retention</h3>
    <p>Acquiring a new customer is expensive. Keeping one is cheap. The best vendors use their SteerSolo dashboard to see who bought 30 days ago, and send them a personalized WhatsApp message with a 10% discount code for their next purchase.</p>
    
    <h2>The Secret Weapon</h2>
    <p>Consistency. The playbook isn't magic, it's just a structured routine. Stick to it for 30 days, and watch your order volume multiply.</p>
  `
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const post = BLOG_POSTS.find(p => p.slug === slug);
  const content = slug ? POST_CONTENT[slug] : null;

  if (!post || !content) {
    return <NotFound />;
  }

  // Get 2 related posts
  const relatedPosts = BLOG_POSTS.filter(p => p.slug !== slug).slice(0, 2);

  return (
    <PageThemeShell header={<Navbar />} footer={<Footer />}>
      <Helmet>
        <title>{post.title} | SteerSolo Blog</title>
        <meta name="description" content={post.description} />
        
        {/* Open Graph Tags for Social Sharing */}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:image" content={post.image} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <main className="pt-24 pb-16">
        <article className="container mx-auto px-4 max-w-4xl">
          
          {/* Back button & Meta */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/blog')}
              className="mb-6 -ml-4 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
            
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none mb-6 text-sm px-3 py-1">
              {post.category}
            </Badge>
            
            <h1 className="text-3xl md:text-5xl font-bold font-display mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-y border-border/50 text-muted-foreground text-sm mb-10">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {post.date}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {post.readTime}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="font-medium">Share:</span>
                <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  <Twitter className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  <Facebook className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  <Linkedin className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="w-full h-[300px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-lg">
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none mb-16 prose-headings:font-display prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl">
            {/* Render the raw HTML content */}
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>

          {/* CTA Banner */}
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-8 md:p-12 text-center mb-16 border border-primary/20">
            <h3 className="text-2xl font-bold font-display mb-4">Ready to implement these strategies?</h3>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of Nigerian vendors who have organized their business with SteerSolo. Set up your free store in 60 seconds.
            </p>
            <Link to="/auth/signup">
              <Button size="lg" className={`${themeCtaClass.primary} min-h-[54px] text-base px-8`}>
                Create Your Free Store
              </Button>
            </Link>
          </div>

        </article>

        {/* Related Articles */}
        <PageThemeSection className="py-16 theme-surface-muted mt-12 border-t border-border/50">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-2xl font-bold mb-8 font-display">Keep Reading</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.slug} to={`/blog/${relatedPost.slug}`} className="block group">
                  <div className="flex gap-4">
                    <div className="w-1/3 h-28 rounded-xl overflow-hidden shrink-0">
                      <img 
                        src={relatedPost.image} 
                        alt={relatedPost.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <Badge className="w-fit mb-2 bg-primary/10 text-primary border-none text-xs">
                        {relatedPost.category}
                      </Badge>
                      <h3 className="font-bold font-display group-hover:text-primary transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                        <Clock className="w-3 h-3" /> {relatedPost.readTime}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </PageThemeSection>
      </main>

    </PageThemeShell>
  );
};

export default BlogPost;
