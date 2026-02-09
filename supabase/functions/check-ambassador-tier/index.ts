import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify user
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    // Use service role for privileged operations
    const admin = createClient(supabaseUrl, supabaseServiceKey);

    // Count rewarded referrals
    const { count, error: countError } = await admin
      .from("referrals")
      .select("*", { count: "exact", head: true })
      .eq("referrer_id", userId)
      .eq("status", "rewarded");

    if (countError) throw countError;
    const rewardedCount = count || 0;

    // Check existing tiers
    const { data: existingTiers } = await admin
      .from("ambassador_tiers")
      .select("tier, reward_claimed")
      .eq("user_id", userId);

    const reached = new Set((existingTiers || []).map((t: any) => t.tier));
    const tiersReached: string[] = [];
    const rewardsGranted: string[] = [];

    // Bronze: 10 referrals → free month
    if (rewardedCount >= 10 && !reached.has("bronze")) {
      // Get current profile
      const { data: profile } = await admin
        .from("profiles")
        .select("subscription_expires_at, is_subscribed")
        .eq("id", userId)
        .single();

      const now = new Date();
      const currentExpiry = profile?.subscription_expires_at
        ? new Date(profile.subscription_expires_at)
        : now;
      const baseDate = currentExpiry > now ? currentExpiry : now;
      const newExpiry = new Date(baseDate);
      newExpiry.setDate(newExpiry.getDate() + 30);

      await admin
        .from("profiles")
        .update({
          subscription_expires_at: newExpiry.toISOString(),
          is_subscribed: true,
        })
        .eq("id", userId);

      await admin.from("subscription_history").insert({
        user_id: userId,
        event_type: "ambassador_reward",
        plan_name: "Ambassador Bronze Reward",
        notes: "Free 30-day subscription for reaching 10 referrals",
        previous_expiry_at: profile?.subscription_expires_at || null,
        new_expiry_at: newExpiry.toISOString(),
      });

      await admin.from("ambassador_tiers").insert({
        user_id: userId,
        tier: "bronze",
        reward_claimed: true,
        claimed_at: now.toISOString(),
      });

      tiersReached.push("bronze");
      rewardsGranted.push("Free 30-day subscription");
    }

    // Silver: 50 referrals → featured shop
    if (rewardedCount >= 50 && !reached.has("silver")) {
      // Get user's shop
      const { data: shop } = await admin
        .from("shops")
        .select("id, shop_name")
        .eq("owner_id", userId)
        .single();

      if (shop) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await admin.from("featured_shops").upsert(
          {
            shop_id: shop.id,
            is_active: true,
            expires_at: expiresAt.toISOString(),
            label: "Ambassador",
            tagline: "Top referrer — Ambassador reward",
          },
          { onConflict: "shop_id" }
        );

        rewardsGranted.push("Shop featured for 30 days");
      }

      await admin.from("ambassador_tiers").insert({
        user_id: userId,
        tier: "silver",
        reward_claimed: true,
        claimed_at: new Date().toISOString(),
      });

      tiersReached.push("silver");
    }

    // Gold: 100 referrals → reseller status
    if (rewardedCount >= 100 && !reached.has("gold")) {
      await admin
        .from("profiles")
        .update({ is_reseller: true })
        .eq("id", userId);

      await admin.from("ambassador_tiers").insert({
        user_id: userId,
        tier: "gold",
        reward_claimed: true,
        claimed_at: new Date().toISOString(),
      });

      tiersReached.push("gold");
      rewardsGranted.push("Reseller status unlocked");
    }

    return new Response(
      JSON.stringify({
        success: true,
        rewarded_count: rewardedCount,
        tiers_reached: tiersReached,
        rewards_granted: rewardsGranted,
        existing_tiers: Array.from(reached),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Ambassador tier check error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
