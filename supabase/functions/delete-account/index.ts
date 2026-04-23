import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('Unauthorized deletion attempt:', userError);
      throw new Error('Unauthorized');
    }

    console.log('Account deletion request for user:', user.id);

    // 1. Fetch user's email and role BEFORE deletion
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile for deletion:', profileError);
    }

    // 2. Stage enforcement instead of immediate hard delete
    const deletionWindowDays = 14;
    const deletionScheduledFor = new Date(Date.now() + deletionWindowDays * 24 * 60 * 60 * 1000).toISOString();

    const { error: stageError } = await supabase
      .from('profiles')
      .update({
        account_status: 'pending_deletion',
        account_locked_at: new Date().toISOString(),
        enforcement_stage: 'deletion_scheduled',
        deletion_scheduled_for: deletionScheduledFor,
        is_subscribed: false,
        is_reseller: false,
      })
      .eq('id', user.id);

    if (stageError) {
      console.error('Error staging account deletion:', stageError);
      throw new Error('Failed to stage account deletion');
    }

    const { data: fraudFlagRow } = await supabase
      .from('fraud_flags')
      .insert({
        user_id: user.id,
        reason: 'user_requested_deletion',
        confidence_score: 0.5,
        evidence: { source: 'delete-account-function' },
        automated_action: 'schedule_delayed_deletion',
      })
      .select('id')
      .single();

    await supabase
      .from('fraud_review_queue')
      .insert({
        user_id: user.id,
        fraud_flag_id: fraudFlagRow?.id ?? null,
        queue_status: 'pending',
        priority: 'medium',
        notes: `User requested deletion; scheduled for ${deletionScheduledFor}`,
      });

    await supabase
      .from('fraud_enforcement_audit')
      .insert([
        {
          user_id: user.id,
          action: 'auto_lock_account',
          metadata: { source: 'delete-account-function' },
          created_by: user.id,
        },
        {
          user_id: user.id,
          action: 'revoke_benefits_commissions',
          metadata: { source: 'delete-account-function' },
          created_by: user.id,
        },
        {
          user_id: user.id,
          action: 'queue_admin_review',
          metadata: { source: 'delete-account-function', fraud_flag_id: fraudFlagRow?.id ?? null },
          created_by: user.id,
        },
        {
          user_id: user.id,
          action: 'schedule_delayed_deletion_window',
          metadata: { source: 'delete-account-function', deletion_scheduled_for: deletionScheduledFor, window_days: deletionWindowDays },
          created_by: user.id,
        },
      ]);

    // 3. Keep email blocked only after admin-confirmed abuse / finalization.
    console.log('User account moved to staged deletion workflow:', user.id);

    return new Response(
      JSON.stringify({
        message: 'Account locked and queued for review. Deletion is scheduled after review window.',
        deletionScheduledFor,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in delete-account function:', error);
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
