'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Google and Facebook. Facebook is not optional here — in the Philippines,
 * Vietnam and Indonesia a Facebook login is often the account a VA actually
 * remembers the password to.
 */
const PROVIDERS = [
  { id: 'google', label: 'Continue with Google' },
  { id: 'facebook', label: 'Continue with Facebook' },
] as const;

export function OAuthButtons({ disabled }: { disabled?: boolean }) {
  const [pending, setPending] = useState<string | null>(null);

  async function signIn(provider: 'google' | 'facebook') {
    setPending(provider);
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/earn/auth/callback`,
        },
      });
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-2.5">
      {PROVIDERS.map((p) => (
        <button
          key={p.id}
          type="button"
          disabled={disabled || pending !== null}
          onClick={() => void signIn(p.id)}
          className="w-full rounded-[10px] border border-hairline bg-surface px-4 py-3 text-[15px] font-medium text-cream transition-colors hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-55"
        >
          {pending === p.id ? 'Opening…' : p.label}
        </button>
      ))}
    </div>
  );
}

export function OrDivider() {
  return (
    <div className="my-6 flex items-center gap-3">
      <span className="h-px flex-1 bg-hairline" />
      <span className="text-[12.5px] uppercase tracking-[0.14em] text-faint">or</span>
      <span className="h-px flex-1 bg-hairline" />
    </div>
  );
}
