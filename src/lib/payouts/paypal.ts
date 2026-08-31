import type { PayoutProvider, PayoutRequest, PayoutResult } from './types';

/**
 * PayPal Payouts. Batches settle asynchronously, so `send` returns
 * 'processing' and the terminal status arrives on the PayPal webhook.
 */
export class PayPalPayoutProvider implements PayoutProvider {
  readonly id = 'paypal';
  readonly methods = ['paypal'] as const;

  private readonly clientId = process.env.PAYPAL_CLIENT_ID;
  private readonly secret = process.env.PAYPAL_CLIENT_SECRET;

  isConfigured(): boolean {
    return Boolean(this.clientId && this.secret);
  }

  async send(request: PayoutRequest): Promise<PayoutResult> {
    if (!this.isConfigured()) {
      return {
        ok: false,
        reason: 'PayPal credentials are not configured.',
        retryable: true,
      };
    }

    // TODO(payouts): POST /v1/payments/payouts with sender_batch_id set to
    // request.payoutId so a retry is deduplicated by PayPal itself.
    return {
      ok: false,
      reason: 'PayPal payouts are not implemented yet.',
      retryable: true,
    };
  }
}
