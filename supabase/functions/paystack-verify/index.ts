import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const isSafeReference = (value: string) => /^[A-Za-z0-9_-]{6,128}$/.test(value);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reference } = await req.json().catch(() => ({}));

    if (!reference || typeof reference !== "string" || !isSafeReference(reference)) {
      throw new Error("A valid payment reference is required");
    }

    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!paystackSecretKey || !supabaseUrl || !supabaseKey) {
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

    // Prevent replay/reference reuse
    const { data: alreadyProcessed } = await supabase
      .from("profiles")
      .select("payment_reference")
      .eq("id", user.id)
      .eq("payment_reference", reference)
      .maybeSingle();

    if (alreadyProcessed?.payment_reference) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Payment already verified",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // Verify payment with Paystack
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
      },
    });

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok || !verifyData.status || verifyData.data?.status !== "success") {
      throw new Error("Payment verification failed");
    }

    const metadata = verifyData.data.metadata || {};

    if (metadata.user_id !== user.id) {
      throw new Error("Payment reference does not belong to user");
    }

    if (verifyData.data.currency !== "NGN" || !Number.isFinite(verifyData.data.amount) || verifyData.data.amount <= 0) {
      throw new Error("Invalid payment payload");
    }

    const planId = metadata.plan_id;
    const billingCycle = metadata.billing_cycle === "yearly" ? "yearly" : "monthly";
    const parsedSubscriptionDays = Number(metadata.subscription_days ?? 30);
    const subscriptionDays = Number.isFinite(parsedSubscriptionDays) ? parsedSubscriptionDays : 30;

    // Get current subscription expiry
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("subscription_expires_at")
      .eq("id", user.id)
      .single();

    // Calculate new expiry date
    let newExpiryDate = new Date();

    if (currentProfile?.subscription_expires_at) {
      const currentExpiry = new Date(currentProfile.subscription_expires_at);
      // If subscription hasn't expired yet, extend from current expiry
      if (currentExpiry > newExpiryDate) {
        newExpiryDate = currentExpiry;
      }
    }

    // Clamp to sane duration to avoid metadata tampering
    const safeDays = Number.isFinite(subscriptionDays) && subscriptionDays > 0
      ? Math.min(subscriptionDays, 366)
      : 30;

    newExpiryDate.setDate(newExpiryDate.getDate() + safeDays);

    // Update user profile with subscription info
    const updateData: Record<string, unknown> = {
      is_subscribed: true,
      subscription_expires_at: newExpiryDate.toISOString(),
      subscription_type: billingCycle,
      payment_reference: reference,
    };

    if (planId) {
      updateData.subscription_plan_id = planId;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      throw new Error("Failed to update profile");
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscription_expires_at: newExpiryDate.toISOString(),
        plan_id: planId,
        billing_cycle: billingCycle,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Verification error:", error);
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
