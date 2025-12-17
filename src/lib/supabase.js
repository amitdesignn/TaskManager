import { createClient } from '@supabase/supabase-js';

// Use environment variables with fallback for local development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rqjjehzgfvdlucvvrfcc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxamplaHpnZnZkbHVjdnZyZmNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4ODI0MDQsImV4cCI6MjA4MTQ1ODQwNH0.Jl6tfH6PCTHQOjNza5hsrGbd4MrkI2bpxdrSrTal1RI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage
    }
});
