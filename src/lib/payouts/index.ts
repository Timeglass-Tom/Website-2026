import type { PayoutMethod } from '@/config/program';
import { ManualPayoutProvider } from './manual';
import { PayPalPayoutProvider } from './paypal';
import { WisePayoutProvider } from './wise';
import type { PayoutProvider } from './types';

export type { PayoutProvider, PayoutRequest, PayoutResult } from './types';

/**
 * Resolution order matters: a dedicated rail wins, and the manual provider
 * catches the methods nobody has integrated yet so no payout method a VA can
 * pick at signup is left with nowhere to go.
 */
const PROVIDERS: PayoutProvider[] = [
  new WisePayoutProvider(),
  new PayPalPayoutProvider(),
  new ManualPayoutProvider(),
];

export function providerFor(method: PayoutMethod): PayoutProvider {
  const dedicated = PROVIDERS.find(
    (p) => p.id !== 'manual' && (p.methods as readonly string[]).includes(method),
  );
  if (dedicated?.isConfigured()) return dedicated;

  const fallback = PROVIDERS.find((p) =>
    (p.methods as readonly string[]).includes(method),
  );
  if (fallback) return fallback;

  // Every method in PAYOUT_METHODS is covered above; this guards a new one
  // being added to the dropdown without a rail behind it.
  return new ManualPayoutProvider();
}

export function configuredProviders(): string[] {
  return PROVIDERS.filter((p) => p.isConfigured()).map((p) => p.id);
}
