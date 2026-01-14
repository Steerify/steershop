import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  type: 'level1' | 'level2';
  userId?: string;
  bvn?: string;
  firstName?: string;
  lastName?: string;
  accountNumber?: string;
  bankCode?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Identity verification request received");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
       console.error("Missing Supabase configuration");
       throw new Error("Server configuration error: Missing Supabase keys");
    }

    if (!PAYSTACK_SECRET_KEY) {
      console.error("Missing Paystack configuration");
      throw new Error("Server configuration error: Missing Paystack key");
    }

    // Use service role client for database updates
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user's JWT from the headers to verify ownership
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      console.error("Auth error:", authError);
      throw new Error("Unauthorized");
    }

    const body = await req.json();
    const { type, bvn, firstName, lastName, accountNumber, bankCode }: VerificationRequest = body;

    console.log(`Processing ${type} verification for user: ${user.id}`);

    if (type === 'level1') {
        // BVN Verification
        if (!bvn || !firstName || !lastName) {
            throw new Error("Missing required fields for Level 1 verification (BVN, first name, last name)");
        }

        // Call Paystack Resolve BVN API
        console.log(`Calling Paystack BVN verification for ${firstName} ${lastName}`);
        const paystackResponse = await fetch(`https://api.paystack.co/bank/resolve_bvn/${bvn}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
        });

        const paystackData = await paystackResponse.json();

        if (!paystackResponse.ok) {
            console.error("Paystack BVN API Error:", {
              status: paystackResponse.status,
              message: paystackData.message,
              data: paystackData
            });
            
            // Handle specific 451 status code for unavailable features
            if (paystackResponse.status === 451) {
              throw new Error("BVN verification service is currently unavailable. Please use Bank Account Verification instead.");
            }
            
            // Handle feature_unavailable error type
            if (paystackData.message?.toLowerCase().includes('feature') || 
                paystackData.message?.toLowerCase().includes('unavailable') ||
                paystackData.message?.toLowerCase().includes('not enabled')) {
              throw new Error("BVN verification is currently being activated. Please use Bank Account Verification instead.");
            }
            
            throw new Error(paystackData.message || "BVN Verification failed. Please check your BVN and try again.");
        }

        const bvnData = paystackData.data;
        const bvnFirstName = (bvnData.first_name || "").toLowerCase();
        const bvnLastName = (bvnData.last_name || "").toLowerCase();

        // Simple fuzzy match check
        const matchFirst = bvnFirstName.includes(firstName.toLowerCase()) || firstName.toLowerCase().includes(bvnFirstName);
        const matchLast = bvnLastName.includes(lastName.toLowerCase()) || lastName.toLowerCase().includes(bvnLastName);

        if (!matchFirst || !matchLast) {
             console.error("Name mismatch:", { provided: { firstName, lastName }, paystack: { bvnFirstName, bvnLastName } });
             throw new Error(`Name mismatch. BVN record shows ${bvnData.first_name} ${bvnData.last_name}`);
        }

        // Update user profile with KYC Level 1 status
        console.log("Updating profile with BVN verification for user:", user.id);
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            bvn_verified: true,
            bvn_verified_at: new Date().toISOString(),
            kyc_level: 1,
            full_name: `${bvnData.first_name} ${bvnData.last_name}` // Update with verified name
          })
          .eq('id', user.id);

        if (updateError) {
          console.error("Failed to update profile with BVN verification:", updateError);
          // Don't fail the verification, just log it
        } else {
          console.log("Successfully updated profile with BVN verification");
        }

        return new Response(
            JSON.stringify({ 
                success: true, 
                status: "VERIFIED",
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
            throw new Error("Missing required fields for Level 2 verification (account number, bank code)");
        }

        console.log(`Calling Paystack Account verification: ${accountNumber} (${bankCode})`);
        const paystackResponse = await fetch(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
        });

        const paystackData = await paystackResponse.json();

        if (!paystackResponse.ok) {
             console.error("Paystack Bank Account API Error:", {
               status: paystackResponse.status,
               message: paystackData.message,
               data: paystackData
             });
             throw new Error(paystackData.message || "Account verification failed. Please check your account details.");
        }

        const accountData = paystackData.data;
        
        // Match account name with profile full name if possible
        const { data: profile } = await supabaseAdmin.from('profiles').select('full_name').eq('id', user.id).single();
        
        if (profile?.full_name) {
             const accountName = accountData.account_name.toLowerCase();
             const profileName = profile.full_name.toLowerCase();
             
             // Check if names overlap
             const nameParts = profileName.split(' ');
             const matches = nameParts.some((part: string) => part.length > 2 && accountName.includes(part));
             
             if (!matches) {
                 console.warn("Account name mismatch warning:", { accountName, profileName });
                 // Continue anyway - Paystack has verified the account exists
             }
        }

        // Update profile with KYC Level 2 status
        console.log("Updating profile with bank verification for user:", user.id);
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({
            bank_verified: true,
            bank_verified_at: new Date().toISOString(),
            kyc_level: 2,
            verified_bank_account_name: accountData.account_name
          })
          .eq('id', user.id);

        if (profileError) {
          console.error("Failed to update profile with bank verification:", profileError);
        } else {
          console.log("Successfully updated profile with bank verification");
        }

        // Update shop bank details
        console.log("Updating shop bank details for user:", user.id);
        const { error: updateError } = await supabaseAdmin
            .from('shops')
            .update({
                bank_account_number: accountNumber,
                settlement_bank_code: bankCode,
                bank_account_name: accountData.account_name,
                bank_name: "Verified Account"
            })
            .eq('owner_id', user.id);

        if (updateError) {
            console.error("Database update error for shop:", updateError);
        }

        return new Response(
            JSON.stringify({ 
                success: true, 
                status: "VERIFIED",
                account_name: accountData.account_name,
                message: "Account Verified Successfully", 
                data: accountData 
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
    console.error("Verification Error:", error.message);
    return new Response(
      JSON.stringify({ 
          error: error.message,
          success: false
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
};

serve(handler);
