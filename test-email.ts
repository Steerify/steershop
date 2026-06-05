import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Signing up dummy user...");
  const { data, error } = await supabase.auth.signUp({
    email: 'test_email_steersolo_agent_125@yopmail.com',
    password: 'SuperSecurePassword!2026',
  });
  console.log("Signup error:", error);
  console.log("Signup user:", data.user?.id);
}
test();
