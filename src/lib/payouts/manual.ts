import type { PayoutProvider, PayoutRequest, PayoutResult } from './types';

/**
 * The fallback rail: GCash, Payoneer and USDC have no integration yet, and at
 * launch volume paying those by hand is entirely reasonable.
 *
 * It deliberately succeeds with status 'processing' rather than failing. The
 * payout is genuinely in flight — a human is about to send it — and the ledger
 * should say so, with the terminal 'paid' set when whoever sent it confirms.
 */
export class ManualPayoutProvider implements PayoutProvider {
  readonly id = 'manual';
  readonly methods = ['gcash', 'payoneer', 'usdc_polygon'] as const;

  isConfigured(): boolean {
    return true;
  }

  async send(request: PayoutRequest): Promise<PayoutResult> {
    return {
      ok: true,
      providerRef: `manual:${request.payoutId}`,
      status: 'processing',
    };
  }
}
