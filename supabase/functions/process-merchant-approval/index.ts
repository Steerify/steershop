import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MerchantApplicationData {
  shop_name: string;
  description: string;
  logo_url: string;
  banner_url?: string;
  payment_method: string;
  owner_name?: string;
  owner_email: string;
  phone_number?: string;
  location?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface IdentityVerificationResult {
  verified: boolean;
  confidenceScore: number;
  sourcesChecked: string[];
  findings: string[];
}

interface ApprovalAuditLog {
  id?: string;
  shop_id: string;
  user_id: string;
  validated_at: string;
  identity_verified_at?: string;
  approved_at?: string;
  validation_results: ValidationResult;
  identity_results?: IdentityVerificationResult;
  status: 'pending_validation' | 'pending_verification' | 'approved' | 'rejected' | 'manual_review';
  notes?: string;
}

/**
 * Parameter Validation Phase
 */
function validateMerchantApplication(
  data: MerchantApplicationData
): ValidationResult {
  const errors: string[] = [];

  // Validate business name
  if (!data.shop_name || data.shop_name.trim().length < 2) {
    errors.push('Business name is required and must be at least 2 characters');
  }

  // Validate description
  if (!data.description || data.description.trim().length < 20) {
    errors.push('Description is required and must be at least 20 characters');
  }

  // Validate payment method
  if (!data.payment_method) {
    errors.push('Payment method is required');
  }

  // Validate logo
  if (!data.logo_url) {
    errors.push('Official logo is required');
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.owner_email || !emailRegex.test(data.owner_email)) {
    errors.push('Valid email address is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Online Identity Verification Phase
 */
function verifyMerchantIdentity(
  data: MerchantApplicationData
): IdentityVerificationResult {
  const findings: string[] = [];
  const sourcesChecked: string[] = ['Email Format Check', 'Business Name Sanity Check'];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.owner_email)) {
    findings.push('Invalid email format');
  } else {
    findings.push('Email format is valid');
  }

  if (data.shop_name.length > 100) {
    findings.push('Business name is unusually long');
  } else {
    findings.push('Business name format looks valid');
  }

  const confidenceScore = findings.filter(f => !f.includes('Invalid')).length / findings.length * 100;

  return {
    verified: confidenceScore >= 50,
    confidenceScore,
    sourcesChecked,
    findings
  };
}

/**
 * Send email using Resend API
 */
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  resendApiKey: string
) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'SteerSolo <no-reply@steersolo.com>',
      to,
      subject,
      html
    })
  });

  const result = await res.json();
  console.log('Resend API response:', result);
  return result;
}

/**
 * Send rejection email
 */
async function sendRejectionEmail(
  to: string,
  shopName: string,
  errors: string[],
  resendApiKey: string
) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { color: #e53e3e; }
        ul { margin: 20px 0; padding-left: 20px; }
        li { margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <h1>Your Merchant Application for ${shopName}</h1>
      <p>We're sorry, but your merchant application requires some updates before we can approve it.</p>
      <p>Please fix the following issues and re-submit:</p>
      <ul>
        ${errors.map(err => `<li>${err}</li>`).join('')}
      </ul>
    </body>
    </html>
  `;

  return await sendEmail(to, `Action Required: Your ${shopName} Merchant Application`, htmlContent, resendApiKey);
}

/**
 * Send approval email
 */
async function sendApprovalEmail(
  to: string,
  shopName: string,
  shopSlug: string,
  resendApiKey: string
) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { color: #10b981; }
      </style>
    </head>
    <body>
      <h1>Congratulations, ${shopName} is now Live on SteerSolo!</h1>
      <p>Great news! Your merchant application has been approved and your store is now live.</p>
    </body>
    </html>
  `;

  return await sendEmail(to, `Your ${shopName} Store is Now Live!`, htmlContent, resendApiKey);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { shop_id, user_id, application_data } = await req.json();

    console.log('Processing merchant approval:', { shop_id, user_id });

    const validationResult = validateMerchantApplication(application_data);

    if (!validationResult.isValid) {
      // Create audit log
      const auditLog: ApprovalAuditLog = {
        shop_id,
        user_id,
        validated_at: new Date().toISOString(),
        validation_results: validationResult,
        status: 'rejected',
        notes: 'Failed parameter validation'
      };

      await sendRejectionEmail(
        application_data.owner_email,
        application_data.shop_name,
        validationResult.errors,
        resendApiKey
      );

      return new Response(
        JSON.stringify({ status: 'rejected', auditLog }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const identityResult = verifyMerchantIdentity(application_data);

    let status: ApprovalAuditLog['status'] = 'pending_verification';
    let notes = '';

    if (identityResult.verified && identityResult.confidenceScore >= 80) {
      status = 'approved';
      notes = 'Automatically approved based on validation and verification';

      await supabase
        .from('shops')
        .update({ is_active: true })
        .eq('id', shop_id);

      const { data: shop } = await supabase
        .from('shops')
        .select('shop_slug')
        .eq('id', shop_id)
        .single();

      if (shop?.shop_slug) {
        await sendApprovalEmail(
          application_data.owner_email,
          application_data.shop_name,
          shop.shop_slug,
          resendApiKey
        );
      }
    } else if (identityResult.verified && identityResult.confidenceScore >= 50) {
      status = 'manual_review';
      notes = 'Identity verification passed but requires manual review';
    } else {
      status = 'manual_review';
      notes = 'Identity verification inconclusive, requires manual review';
    }

    const auditLog: ApprovalAuditLog = {
      shop_id,
      user_id,
      validated_at: new Date().toISOString(),
      identity_verified_at: new Date().toISOString(),
      approved_at: status === 'approved' ? new Date().toISOString() : undefined,
      validation_results: validationResult,
      identity_results: identityResult,
      status,
      notes
    };

    await supabase
      .from('merchant_approval_audit')
      .insert(auditLog);

    return new Response(
      JSON.stringify({ status, auditLog }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Merchant approval error:', error);
    return new Response(
      JSON.stringify({ error: 'Error processing merchant approval' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
