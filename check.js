import { createClient } from '@supabase/supabase-js';

const url = 'https://oqthkanammbvimglqdkf.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xdGhrYW5hbW1idmltZ2xxZGtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MzcwNjEsImV4cCI6MjA5NzExMzA2MX0.XQo92c9CLv_jOEXVp7EO0Ovxn1qxed1OQ6kXtfp76Tw';

const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.from('vehicles').select('*');
  console.log('Error:', error);
  console.log('Data:', data);
}

check();
