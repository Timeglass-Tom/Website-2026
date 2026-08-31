import Link from 'next/link';
import type { Metadata } from 'next';
import { AuthShell } from '@/components/AuthShell';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { SignInForm } from './SignInForm';

export const metadata: Metadata = { title: 'Sign in' };

export default function SignInPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
      footer={
        <>
          Need an account?{' '}
          <Link
            href="/sign-up"
            className="text-sand-gold underline underline-offset-[3px] hover:text-still-white"
          >
            Get started
          </Link>
        </>
      }
    >
      <SignInForm configured={isSupabaseConfigured()} />
    </AuthShell>
  );
}
