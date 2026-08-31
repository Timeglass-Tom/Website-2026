'use client';

import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from './env';

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured in this environment.');
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
