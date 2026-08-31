'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { FormError, Input, Label } from '@/components/Field';
import { OAuthButtons, OrDivider } from '@/components/OAuthButtons';
import { createClient } from '@/lib/supabase/client';

export function SignInForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: String(form.get('email') ?? '').trim(),
        password: String(form.get('password') ?? ''),
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Something went wrong. Try again in a moment.');
    } finally {
      setPending(false);
    }
  }

  if (!configured) {
    return (
      <div className="rounded-[12px] border border-hairline bg-surface p-5 text-[15px] leading-[1.6] text-body">
        Sign-in isn’t open in this environment yet.
      </div>
    );
  }

  return (
    <div>
      <OAuthButtons disabled={pending} />
      <OrDivider />

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        <FormError>{error}</FormError>

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
}
