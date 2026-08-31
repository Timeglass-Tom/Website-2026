/**
 * Supabase is optional at build time so the landing page, priority 1 in the
 * PRD's ship order, can go live before auth and the database exist. Anything
 * that needs a client asks `isSupabaseConfigured()` first and renders a plain
 * "not connected yet" state instead of throwing.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function requireServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Server-side writes that move money ' +
        'require it.',
    );
  }
  return key;
}
