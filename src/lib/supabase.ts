import { createClient } from '@supabase/supabase-js';

// Fallback a las credenciales configuradas del proyecto Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://okieuqjwrxcmfnsmtjwn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9raWV1cWp3cnhjbWZuc210anduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0MTk0ODMsImV4cCI6MjEwNzk5NTQ4M30.NHejSGtMBNAK94AhKZXRO98YRdskeliFg31aUGduY38';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase URL o Anon Key no configuradas en el entorno.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
