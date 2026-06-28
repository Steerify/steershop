import { supabase } from '@/integrations/supabase/client';

export interface MerchantApplicationData {
  shop_name: string;
  description: string;
  logo_url: string;
  banner_url?: string;
  payment_method: string;
  owner_name: string;
  owner_email: string;
  phone_number: string;
  location: string;
  bvn?: string; // Bank Verification Number for Nigerian vendors
  cac_number?: string; // Corporate Affairs Commission registration number
  address_proof?: string; // URL to address proof document
  id_proof?: string; // URL to government-issued ID
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface IdentityVerificationResult {
  verified: boolean;
  confidenceScore: number;
  sourcesChecked: string[];
  findings: string[];
}

export interface ApprovalAuditLog {
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
 * Validates that all required merchant application fields are correctly filled
 */
export async function validateMerchantApplication(
  data: MerchantApplicationData
): Promise<ValidationResult> {
  const errors: string[] = [];

  // Validate business name
  if (!data.shop_name || data.shop_name.trim().length < 3) {
    errors.push('Business name is required and must be at least 3 characters');
  }

  // Validate description
  if (!data.description || data.description.trim().length < 50) {
    errors.push('Description is required and must be at least 50 characters');
  }

  // Validate payment method configuration
  if (!data.payment_method) {
    errors.push('Payment method is required');
  }

  // Validate logo is present
  if (!data.logo_url) {
    errors.push('Official logo is required');
  }

  // Validate owner name
  if (!data.owner_name || data.owner_name.trim().length < 3) {
    errors.push('Owner full name is required and must be at least 3 characters');
  }

  // Validate phone number (Nigerian format check: starts with 0, 11 digits)
  const phoneRegex = /^0\d{10}$/;
  if (!data.phone_number || !phoneRegex.test(data.phone_number)) {
    errors.push('Valid Nigerian phone number (11 digits starting with 0) is required');
  }

  // Validate location
  if (!data.location || data.location.trim().length < 5) {
    errors.push('Location (city + state) is required and must be at least 5 characters');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.owner_email || !emailRegex.test(data.owner_email)) {
    errors.push('Valid email address is required');
  }

  // Optional but recommended: BVN, CAC, address proof, ID proof
  const recommendations: string[] = [];
  if (!data.bvn) recommendations.push('BVN (Bank Verification Number) is recommended for full verification');
  if (!data.cac_number && !data.shop_name.toLowerCase().includes('enterprise')) recommendations.push('CAC registration number is recommended for business verification');
  if (!data.id_proof) recommendations.push('Government-issued ID proof is recommended');
  if (!data.address_proof) recommendations.push('Address proof (utility bill, etc.) is recommended');

  // Add recommendations as warnings (but don't fail validation for them)
  if (recommendations.length > 0) {
    // For now, just log, but we could add to a separate warnings array
    console.log('Verification recommendations:', recommendations);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Online Identity Verification Phase
 * (Simulated for now - would integrate with real verification services)
 */
export async function verifyMerchantIdentity(
  data: MerchantApplicationData
): Promise<IdentityVerificationResult> {
  const findings: string[] = [];
  const sourcesChecked: string[] = ['Email Format Check', 'Business Name Sanity Check'];

  // Simple email format check (already done, but including as verification step)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.owner_email)) {
    findings.push('Invalid email format');
  } else {
    findings.push('Email format is valid');
  }

  // Business name sanity check
  if (data.shop_name.length > 100) {
    findings.push('Business name is unusually long');
  } else {
    findings.push('Business name format looks valid');
  }

  // Calculate confidence score
  const confidenceScore = findings.filter(f => !f.includes('Invalid')).length / findings.length * 100;

  return {
    verified: confidenceScore >= 50,
    confidenceScore,
    sourcesChecked,
    findings
  };
}

/**
 * Send rejection email using Resend API
 */
export async function sendRejectionEmail(
  to: string,
  shopName: string,
  errors: string[]
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
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>Your Merchant Application for ${shopName}</h1>
      <p>We're sorry, but your merchant application requires some updates before we can approve it.</p>
      <p>Please fix the following issues and re-submit:</p>
      <ul>
        ${errors.map(err => `<li>${err}</li>`).join('')}
      </ul>
      <p>If you have any questions, please reply to this email or contact our support team.</p>
      <div class="footer">
        <p>Best regards,<br>The SteerSolo Team</p>
      </div>
    </body>
    </html>
  `;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.functions.invoke('send-notification-email', {
      body: {
        type: 'custom',
        to,
        subject: `Action Required: Your ${shopName} Merchant Application`,
        html: htmlContent
      },
      headers: session?.access_token ? {
        Authorization: `Bearer ${session.access_token}`
      } : undefined
    });

    if (error) {
      console.error('Error sending rejection email:', error);
    }
  } catch (err) {
    console.error('Failed to send rejection email:', err);
  }
}

/**
 * Send approval email using Resend API
 */
export async function sendApprovalEmail(
  to: string,
  shopName: string,
  shopSlug: string
) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { color: #10b981; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>Congratulations, ${shopName} is now Live on SteerSolo!</h1>
      <p>Great news! Your merchant application has been approved and your store is now live.</p>
      <p>You can view your storefront here: <a href="${window.location.origin}/shop/${shopSlug}">${window.location.origin}/shop/${shopSlug}</a></p>
      <p>Welcome to the SteerSolo community!</p>
      <div class="footer">
        <p>Best regards,<br>The SteerSolo Team</p>
      </div>
    </body>
    </html>
  `;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.functions.invoke('send-notification-email', {
      body: {
        type: 'custom',
        to,
        subject: `Your ${shopName} Store is Now Live!`,
        html: htmlContent
      },
      headers: session?.access_token ? {
        Authorization: `Bearer ${session.access_token}`
      } : undefined
    });

    if (error) {
      console.error('Error sending approval email:', error);
    }
  } catch (err) {
    console.error('Failed to send approval email:', err);
  }
}

/**
 * Automated Approval Execution
 */
export async function processMerchantApproval(
  shopId: string,
  userId: string,
  applicationData: MerchantApplicationData
): Promise<{ status: string; auditLog: ApprovalAuditLog }> {
  // Step 1: Parameter Validation Phase
  const validationResult = await validateMerchantApplication(applicationData);

  if (!validationResult.isValid) {
    // Create audit log for rejection
    const auditLog: ApprovalAuditLog = {
      shop_id: shopId,
      user_id: userId,
      validated_at: new Date().toISOString(),
      validation_results: validationResult,
      status: 'rejected',
      notes: 'Failed parameter validation'
    };

    await sendRejectionEmail(applicationData.owner_email, applicationData.shop_name, validationResult.errors);
    return { status: 'rejected', auditLog };
  }

  // Step 2: Online Identity Verification Phase
  const identityResult = await verifyMerchantIdentity(applicationData);

  // Step 3: Decide next steps
  let status: ApprovalAuditLog['status'] = 'pending_verification';
  let notes = '';

  if (identityResult.verified && identityResult.confidenceScore >= 80) {
    status = 'approved';
    notes = 'Automatically approved based on validation and verification';

    // Approve the shop in the database
    await supabase
      .from('shops')
      .update({ is_active: true })
      .eq('id', shopId);

    // Send approval email
    const { data: shop } = await supabase
      .from('shops')
      .select('shop_slug')
      .eq('id', shopId)
      .single();

    if (shop?.shop_slug) {
      await sendApprovalEmail(applicationData.owner_email, applicationData.shop_name, shop.shop_slug);
    }
  } else if (identityResult.verified && identityResult.confidenceScore >= 50) {
    status = 'manual_review';
    notes = 'Identity verification passed but requires manual review';
  } else {
    status = 'manual_review';
    notes = 'Identity verification inconclusive, requires manual review';
  }

  // Create audit log
  const auditLog: ApprovalAuditLog = {
    shop_id: shopId,
    user_id: userId,
    validated_at: new Date().toISOString(),
    identity_verified_at: new Date().toISOString(),
    approved_at: status === 'approved' ? new Date().toISOString() : undefined,
    validation_results: validationResult,
    identity_results: identityResult,
    status,
    notes
  };

  return { status, auditLog };
}

const merchantApprovalService = {
  validateMerchantApplication,
  verifyMerchantIdentity,
  sendRejectionEmail,
  sendApprovalEmail,
  processMerchantApproval
};

export default merchantApprovalService;
