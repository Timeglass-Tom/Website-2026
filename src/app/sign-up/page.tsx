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
      subtitle={`It takes about a minute. Your referral code and share link show up on the next screen, and the ${usd(
        ATTENDANCE_BOUNTY_USD,
      )} lands when the person you introduce attends a call.`}
      footer={
        <>
          Have an account?{' '}
          <Link
            href="/sign-in"
            className="text-sand-gold underline underline-offset-[3px] hover:text-still-white"
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
