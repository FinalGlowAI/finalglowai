import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ypyiarozznrrlbgvtyxj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlweWlhcm96em5ycmxiZ3Z0eXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5ODUzMjQsImV4cCI6MjA4NjU2MTMyNH0.6zgIJ-Ww4nqhG64R9EBBi4kjG7epKdE-35OM1ppXDgw";

// Safe storage helper to prevent crash on environments with restricted storage access (like iframe sandbox or private mode)
const getSafeLocalStorage = () => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      // Test localStorage accessibility
      const testKey = "__storage_test__";
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    }
  } catch (e) {
    console.warn("[Supabase] LocalStorage access is blocked or restricted. Falling back to in-memory store.", e);
  }
  return undefined;
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: getSafeLocalStorage(),
    persistSession: true,
    autoRefreshToken: true,
  }
});
