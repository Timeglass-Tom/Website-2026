import { headers } from 'next/headers';
import Link from 'next/link';
import type { Metadata } from 'next';
import { AuthShell } from '@/components/AuthShell';
import { ATTENDANCE_BOUNTY_USD, usd } from '@/config/program';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { SignUpForm } from './SignUpForm';

export const metadata: Metadata = { title: 'Sign up' };

/** Vercel/Cloudflare both set a country header; fall back to the likeliest. */
async function detectCountry(): Promise<string> {
  const h = await headers();
  const detected =
    h.get('x-vercel-ip-country') ?? h.get('cf-ipcountry') ?? h.get('x-country-code');
  return detected?.toUpperCase() ?? 'PH';
}

export default async function SignUpPage() {
  const detectedCountry = await detectCountry();

  return (
    <AuthShell
      title="Create your account"
      subtitle={`Takes a minute. You’ll get your referral code and share link on the next screen — and ${usd(
        ATTENDANCE_BOUNTY_USD,
      )} when the person you introduce attends a call.`}
      footer={
        <>
          Already signed up?{' '}
          <Link
            href="/sign-in"
            className="text-accent underline underline-offset-[3px] hover:text-cream"
          >
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm
        configured={isSupabaseConfigured()}
        detectedCountry={detectedCountry}
      />
    </AuthShell>
  );
}
