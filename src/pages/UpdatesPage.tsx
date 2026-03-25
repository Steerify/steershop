import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Megaphone, Sparkles, AlertTriangle, Info, Newspaper } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageWrapper } from "@/components/PageWrapper";
import { AdirePattern, AdireDivider } from "@/components/patterns/AdirePattern";
import { Skeleton } from "@/components/ui/skeleton";

const typeConfig: Record<string, { icon: typeof Megaphone; color: string; bg: string }> = {
  feature: { icon: Sparkles, color: "text-accent", bg: "bg-accent/10" },
  announcement: { icon: Megaphone, color: "text-primary", bg: "bg-primary/10" },
  warning: { icon: AlertTriangle, color: "text-gold", bg: "bg-gold/10" },
  info: { icon: Info, color: "text-muted-foreground", bg: "bg-muted" },
};

const UpdatesPage = () => {
  const { data: updates, isLoading } = useQuery({
    queryKey: ["platform-updates-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_updates")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  return (
    <PageWrapper patternVariant="dots" patternOpacity={0.2}>
      <Navbar />

      <section className="relative pt-28 sm:pt-32 pb-12 sm:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
        <AdirePattern variant="waves" className="text-primary" opacity={0.1} />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <Newspaper className="w-4 h-4" />
            What's New
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Platform <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Updates</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            The latest features, improvements, and announcements from the SteerSolo team.
          </p>
        </div>
      </section>

      <AdireDivider />

      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="card-spotify p-6">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : !updates?.length ? (
            <div className="text-center py-20 text-muted-foreground">
              <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="font-medium">No updates yet</p>
              <p className="text-sm mt-1">Check back soon — we're always building!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {updates.map((update) => {
                const config = typeConfig[update.type] || typeConfig.info;
                const Icon = config.icon;
                return (
                  <article key={update.id} className="card-spotify p-6 hover:-translate-y-0.5 transition-transform">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>
                      <div>
                        <span className={`text-xs font-semibold uppercase tracking-wider ${config.color}`}>
                          {update.type}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {format(new Date(update.created_at), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                    <h2 className="text-lg font-bold mb-2">{update.title}</h2>
                    {update.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{update.description}</p>
                    )}
                    <div className="mt-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {update.target_audience === "all" ? "Everyone" : update.target_audience}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </PageWrapper>
  );
};

export default UpdatesPage;
