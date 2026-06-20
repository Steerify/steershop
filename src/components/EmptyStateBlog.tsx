import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBlogPostForCategory } from "@/data/categoryBlogPosts";
import { getCategoryLabel } from "@/utils/autoCategorize";

interface EmptyStateBlogProps {
  category: string;
}

export function EmptyStateBlog({ category }: EmptyStateBlogProps) {
  const blogPost = getBlogPostForCategory(category);
  const categoryLabel = getCategoryLabel(category);

  return (
    <div className="w-full py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Empty State Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold uppercase tracking-wider text-primary mb-4">
              <Sparkles className="w-4 h-4" />
              Be the First in {categoryLabel}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              No Stores Yet in {categoryLabel}
            </h2>
            <p className="text-muted-foreground">
              This category is waiting for amazing sellers like you! In the meantime, here's some inspiration.
            </p>
          </div>

          {/* Blog Post Card */}
          <div className="bg-card border border-border/50 rounded-3xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-6 sm:p-8">
              {/* Blog Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="secondary" className="rounded-full text-xs font-semibold">
                  Featured Story
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{blogPost.date}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{blogPost.readTime}</span>
                </div>
              </div>

              {/* Blog Title */}
              <h3 className="text-xl sm:text-2xl font-bold mb-3 leading-tight">
                {blogPost.title}
              </h3>

              {/* Blog Excerpt */}
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {blogPost.excerpt}
              </p>

              {/* Blog Content Preview */}
              <div className="bg-background/60 backdrop-blur-sm rounded-2xl p-4 mb-6">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {blogPost.content}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {blogPost.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs px-3 py-1 rounded-full bg-muted/50"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Author & CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  By <span className="font-semibold text-foreground">{blogPost.author}</span>
                </div>
                <Button
                  asChild
                  className="rounded-xl font-semibold gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-sm"
                >
                  <Link to={blogPost.ctaLink}>
                    {blogPost.ctaText}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border/40 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">500+</div>
              <div className="text-xs text-muted-foreground">Sellers Already Joined</div>
            </div>
            <div className="bg-card border border-border/40 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-accent mb-1">24/7</div>
              <div className="text-xs text-muted-foreground">Support Available</div>
            </div>
            <div className="bg-card border border-border/40 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600 mb-1">Free</div>
              <div className="text-xs text-muted-foreground">To Get Started</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
