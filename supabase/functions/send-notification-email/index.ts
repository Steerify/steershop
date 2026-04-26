import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: 'profile_incomplete' | 'subscription_expiring' | 'milestone_achieved' | 'setup_complete' | 'store_approved' | 'signup_success' | 'subscription_success';
  user_id?: string;
  data?: Record<string, any>;
}

const getEmailTemplate = (type: string, data: Record<string, any>) => {
  const baseStyles = `font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;`;
  const buttonStyle = `display: inline-block; background: linear-gradient(135deg, #D4AF37, #C5A028); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;`;

  switch (type) {
    case 'profile_incomplete':
      return {
        subject: 'Your SteerSolo store is almost ready!',
        html: `<div style="${baseStyles}">
          <h1 style="color: #D4AF37;">Almost There, ${data.name || 'Entrepreneur'}!</h1>
          <p>Your SteerSolo store is waiting for you to complete the setup.</p>
          <p>A complete profile increases your chances of making sales!</p>
          <a href="${data.dashboardUrl || 'https://steersolo.com/dashboard'}" style="${buttonStyle}">
            Complete My Store Setup
          </a>
          <p style="color: #666; margin-top: 30px; font-size: 14px;">
            You're doing great! Keep pushing - The SteerSolo Team
          </p>
        </div>`,
      };

    case 'subscription_expiring':
      return {
        subject: 'Your SteerSolo subscription expires soon',
        html: `<div style="${baseStyles}">
          <h1 style="color: #D4AF37;">Don't Let Your Hustle Stop!</h1>
          <p>Hi ${data.name || 'there'},</p>
          <p>Your SteerSolo subscription expires in <strong>${data.daysRemaining || 3} days</strong>.</p>
          <p>Renew now to keep your store live and continue making sales!</p>
          <a href="${data.pricingUrl || 'https://steersolo.com/pricing'}" style="${buttonStyle}">
            Renew Subscription
          </a>
          <p style="color: #666; margin-top: 30px; font-size: 14px;">
            Keep the momentum going! - The SteerSolo Team
          </p>
        </div>`,
      };

    case 'milestone_achieved':
      return {
        subject: `Congratulations! You earned the "${data.badgeName}" badge!`,
        html: `<div style="${baseStyles} text-align: center;">
          <h1 style="color: #D4AF37;">You Did It!</h1>
          <div style="font-size: 64px; margin: 20px 0;">🏆</div>
          <h2>${data.badgeName || 'Achievement Unlocked'}</h2>
          <p style="color: #666;">${data.badgeDescription || 'You reached an amazing milestone!'}</p>
          <a href="${data.dashboardUrl || 'https://steersolo.com/dashboard'}" style="${buttonStyle}">
            View My Badges
          </a>
          <p style="color: #666; margin-top: 30px; font-size: 14px;">
            You're a legend! - The SteerSolo Team
          </p>
        </div>`,
      };

    case 'setup_complete':
      return {
        subject: 'Your store is ready! Time to start selling!',
        html: `<div style="${baseStyles}">
          <h1 style="color: #D4AF37;">Your Store is Live!</h1>
          <p>Hi ${data.name || 'there'},</p>
          <p>Great news! Our team has finished setting up your SteerSolo store.</p>
          <p>Store Name: ${data.storeName || 'Your Store'}</p>
          <p>Share your store link with customers and start making sales today!</p>
          <a href="${data.storeUrl || 'https://steersolo.com/dashboard'}" style="${buttonStyle}">
            View My Store
          </a>
          <p style="color: #666; margin-top: 30px; font-size: 14px;">
            Go make those sales! - The SteerSolo Team
          </p>
        </div>`,
      };

    case 'store_approved':
      return {
        subject: `🎉 Your store "${data.storeName || 'Store'}" has been approved`,
        html: `<div style="${baseStyles} background: #FAFAF8; border: 1px solid #E8E5DD; border-radius: 16px; padding: 0; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #123C72, #0EA46E); color: #fff; padding: 24px 24px 20px;">
            <p style="margin: 0; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; opacity: .9;">SteerSolo Admin Update</p>
            <h1 style="margin: 8px 0 0; font-size: 26px; line-height: 1.2;">Your store is now approved ✅</h1>
          </div>

          <div style="padding: 24px;">
            <p style="margin-top: 0; color: #1D2939; font-size: 15px;">Hi ${data.name || 'there'},</p>
            <p style="color: #344054; line-height: 1.7; font-size: 15px;">
              Congratulations! Your storefront <strong>${data.storeName || 'Store'}</strong> has successfully passed review and is now live for customers.
            </p>

            <div style="background: #FFFFFF; border: 1px solid #E4E7EC; border-radius: 12px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0 0 8px; color: #0EA46E; font-weight: 700;">What you can do now:</p>
              <ul style="margin: 0; padding-left: 18px; color: #475467; line-height: 1.7;">
                <li>Share your store link on WhatsApp, Instagram, and other channels.</li>
                <li>Upload fresh products and services to attract more buyers.</li>
                <li>Track orders and performance from your dashboard.</li>
              </ul>
            </div>

            <div style="margin: 22px 0 8px;">
              <a href="${data.storefrontUrl || data.dashboardUrl || 'https://steersolo.com/dashboard'}" style="${buttonStyle} margin-right: 10px;">
                View My Live Store
              </a>
              <a href="${data.dashboardUrl || 'https://steersolo.com/dashboard'}" style="display: inline-block; color: #123C72; text-decoration: none; font-weight: 600; font-size: 14px;">
                Open Dashboard →
              </a>
            </div>

            <p style="color: #667085; margin-top: 22px; font-size: 13px;">
              Need support? Reply to this email and our team will help you quickly.
            </p>
          </div>
        </div>`,
      };

    case 'signup_success':
      return {
        subject: 'Welcome to SteerSolo! Your journey begins 🚀',
        html: `<div style="${baseStyles} background: #FAFAF8; border: 1px solid #E8E5DD; border-radius: 16px; padding: 0; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #123C72, #0EA46E); color: #fff; padding: 24px 24px 20px;">
            <h1 style="margin: 8px 0 0; font-size: 26px; line-height: 1.2;">Welcome, ${data.name || 'Entrepreneur'}! 👋</h1>
          </div>
          <div style="padding: 24px;">
            <p style="margin-top: 0; color: #1D2939; font-size: 15px;">Your SteerSolo account has been successfully created.</p>
            <p style="color: #344054; line-height: 1.7; font-size: 15px;">
              You're now part of a community of Nigerian solo entrepreneurs building structured and profitable digital businesses.
            </p>
            <div style="background: #FFFFFF; border: 1px solid #E4E7EC; border-radius: 12px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0 0 8px; color: #0EA46E; font-weight: 700;">Next steps:</p>
              <ul style="margin: 0; padding-left: 18px; color: #475467; line-height: 1.7;">
                <li>Set up your storefront and add your products.</li>
                <li>Verify your identity to unlock payouts.</li>
                <li>Share your link to start getting orders.</li>
              </ul>
            </div>
            <div style="margin: 22px 0 8px;">
              <a href="${data.dashboardUrl || 'https://steersolo.com/dashboard'}" style="${buttonStyle}">
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>`,
      };

    case 'subscription_success':
      return {
        subject: 'Subscription Activated! 🎉',
        html: `<div style="${baseStyles} background: #FAFAF8; border: 1px solid #E8E5DD; border-radius: 16px; padding: 0; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #D4AF37, #C5A028); color: #fff; padding: 24px 24px 20px;">
            <h1 style="margin: 8px 0 0; font-size: 26px; line-height: 1.2;">Subscription Active ✅</h1>
          </div>
          <div style="padding: 24px;">
            <p style="margin-top: 0; color: #1D2939; font-size: 15px;">Hi ${data.name || 'there'},</p>
            <p style="color: #344054; line-height: 1.7; font-size: 15px;">
              Your subscription payment was successful. Your SteerSolo store is fully active and visible to customers!
            </p>
            <div style="margin: 22px 0 8px;">
              <a href="${data.dashboardUrl || 'https://steersolo.com/dashboard'}" style="${buttonStyle}">
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>`,
      };

    default:
      return {
        subject: 'SteerSolo Notification',
        html: '<p>You have a new notification from SteerSolo.</p>',
      };
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'SteerSolo <onboarding@resend.dev>';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { type, user_id, data = {} }: NotificationRequest = await req.json();

    console.log('Sending notification:', { type, user_id });

    // Get user email
    let email: string;
    let userName: string;

    if (user_id) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', user_id)
        .single();

      if (error || !profile?.email) {
        throw new Error('User not found');
      }

      email = profile.email;
      userName = profile.full_name || '';
    } else if (data.email) {
      email = data.email;
      userName = data.name || '';
    } else {
      throw new Error('No user_id or email provided');
    }

    const template = getEmailTemplate(type, { ...data, name: data.name || userName });

    const emailPayload: any = {
      from: fromEmail,
      to: [email],
      subject: template.subject,
      html: template.html,
    };

    if (type === 'signup_success' || type === 'subscription_success') {
      emailPayload.cc = ['steerifygroup@gmail.com'];
    }

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error('Email send error:', emailResult);
      throw new Error(emailResult.message || 'Failed to send email');
    }

    // Log notification sent
    if (user_id) {
      await supabase
        .from('subscription_notifications')
        .insert({
          user_id: user_id,
          notification_type: type,
          subscription_expires_at: data.subscription_expires_at || new Date().toISOString(),
        });
    }

    console.log('Notification sent successfully:', { type, email });

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Notification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
