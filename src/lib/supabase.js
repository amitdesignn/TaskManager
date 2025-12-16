import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rqjjehzgfvdlucvvrfcc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxamplaHpnZnZkbHVjdnZyZmNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4ODI0MDQsImV4cCI6MjA4MTQ1ODQwNH0.Jl6tfH6PCTHQOjNza5hsrGbd4MrkI2bpxdrSrTal1RI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
