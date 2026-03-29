import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const normalizeOrigin = (value: string) => {
  try {
    return new URL(value).origin;
  } catch {
    return value.trim();
  }
};

const getAllowedOrigins = () => {
  const values = [
    Deno.env.get("CORS_ALLOWED_ORIGINS"),
    Deno.env.get("SITE_URL"),
    Deno.env.get("APP_URL"),
  ]
    .filter(Boolean)
    .flatMap((value) => value!.split(","))
    .map((value) => value.trim())
    .filter(Boolean)
    .map(normalizeOrigin);

  return [...new Set(values)];
};

const createCorsHeaders = (origin: string | null) => {
  const allowedOrigins = getAllowedOrigins();

  if (allowedOrigins.length === 0) {
    return {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      Vary: "Origin",
    };
  }

  const safeOrigin = origin && allowedOrigins.includes(normalizeOrigin(origin))
    ? normalizeOrigin(origin)
    : allowedOrigins[0];

  return {
    "Access-Control-Allow-Origin": safeOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = createCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");

    if (!supabaseUrl || !supabaseKey || !paystackSecretKey) {
      throw new Error("Service not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Parse request body for plan selection
    const body = await req.json().catch(() => ({}));
    const planSlug = typeof body.plan_slug === "string" ? body.plan_slug : "basic";
    const billingCycle = body.billing_cycle === "yearly" ? "yearly" : "monthly";

    console.log("Payment request:", { plan_slug: planSlug, billing_cycle: billingCycle, user_id: user.id });

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.email) {
      throw new Error("Profile not found");
    }

    // Get the selected subscription plan
    const { data: selectedPlan, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("slug", planSlug)
      .eq("is_active", true)
      .single();

    if (planError || !selectedPlan) {
      console.error("Plan not found:", planSlug);
      throw new Error("Invalid subscription plan");
    }

    // Calculate amount based on billing cycle
    let subscriptionAmount = selectedPlan.price_monthly;
    let subscriptionDays = 30;

    if (billingCycle === "yearly" && selectedPlan.price_yearly) {
      subscriptionAmount = selectedPlan.price_yearly;
      subscriptionDays = 365;
    }

    if (!Number.isFinite(subscriptionAmount) || subscriptionAmount <= 0) {
      throw new Error("Invalid subscription amount");
    }

    // Check for active subscription offer for shop owners
    const { data: activeOffer } = await supabase
      .from("special_offers")
      .select("*")
      .eq("target_audience", "shop_owners")
      .eq("is_active", true)
      .eq("applies_to_subscription", true)
      .or(`valid_until.is.null,valid_until.gte.${new Date().toISOString()}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let offerCode = null;
    const originalAmount = subscriptionAmount;

    if (activeOffer && activeOffer.discount_percentage) {
      const discount = subscriptionAmount * (activeOffer.discount_percentage / 100);
      subscriptionAmount = Math.max(0, Math.round(subscriptionAmount - discount));
      offerCode = activeOffer.code;
    }

    // Apply Paystack fee pass-through: 1.5% + 10000 kobo (NGN 100), capped at 200000 kobo (NGN 2,000)
    let paystackFee = Math.round(subscriptionAmount * 0.015) + 10000;
    if (paystackFee > 200000) paystackFee = 200000;
    const totalWithFee = subscriptionAmount + paystackFee;

    // Determine which plan code to use if any
    const planCode = billingCycle === "yearly"
      ? selectedPlan.paystack_plan_yearly
      : selectedPlan.paystack_plan_monthly;

    const callbackBase = Deno.env.get("SITE_URL") || Deno.env.get("APP_URL") || origin || "";
    const callbackUrl = callbackBase ? `${normalizeOrigin(callbackBase)}/dashboard?subscription=verify` : undefined;

    // Initialize Paystack transaction
    const paystackBody: Record<string, unknown> = {
      email: profile.email,
      amount: totalWithFee,
      currency: "NGN",
      metadata: {
        user_id: user.id,
        plan_id: selectedPlan.id,
        plan_slug: selectedPlan.slug,
        plan_name: selectedPlan.name,
        billing_cycle: billingCycle,
        subscription_days: subscriptionDays,
        offer_code: offerCode,
        original_amount: originalAmount,
      },
      callback_url: callbackUrl,
    };

    // If we have a plan code, add it to the request to make it a subscription
    if (planCode) {
      paystackBody.plan = planCode;
    }

    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paystackBody),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      console.error("Payment initialization failed:", {
        user_id: user.id,
        error: paystackData.message,
      });
      throw new Error(paystackData.message || "Payment initialization failed");
    }

    return new Response(
      JSON.stringify({
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        reference: paystackData.data.reference,
        plan: {
          name: selectedPlan.name,
          amount: subscriptionAmount,
          billing_cycle: billingCycle,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error initializing payment:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
