import { createHmac, timingSafeEqual } from 'crypto';
import {
  Checkout,
  CheckoutRequest,
  IPaymentProvider,
  VerifiedPayment,
} from '../../core/interfaces/IPaymentProvider';
import { AppError, AuthenticationError } from '../../core/errors/AppError';

const API_URL = 'https://api.paystack.co';

// Paystack transaction statuses that can still end in success
const PENDING_STATUSES = new Set(['abandoned', 'ongoing', 'pending', 'processing', 'queued']);

/**
 * Paystack Provider
 *
 * Hosted checkout (Popup) through Initialize Transaction, so card details and
 * M-Pesa/Pesalink prompts are handled by Paystack and never touch this server.
 */
export class PaystackProvider implements IPaymentProvider {
  readonly name = 'paystack';

  constructor(private secretKey: string) {}

  async createCheckout(request: CheckoutRequest): Promise<Checkout> {
    const data = await this.request('/transaction/initialize', {
      method: 'POST',
      body: JSON.stringify({
        reference: request.reference,
        amount: request.amountMinor,
        currency: request.currency,
        email: request.email,
        metadata: JSON.stringify(request.metadata ?? {}),
      }),
    });

    return { accessCode: data.access_code };
  }

  async verify(reference: string): Promise<VerifiedPayment> {
    const data = await this.request(`/transaction/verify/${encodeURIComponent(reference)}`);

    const status =
      data.status === 'success' ? 'succeeded' : PENDING_STATUSES.has(data.status) ? 'pending' : 'failed';

    return {
      status,
      amountMinor: data.amount,
      currency: data.currency,
      channel: data.channel ?? undefined,
      providerTxnId: data.id != null ? String(data.id) : undefined,
      paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
      failureReason: status === 'failed' ? data.gateway_response || data.status : undefined,
    };
  }

  parseWebhook(rawBody: Buffer, headers: Record<string, string | string[] | undefined>): string | null {
    const signature = headers['x-paystack-signature'];
    const expected = createHmac('sha512', this.secretKey).update(rawBody).digest('hex');

    if (
      typeof signature !== 'string' ||
      signature.length !== expected.length ||
      !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    ) {
      throw new AuthenticationError('Invalid webhook signature');
    }

    const event = JSON.parse(rawBody.toString('utf8'));
    return event.event === 'charge.success' ? event.data?.reference ?? null : null;
  }

  private async request(path: string, init: RequestInit = {}): Promise<any> {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(15_000),
    });
    const body: any = await response.json().catch(() => ({}));

    if (!response.ok || !body.status) {
      // Paystack's message names the problem without echoing customer data
      console.error(`Paystack ${path.split('/').slice(0, 3).join('/')} failed:`, response.status, body.message);
      throw new AppError(502, 'Payment provider is unavailable, please try again');
    }

    return body.data;
  }
}
