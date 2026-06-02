import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import conciergeService, {
  ConciergePost,
  ConciergeStatus,
  ConciergeMetrics,
  ConciergeSlot,
  TargetGroup,
} from "@/services/concierge.service";
import { shareToSteersoloGroup } from "@/utils/whatsappGroupShare";
import {
  Send,
  SkipForward,
  RefreshCw,
  Sparkles,
  Loader2,
  ExternalLink,
  CheckCircle2,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const SLOT_LABELS: Record<ConciergeSlot, string> = {
  morning_pick: "Morning Pick",
  new_arrivals: "New Arrivals",
  lunch_deal: "Lunch Deal",
  shop_spotlight: "Shop Spotlight",
  top5: "Top 5 Products",
  featured_store: "Featured Store",
  conversation: "Conversation Starter",
};

const SLOTS: ConciergeSlot[] = [
  "morning_pick",
  "new_arrivals",
  "lunch_deal",
  "shop_spotlight",
  "top5",
  "featured_store",
  "conversation",
];

const TARGET_LABELS: Record<TargetGroup, { label: string; color: string }> = {
  marketplace: { label: "Marketplace", color: "bg-orange-500/10 text-orange-600 border-orange-200" },
  foundry: { label: "Foundry", color: "bg-purple-500/10 text-purple-600 border-purple-200" },
  vendor: { label: "Vendor", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
};

const LINK_PLACEHOLDER_PATTERN = /\n?\s*\[(?:shop|product)?\s*link\]\s*/gi;
const URL_PATTERN = /https?:\/\/\S+/i;

function getPostActionUrl(post: ConciergePost) {
  const linkUrl = post.link_url || "https://steersolo.com";
  const productId = post.product_ids?.length === 1 ? post.product_ids[0] : null;

  if (!productId || linkUrl.includes("/product/") || !linkUrl.includes("/shop/")) {
    return linkUrl;
  }

  try {
    const url = new URL(linkUrl, "https://steersolo.com");
    if (url.pathname.split("/").filter(Boolean).length === 2) {
      url.pathname = `${url.pathname.replace(/\/$/, "")}/product/${productId}`;
      return url.toString();
    }
  } catch {
    // Fall back to the saved link when it cannot be parsed.
  }

  return linkUrl;
}

function getShareCaption(post: ConciergePost) {
  const actionUrl = getPostActionUrl(post);
  let caption = post.caption.replace(LINK_PLACEHOLDER_PATTERN, `\n\nView on SteerSolo: ${actionUrl}`).trim();

  if (post.link_url && actionUrl !== post.link_url) {
    caption = caption.replaceAll(post.link_url, actionUrl);
  }

  if (!URL_PATTERN.test(caption)) {
    caption = `${caption}\n\nView on SteerSolo: ${actionUrl}`;
  }

  return caption;
}

export default function AdminConcierge() {
  const { toast } = useToast();
  const [tab, setTab] = useState<ConciergeStatus>("pending");
  const [posts, setPosts] = useState<ConciergePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<ConciergeMetrics | null>(null);
  const [generating, setGenerating] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [filterGroup, setFilterGroup] = useState<TargetGroup | "all">("all");

  const load = async (status: ConciergeStatus = tab) => {
    setLoading(true);
    try {
      const [list, m] = await Promise.all([
        conciergeService.listPosts(status),
        conciergeService.metrics(),
      ]);
      setPosts(list);
      setMetrics(m);
    } catch (e: any) {
      toast({
        title: "Could not load queue",
        description: e?.message ?? String(e),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleGenerate = async (slot?: ConciergeSlot) => {
    setGenerating(true);
    try {
      await conciergeService.generateNow(slot);
      toast({
        title: "Post generated",
        description: slot ? `New ${SLOT_LABELS[slot]} added to queue` : "New post added to queue",
      });
      await load("pending");
      setTab("pending");
    } catch (e: any) {
      toast({
        title: "Generation failed",
        description: e?.message ?? String(e),
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSend = async (post: ConciergePost) => {
    setActingId(post.id);
    try {
      const result = await shareToSteersoloGroup({
        caption: getShareCaption(post),
        imageUrl: post.image_url,
        targetGroup: post.target_group,
      });
      await conciergeService.markSent(post.id);

      const detail =
        result.method === "web-share"
          ? "WhatsApp opened — choose the SteerSolo Marketplace group."
          : `Caption copied${result.imageCopied ? " and image downloaded" : ""}. Group opened in a new tab — attach the image, paste, and send.`;

      toast({
        title: "Ready to send 📤",
        description: detail,
        duration: 8000,
      });
      await load(tab);
    } catch (e: any) {
      toast({
        title: "Action failed",
        description: e?.message ?? String(e),
        variant: "destructive",
      });
    } finally {
      setActingId(null);
    }
  };

  const handleSkip = async (post: ConciergePost) => {
    setActingId(post.id);
    try {
      await conciergeService.skip(post.id);
      toast({ title: "Skipped" });
      await load(tab);
    } catch (e: any) {
      toast({
        title: "Skip failed",
        description: e?.message ?? String(e),
        variant: "destructive",
      });
    } finally {
      setActingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              WhatsApp Concierge
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Auto-generates promo posts every 2 hours for the SteerSolo Marketplace WhatsApp
              group. Tap <strong>Send to Group</strong> to forward the post in one tap.
            </p>
          </div>
          <Button
            onClick={() => handleGenerate()}
            disabled={generating}
            className="gap-2"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Generate now
          </Button>
        </div>

        {/* Metrics */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard label="Generated (7d)" value={metrics.generated_7d} />
            <MetricCard label="Sent (7d)" value={metrics.sent_7d} accent />
            <MetricCard label="Skipped (7d)" value={metrics.skipped_7d} />
            <MetricCard label="Link clicks (7d)" value={metrics.clicks_7d} accent />
          </div>
        )}

        {/* Quick generators */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Force a slot
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {SLOTS.map((s) => (
              <Button
                key={s}
                size="sm"
                variant="outline"
                disabled={generating}
                onClick={() => handleGenerate(s)}
              >
                {SLOT_LABELS[s]}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Queue */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Tabs value={tab} onValueChange={(v) => setTab(v as ConciergeStatus)} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="skipped">Skipped</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex gap-2">
            {(["all", "marketplace", "foundry", "vendor"] as const).map((g) => (
              <Button 
                key={g} 
                variant={filterGroup === g ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilterGroup(g)}
                className="capitalize"
              >
                {g}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : posts.filter(p => filterGroup === "all" || p.target_group === filterGroup).length === 0 ? (
            <EmptyState status={tab} onGenerate={() => handleGenerate()} />
          ) : (
            <div className="space-y-3">
              {posts
                .filter(p => filterGroup === "all" || p.target_group === filterGroup)
                .map((p) => (
                  <PostCard
                    key={p.id}
                    post={p}
                    busy={actingId === p.id}
                    onSend={() => handleSend(p)}
                    onSkip={() => handleSkip(p)}
                  />
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div
          className={`text-2xl font-extrabold mt-1 ${accent ? "text-primary" : "text-foreground"}`}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  status,
  onGenerate,
}: {
  status: ConciergeStatus;
  onGenerate: () => void;
}) {
  return (
    <Card>
      <CardContent className="py-12 text-center space-y-3">
        <div className="text-sm text-muted-foreground">
          {status === "pending"
            ? "No pending posts. The cron runs every 2 hours, or generate one now."
            : status === "sent"
              ? "Nothing sent yet."
              : "Nothing skipped."}
        </div>
        {status === "pending" && (
          <Button onClick={onGenerate} size="sm" className="gap-2">
            <Sparkles className="w-4 h-4" /> Generate first post
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function PostCard({
  post,
  busy,
  onSend,
  onSkip,
}: {
  post: ConciergePost;
  busy: boolean;
  onSend: () => void;
  onSkip: () => void;
}) {
  const actionUrl = getPostActionUrl(post);
  const shareCaption = getShareCaption(post);
  const linkLabel = actionUrl.includes("/product/") ? "SteerSolo product link" : "SteerSolo link";

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="grid md:grid-cols-[180px_1fr] gap-4">
          {/* Image */}
          <div className="aspect-[4/5] bg-muted relative">
            {post.image_url ? (
              <img
                src={post.image_url}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <ImageIcon className="w-8 h-8" />
              </div>
            )}
              <Badge className="absolute top-2 left-2 text-[10px] font-bold uppercase shadow-sm border bg-background/80 text-foreground backdrop-blur-sm">
                {SLOT_LABELS[post.slot] ?? post.slot}
              </Badge>
              {post.target_group && (
                <Badge className={`absolute bottom-2 right-2 text-[10px] font-bold shadow-sm border backdrop-blur-sm ${TARGET_LABELS[post.target_group]?.color || ""}`}>
                  {TARGET_LABELS[post.target_group]?.label || post.target_group}
                </Badge>
              )}
            </div>

          {/* Content */}
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              <span>•</span>
              <StatusPill status={post.status} />
              <a
                href={actionUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-auto inline-flex items-center gap-1 text-primary hover:underline"
              >
                Preview link <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-sm whitespace-pre-wrap leading-relaxed">{shareCaption}</p>

            <a
              href={actionUrl}
              target="_blank"
              rel="noreferrer"
              className="group rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm transition-colors hover:bg-primary/10"
            >
              <span className="flex items-center gap-2 font-semibold text-primary">
                <LinkIcon className="w-4 h-4" />
                {linkLabel}
                <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
              <span className="mt-1 block break-all text-xs text-muted-foreground">{actionUrl}</span>
            </a>

            {post.status === "pending" && (
              <div className="flex flex-wrap gap-2 mt-auto pt-2">
                <Button onClick={onSend} disabled={busy} className="gap-2">
                  {busy ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send to Group
                </Button>
                <Button variant="ghost" onClick={onSkip} disabled={busy} className="gap-2">
                  <SkipForward className="w-4 h-4" />
                  Skip
                </Button>
              </div>
            )}

            {post.status === "sent" && (
              <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-auto pt-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Sent {post.sent_at
                  ? formatDistanceToNow(new Date(post.sent_at), { addSuffix: true })
                  : ""}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusPill({ status }: { status: ConciergeStatus }) {
  const map = {
    pending: { label: "Pending", className: "bg-amber-500/10 text-amber-600" },
    sent: { label: "Sent", className: "bg-green-500/10 text-green-600" },
    skipped: { label: "Skipped", className: "bg-muted text-muted-foreground" },
  } as const;
  const c = map[status];
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${c.className}`}>
      {c.label}
    </span>
  );
}
