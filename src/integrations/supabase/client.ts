import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ypyiarozznrrlbgvtyxj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlweWlhcm96em5ycmxiZ3Z0eXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5ODUzMjQsImV4cCI6MjA4NjU2MTMyNH0.6zgIJ-Ww4nqhG64R9EBBi4kjG7epKdE-35OM1ppXDgw";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
