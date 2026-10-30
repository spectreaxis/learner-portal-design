/**
 * Payment Provider Interface
 *
 * The rest of the app depends only on this, so a provider (Paystack, direct
 * Daraja, ...) can be swapped or added side by side through configuration.
 * Webhooks are only a hint: payment state always comes from verify().
 */

export interface CheckoutRequest {
  reference: string;
  amountMinor: number;
  currency: string;
  email: string;
  metadata?: Record<string, string>;
}

export interface Checkout {
  // Handed to the provider's client-side checkout to resume this payment
  accessCode: string;
}

export interface VerifiedPayment {
  status: 'succeeded' | 'failed' | 'pending';
  amountMinor: number;
  currency: string;
  channel?: string;
  providerTxnId?: string;
  paidAt?: Date;
  failureReason?: string;
}

export interface IPaymentProvider {
  readonly name: string;

  createCheckout(request: CheckoutRequest): Promise<Checkout>;

  verify(reference: string): Promise<VerifiedPayment>;

  /**
   * Authenticate a webhook and return the payment reference it concerns,
   * or null for events that need no action
   * @throws AuthenticationError when the webhook is not genuine
   */
  parseWebhook(rawBody: Buffer, headers: Record<string, string | string[] | undefined>): string | null;
}
