import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from '@/lib/supabase/env';
import { REF_COOKIE, REF_COOKIE_MAX_AGE, normalizeCode } from '@/lib/referral';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Capture ?ref= from every entry point, since VAs share their link with
  // whichever path they happened to be on.
  const ref = request.nextUrl.searchParams.get('ref');
  if (ref) {
    response.cookies.set(REF_COOKIE, normalizeCode(ref), {
      maxAge: REF_COOKIE_MAX_AGE,
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
    });
  }

  // Before Supabase is wired up the site is still browsable: landing page only,
  // which is exactly the PRD's "ship the landing page first" state.
  if (!isSupabaseConfigured()) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        if (ref) {
          response.cookies.set(REF_COOKIE, normalizeCode(ref), {
            maxAge: REF_COOKIE_MAX_AGE,
            sameSite: 'lax',
            path: '/',
          });
        }
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Refreshes an expiring session cookie. Must run before any auth check below.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Everything except static assets and images.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
