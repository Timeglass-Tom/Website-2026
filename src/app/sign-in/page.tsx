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
      subtitle="Pick up where you left off."
      footer={
        <>
          Don’t have an account yet?{' '}
          <Link
            href="/sign-up"
            className="text-accent underline underline-offset-[3px] hover:text-cream"
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
