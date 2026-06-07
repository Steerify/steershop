import { config } from 'https://deno.land/std@0.224.0/dotenv/mod.ts';

// Load .env variables (Deno environment)
await config({ export: true, safe: false, path: './.env' });

const SUPABASE_URL = Deno.env.get('VITE_SUPABASE_URL');
const FUNCTION_NAME = 'auth-email-hook';

if (!SUPABASE_URL) {
  console.error('SUPABASE_URL not set');
  Deno.exit(1);
}

const payload = {
  user: {
    id: 'test-user-id',
    email: 'okechukwuchukwufulumnanya10@gmail.com',
    user_metadata: {
      full_name: 'Test User',
      role: 'customer',
      phone: ''
    }
  },
  email_data: {
    token: 'test-token',
    token_hash: 'test-token-hash',
    redirect_to: 'https://example.com',
    email_action_type: 'signup',
    site_url: SUPABASE_URL,
    // token_new and token_hash_new optional
  }
};

const url = `${SUPABASE_URL.replace(/\/${'$'}$/, '')}/functions/v1/${FUNCTION_NAME}`;

try {
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // No webhook secret needed for dev mode
    },
    body: JSON.stringify(payload)
  });
  const text = await resp.text();
  console.log('Response status:', resp.status);
  console.log('Response body:', text);
} catch (e) {
  console.error('Error invoking function:', e);
}
