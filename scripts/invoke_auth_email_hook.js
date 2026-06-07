import { config } from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
config({ path: './.env' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const FUNCTION_NAME = 'auth-email-hook';

if (!SUPABASE_URL) {
  console.error('SUPABASE_URL not set');
  process.exit(1);
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
  }
};

const url = `${SUPABASE_URL.replace(/\/${'$' }/, '')}/functions/v1/${FUNCTION_NAME}`;

(async () => {
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await resp.text();
    console.log('Response status:', resp.status);
    console.log('Response body:', text);
  } catch (e) {
    console.error('Error invoking function:', e);
  }
})();
