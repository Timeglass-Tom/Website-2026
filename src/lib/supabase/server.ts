import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
  requireServiceRoleKey,
} from './env';

/** Session-scoped client. Reads run under the signed-in VA's RLS policies. */
export async function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured in this environment.');
  }
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies are read-only. The
          // middleware refreshes the session, so this is safe to swallow.
        }
      },
    },
  });
}

/**
 * Service-role client. Bypasses RLS — only for server-side handlers that decide
 * status or money (booking webhook, lead insert with anti-abuse checks, payout
 * runs). Never import this from anything that ships to the browser.
 */
export function createAdminClient() {
  if (!SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set.');
  }
  return createSupabaseClient(SUPABASE_URL, requireServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
