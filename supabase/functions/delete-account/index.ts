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

    // 2. Record the email in deleted_accounts to permanently block re-registration
    if (profile?.email) {
      const { error: insertError } = await supabase
        .from('deleted_accounts')
        .insert({
          email: profile.email,
          role: profile.role,
        });

      if (insertError) {
        console.error('Error recording deleted account:', insertError);
        // Don't block deletion if this fails, but log it
      } else {
        console.log('Email recorded in deleted_accounts:', profile.email);
      }
    }

    // 3. Delete user from auth.users (cascades to profiles, etc.)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error('Error deleting user from auth:', deleteError);
      throw new Error('Failed to delete user account');
    }

    console.log('User account deleted successfully:', user.id);

    return new Response(
      JSON.stringify({ message: 'Account deleted successfully' }),
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
