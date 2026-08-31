import type { PayoutProvider, PayoutRequest, PayoutResult } from './types';

/**
 * Wise — the first rail, per the PRD's build order. Wise's own transfer
 * creation is a three-step dance (quote, recipient, transfer + fund); the
 * `customerTransactionId` we pass is our payout row id, which is what makes a
 * retry safe.
 *
 * The HTTP calls are stubbed until Wise business credentials are issued. The
 * shape is real, so wiring it up is filling in `createTransfer`, not
 * redesigning the caller.
 */
export class WisePayoutProvider implements PayoutProvider {
  readonly id = 'wise';
  readonly methods = ['wise'] as const;

  private readonly apiKey = process.env.WISE_API_KEY;
  private readonly profileId = process.env.WISE_PROFILE_ID;

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.profileId);
  }

  async send(request: PayoutRequest): Promise<PayoutResult> {
    if (!this.isConfigured()) {
      return {
        ok: false,
        reason: 'Wise credentials are not configured.',
        // Retryable: nothing is wrong with the payout, only with our setup.
        retryable: true,
      };
    }

    // TODO(payouts): create quote -> recipient -> transfer -> fund, passing
    // request.payoutId as customerTransactionId for idempotency.
    return {
      ok: false,
      reason: 'Wise transfer creation is not implemented yet.',
      retryable: true,
    };
  }
}
