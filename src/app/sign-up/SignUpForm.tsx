'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { FormError, Input, Label, Select } from '@/components/Field';
import { OAuthButtons, OrDivider } from '@/components/OAuthButtons';
import { OTHER_COUNTRIES, PRIORITY_COUNTRIES } from '@/config/countries';
import { PAYOUT_METHODS, TIMEGLASS_URL } from '@/config/program';
import { EARN_EVENTS, track } from '@/lib/analytics';
import { createClient } from '@/lib/supabase/client';

export function SignUpForm({
  configured,
  detectedCountry,
}: {
  configured: boolean;
  detectedCountry: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');

    if (password.length < 8) {
      setError('Password needs to be at least 8 characters.');
      return;
    }

    setPending(true);
    track(EARN_EVENTS.signupStart, { method: 'password' });

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/earn/auth/callback`,
          // Read back by ensureProfile() when the profile row is created, so a
          // VA never has to type this twice.
          data: {
            full_name: String(form.get('full_name') ?? '').trim(),
            country: String(form.get('country') ?? ''),
            payout_method: String(form.get('payout_method') ?? ''),
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      track(EARN_EVENTS.signupComplete, { method: 'password' });

      // With email confirmation switched on, signUp returns no session.
      if (!data.session) {
        setNeedsConfirmation(true);
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
        Signups aren’t open in this environment yet. The landing page is live;
        auth switches on as soon as Supabase credentials are set.
      </div>
    );
  }

  if (needsConfirmation) {
    return (
      <div className="rounded-[12px] border border-hairline bg-surface p-5 text-[15px] leading-[1.6] text-body">
        Check your email — we sent a link to confirm your address. Open it and
        you’ll land straight in your dashboard with your referral code.
      </div>
    );
  }

  return (
    <div>
      <OAuthButtons disabled={pending} />
      <OrDivider />

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <Label htmlFor="full_name">Your name</Label>
          <Input id="full_name" name="full_name" autoComplete="name" required />
        </div>

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
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        <div>
          <Label htmlFor="country">Country</Label>
          <Select id="country" name="country" defaultValue={detectedCountry} required>
            <optgroup label="Most common">
              {PRIORITY_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Everywhere else">
              {OTHER_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          </Select>
        </div>

        <div>
          <Label
            htmlFor="payout_method"
            hint="You can change this later — it won’t hold up your signup."
          >
            How you’d like to get paid
          </Label>
          <Select id="payout_method" name="payout_method" defaultValue="">
            <option value="">Decide later</option>
            {PAYOUT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Select>
        </div>

        <label className="flex items-start gap-3 text-[14px] leading-[1.55] text-body">
          <input
            type="checkbox"
            name="terms"
            required
            className="mt-[3px] h-4 w-4 shrink-0 accent-[#6fcb92]"
          />
          <span>
            I agree to the{' '}
            <a
              href={`${TIMEGLASS_URL}/terms`}
              target="_blank"
              rel="noreferrer"
              className="text-accent underline underline-offset-[3px]"
            >
              terms
            </a>{' '}
            and{' '}
            <a
              href={`${TIMEGLASS_URL}/privacy`}
              target="_blank"
              rel="noreferrer"
              className="text-accent underline underline-offset-[3px]"
            >
              privacy policy
            </a>
            .
          </span>
        </label>

        <FormError>{error}</FormError>

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? 'Creating your account…' : 'Create account'}
        </Button>
      </form>
    </div>
  );
}
