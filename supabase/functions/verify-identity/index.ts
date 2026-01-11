import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  type: 'level1' | 'level2';
  userId?: string; // Optional if we want to update profile directly
  bvn?: string;
  firstName?: string;
  lastName?: string;
  accountNumber?: string;
  bankCode?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { type, bvn, firstName, lastName, accountNumber, bankCode }: VerificationRequest = await req.json();
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

    if (!PAYSTACK_SECRET_KEY) {
      throw new Error("Server configuration error: Missing Paystack key");
    }

    if (type === 'level1') {
        // BVN Verification
        if (!bvn || !firstName || !lastName) {
            throw new Error("Missing required fields for Level 1 verification");
        }

        // Call Paystack Resolve BVN API
        const paystackResponse = await fetch(`https://api.paystack.co/bank/resolve_bvn/${bvn}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
        });

        const paystackData = await paystackResponse.json();

        if (!paystackResponse.ok) {
            console.error("Paystack API Error:", paystackData);
            throw new Error(paystackData.message || "BVN Verification failed");
        }

        // Logic to match names can be added here.
        // For now, we return the data and let the frontend/logic decide, or we enforce strict matching.
        // Assuming strict matching is desired for security.
        
        const bvnData = paystackData.data;
        const bvnFirstName = bvnData.first_name.toLowerCase();
        const bvnLastName = bvnData.last_name.toLowerCase();

        // Simple fuzzy match check (contains)
        if (!bvnFirstName.includes(firstName.toLowerCase()) && !firstName.toLowerCase().includes(bvnFirstName)) {
             throw new Error("First name does not match BVN record");
        }
        if (!bvnLastName.includes(lastName.toLowerCase()) && !lastName.toLowerCase().includes(bvnLastName)) {
             throw new Error("Last name does not match BVN record");
        }
        
        return new Response(
            JSON.stringify({ 
                success: true, 
                message: "BVN Verified Successfully", 
                data: bvnData 
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );

    } else if (type === 'level2') {
        // Bank Account Verification
        if (!accountNumber || !bankCode) {
            throw new Error("Missing required fields for Level 2 verification");
        }

        const paystackResponse = await fetch(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
        });

        const paystackData = await paystackResponse.json();

        if (!paystackResponse.ok) {
             console.error("Paystack API Error:", paystackData);
             throw new Error(paystackData.message || "Account Verification failed");
        }

        return new Response(
            JSON.stringify({ 
                success: true, 
                message: "Account Verified Successfully", 
                data: paystackData.data 
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );
    } else {
        throw new Error("Invalid verification type");
    }

  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
};

serve(handler);
