'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { FormError, Input, Label, Select } from '@/components/Field';
import { COMPANY_SIZES, OTHER_COUNTRIES, PITCH_CHANNELS, PRIORITY_COUNTRIES } from '@/config/countries';
import { PHONE_BONUS_USD, usd } from '@/config/program';
import { EARN_EVENTS, track } from '@/lib/analytics';

export function LeadForm({ defaultCountry }: { defaultCountry: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      companyName: form.get('companyName'),
      companyWebsite: form.get('companyWebsite'),
      companySize: form.get('companySize'),
      country: form.get('country'),
      // Best-effort, and never blocking: it saves the VA a dropdown and gives
      // sales something to schedule against.
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      contactName: form.get('contactName'),
      contactRole: form.get('contactRole'),
      contactRelationship: form.get('contactRelationship'),
      contactEmail: form.get('contactEmail'),
      contactPhone: form.get('contactPhone'),
      pitchChannel: form.get('pitchChannel'),
    };

    try {
      const response = await fetch('/earn/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(data?.error ?? 'Could not save that. Try again.');
        return;
      }

      track(EARN_EVENTS.leadSubmitted);
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Could not reach us. Check your connection and try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <fieldset className="space-y-5">
        <legend className="text-[12px] font-medium uppercase tracking-[0.13em] text-muted">
          The company
        </legend>

        <div>
          <Label htmlFor="companyName">Company name</Label>
          <Input id="companyName" name="companyName" required />
        </div>

        <div>
          <Label htmlFor="companyWebsite" optional>
            Company website
          </Label>
          <Input
            id="companyWebsite"
            name="companyWebsite"
            inputMode="url"
            placeholder="acme.com"
          />
        </div>

        <div>
          <Label htmlFor="companySize">Roughly how big are they?</Label>
          <Select id="companySize" name="companySize" defaultValue="unknown">
            {COMPANY_SIZES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="country">Where are they based?</Label>
          <Select id="country" name="country" defaultValue={defaultCountry} required>
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
      </fieldset>

      <fieldset className="space-y-5 border-t border-hairline-soft pt-6">
        <legend className="text-[12px] font-medium uppercase tracking-[0.13em] text-muted">
          The person you’re introducing
        </legend>

        <div>
          <Label htmlFor="contactName">Their full name</Label>
          <Input id="contactName" name="contactName" required />
        </div>

        <div>
          <Label htmlFor="contactRole">Their role</Label>
          <Input
            id="contactRole"
            name="contactRole"
            placeholder="Owner, Operations Manager, Agency Lead…"
            required
          />
        </div>

        <div>
          <Label
            htmlFor="contactRelationship"
            hint="How do you know them? This helps us pick the right opener if we follow up."
          >
            Their relationship to you
          </Label>
          <Input
            id="contactRelationship"
            name="contactRelationship"
            placeholder="My direct manager / the agency owner I report to"
            required
          />
        </div>

        <div>
          <Label
            htmlFor="contactEmail"
            hint="Their work email, not a personal one — it’s how we match the booking back to you."
          >
            Their work email
          </Label>
          <Input
            id="contactEmail"
            name="contactEmail"
            type="email"
            inputMode="email"
            required
          />
        </div>

        <div>
          <Label
            htmlFor="contactPhone"
            optional
            hint={`Worth ${usd(
              PHONE_BONUS_USD,
            )} extra: if we can verify the number and they attend the call, the bonus is yours on top of the payout.`}
          >
            Their phone or WhatsApp
          </Label>
          <Input id="contactPhone" name="contactPhone" type="tel" inputMode="tel" />
        </div>

        <div>
          <Label htmlFor="pitchChannel">How are you planning to pitch them?</Label>
          <Select id="pitchChannel" name="pitchChannel" defaultValue="email" required>
            {PITCH_CHANNELS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
      </fieldset>

      <FormError>{error}</FormError>

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? 'Saving…' : 'Add this company'}
      </Button>
    </form>
  );
}
