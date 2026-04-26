const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Need service role key to query user_roles as normal user might be restricted
// Let's see if we can use the CLI or just use the publishable key for now
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY; 

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  const email = 'steerifygroup@gmail.com';
  console.log('Checking profile for:', email);
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();
    
  if (profileError) {
    console.log('Profile error:', profileError);
  } else {
    console.log('Profile:', profile);
    
    // Check roles
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', profile.id);
      
    if (rolesError) {
      console.log('Roles error:', rolesError);
    } else {
      console.log('Roles:', roles);
    }
  }
}

checkUser();
