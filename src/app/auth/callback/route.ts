import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Lands OAuth (Google, Facebook) and email-confirmation redirects. Exchanges
 * the code for a session, then hands off to the dashboard, where
 * `ensureProfile` creates the profile and referral code, so this route stays
 * the same regardless of which provider sent the VA here.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (!code) {
    return NextResponse.redirect(`${origin}/earn/sign-in?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/earn/sign-in?error=auth_failed`);
  }

  return NextResponse.redirect(`${origin}/earn${next}`);
}
