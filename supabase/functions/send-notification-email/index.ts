import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: 'profile_incomplete' | 'subscription_expiring' | 'milestone_achieved' | 'setup_complete';
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

    const template = getEmailTemplate(type, { ...data, name: userName });

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SteerSolo <onboarding@resend.dev>',
        to: [email],
        subject: template.subject,
        html: template.html,
      }),
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
