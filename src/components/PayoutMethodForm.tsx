'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { FormError, Label, Select } from '@/components/Field';
import { PAYOUT_METHODS } from '@/config/program';
import { createClient } from '@/lib/supabase/client';

/**
 * Writes straight to `earn_users` under the VA's own session — the update
 * policy scopes it to their own row, so this needs no API route of its own.
 */
export function PayoutMethodForm({ current }: { current: string | null }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const method = String(new FormData(event.currentTarget).get('payout_method') ?? '');

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError('Your session expired. Sign in again.');
        return;
      }

      const { error: updateError } = await supabase
        .from('earn_users')
        .update({ payout_method: method || null })
        .eq('id', user.id);

      if (updateError) {
        setError('Could not save that. Try again.');
        return;
      }

      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <Label htmlFor="payout_method">Payout method</Label>
        <Select id="payout_method" name="payout_method" defaultValue={current ?? ''}>
          <option value="">Not set</option>
          {PAYOUT_METHODS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </Select>
      </div>

      <FormError>{error}</FormError>

      <Button type="submit" variant="secondary" disabled={pending}>
        {saved ? 'Saved' : pending ? 'Saving…' : 'Save'}
      </Button>
    </form>
  );
}
