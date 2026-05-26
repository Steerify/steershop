import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PACKAGE_PRICES: Record<string, number> = {
  // Drive Store Sales Tiers
  "spark": 12000,
  "boost": 28000,
  "scale": 55000,
  // Follower Growth Tiers
  "starter": 18000,
  "viral": 35000,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY")!;
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;
    const userEmail = claimsData.claims.email as string;

    const { 
      packageId, 
      businessName, 
      whatsappNumber, 
      storeUrl, 
      targetAudience, 
      estimatedBudget,
      callback_url 
    } = await req.json();

    const price = PACKAGE_PRICES[packageId];
    if (!price) {
      throw new Error(`Invalid package tier selected: ${packageId}`);
    }

    // Calculate Paystack fee: 1.5% + N100, capped at N2,000
    const fee = Math.min((price * 0.015) + 100, 2000);
    const totalAmountInNaira = price + fee;
    const totalInKobo = Math.round(totalAmountInNaira * 100);

    console.log(`Initializing Ads Payment for user ${userId}: ${packageId} (${price} NGN). Total in kobo: ${totalInKobo}`);

    // Initialize Paystack transaction
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
        amount: totalInKobo,
        currency: "NGN",
        callback_url: callback_url,
        metadata: {
          user_id: userId,
          type: "steerify_ads",
          package_id: packageId,
          business_name: businessName,
          whatsapp_number: whatsappNumber,
          store_url: storeUrl,
          target_audience: targetAudience,
          estimated_budget: estimatedBudget,
        },
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      throw new Error(paystackData.message || "Payment initialization failed");
    }

    return new Response(
      JSON.stringify({
        authorization_url: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
        amount: totalAmountInNaira,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("paystack-initialize-ads error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
