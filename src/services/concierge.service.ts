import { supabase } from "@/integrations/supabase/client";

export type ConciergeStatus = "pending" | "sent" | "skipped";
export type ConciergeSlot =
  | "morning_pick"
  | "new_arrivals"
  | "lunch_deal"
  | "shop_spotlight"
  | "top5"
  | "featured_store"
  | "conversation"
  | "tech_insight"
  | "community_poll"
  | "founder_story"
  | "sales_tip"
  | "platform_feature"
  | "merchant_win";

export type TargetGroup = "marketplace" | "foundry" | "vendor";

export interface ConciergePost {
  id: string;
  target_group: TargetGroup;
  slot: ConciergeSlot;
  shop_id: string | null;
  product_ids: string[] | null;
  caption: string;
  image_url: string | null;
  link_url: string;
  status: ConciergeStatus;
  scheduled_for: string;
  sent_at: string | null;
  sent_by: string | null;
  skipped_at: string | null;
  skipped_by: string | null;
  meta: Record<string, any> | null;
  created_at: string;
}

export interface ConciergeMetrics {
  generated_7d: number;
  sent_7d: number;
  skipped_7d: number;
  clicks_7d: number;
}

const conciergeService = {
  async listPosts(status?: ConciergeStatus, limit = 50): Promise<ConciergePost[]> {
    // Build the full query chain — Supabase builder is immutable so each
    // method MUST be chained inline; storing intermediate references and
    // calling .eq() on them separately silently drops the filter.
    let q = supabase
      .from("marketing_queue" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) q = q.eq("status", status) as any;

    const { data, error } = await q;
    if (error) throw error;
    return (data || []) as unknown as ConciergePost[];
  },

  async generateNow(slot?: ConciergeSlot, group?: TargetGroup): Promise<ConciergePost[]> {
    const body: any = {};
    if (slot) body.slot = slot;
    if (group) body.group = group;

    const res = await fetch("/api/concierge-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Generation failed: ${res.status} ${errorText}`);
    }
    
    const data = await res.json();
    if (!data?.ok) throw new Error(data?.error || "Generation failed");
    return data.posts as ConciergePost[];
  },

  async markSent(postId: string): Promise<void> {
    const { error } = await supabase
      .from("marketing_queue" as any)
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", postId);
    if (error) throw error;
  },

  async skip(postId: string): Promise<void> {
    const { error } = await supabase
      .from("marketing_queue" as any)
      .update({ status: "skipped", skipped_at: new Date().toISOString() })
      .eq("id", postId);
    if (error) throw error;
  },

  async metrics(): Promise<ConciergeMetrics> {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const [genRes, metricRes] = await Promise.all([
      supabase
        .from("marketing_queue" as any)
        .select("status", { count: "exact" })
        .gte("created_at", since),
      supabase
        .from("marketing_metrics" as any)
        .select("event")
        .gte("created_at", since),
    ]);

    const rows = (genRes.data || []) as any[];
    const events = (metricRes.data || []) as any[];

    return {
      generated_7d: rows.length,
      sent_7d: rows.filter((r) => r.status === "sent").length,
      skipped_7d: rows.filter((r) => r.status === "skipped").length,
      clicks_7d: events.filter((e) => e.event === "click").length,
    };
  },

  subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('marketing_queue_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'marketing_queue' },
        callback
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'marketing_queue' },
        callback
      )
      .subscribe();
  },
};

export default conciergeService;
