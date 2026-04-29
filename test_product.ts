import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://hwkcqgmtinbgyjjgcgmp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3a2NxZ210aW5iZ3lqamdjZ21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2Mzg2NDMsImV4cCI6MjA3ODIxNDY0M30.DteckGKDVYtq-fwPn24qgas0qg9CKOswAPkZuigre2U";

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
    email: 'vendor@example.com', // Let's just create a generic product and see the RLS/DB error
    password: 'password123'
  });
  
  // Just try an insert without auth, or with a fake shop_id to see what error Supabase throws
  const { error } = await supabase.from('products').insert({
    shop_id: '11111111-1111-1111-1111-111111111111',
    name: 'Test Product',
    price: 1000,
    stock_quantity: 10,
    category: 'general',
    is_available: true
  });
  
  console.log("Insert Error:", error);
}

test();
