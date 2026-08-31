import type { PayoutMethod } from '@/config/program';

/**
 * Every payout rail sits behind this interface so adding Payoneer or USDC later
 * is a new file, not a change to the ledger. The ledger records what is owed;
 * a provider only moves money and reports back what happened.
 */

export type PayoutRequest = {
  /** Our payout row id. Passed to the rail as an idempotency key. */
  payoutId: string;
  userId: string;
  amountUsd: number;
  method: PayoutMethod;
  /** Rail-specific destination: PayPal address, Wise recipient id, wallet, … */
  destination: Record<string, unknown>;
  /** For the payout screen — what the VA sees in their own currency. */
  countryCode: string | null;
};

export type PayoutResult =
  | {
      ok: true;
      /** Rail's own identifier: transfer id, batch id, transaction hash. */
      providerRef: string;
      /** Present when the rail tells us the settled local amount. */
      localCurrency?: string;
      localAmount?: number;
      /** Some rails settle asynchronously; the webhook confirms later. */
      status: 'paid' | 'processing';
    }
  | {
      ok: false;
      reason: string;
      /** False for a permanently rejected payout (bad account, sanctions). */
      retryable: boolean;
    };

export interface PayoutProvider {
  readonly id: string;
  /** Methods this provider can settle. */
  readonly methods: readonly PayoutMethod[];
  /** True when the provider has the credentials it needs to actually send. */
  isConfigured(): boolean;
  /**
   * Must be idempotent on `payoutId`: a retried run after a timeout has to
   * return the original transfer rather than sending a second one.
   */
  send(request: PayoutRequest): Promise<PayoutResult>;
}
