import { randomUUID } from 'crypto';
import { IPaymentProvider } from '../../core/interfaces/IPaymentProvider';
import { Payment, PaymentRepository } from '../../infrastructure/database/repositories/PaymentRepository';
import { CertificateRepository } from '../../infrastructure/database/repositories/CertificateRepository';
import { LearnerRepository } from '../../infrastructure/database/repositories/LearnerRepository';
import { ConflictError, NotFoundError } from '../../core/errors/AppError';
import { CHARGE_CURRENCY, certificatePrice, quoteCharge } from './pricing';

// An unfinished checkout is resumed rather than replaced within this window,
// so retrying never leaves two live payments for one certificate
const RESUME_WINDOW_MS = 30 * 60 * 1000;
// Pending attempts are re-verified while a late success is still plausible
// (Paystack retries webhooks for 72 hours)
const RECONCILE_WINDOW_MS = 72 * 60 * 60 * 1000;

/**
 * Payment Service
 *
 * Owns the payment lifecycle: PENDING -> SUCCEEDED | FAILED. Every state change
 * comes from the provider's verify endpoint (never from the client or a webhook
 * body), and SUCCEEDED is final.
 */

export class PaymentService {
  constructor(
    private paymentRepo: PaymentRepository,
    private certificateRepo: CertificateRepository,
    private learnerRepo: LearnerRepository,
    private getProvider: (name?: string) => IPaymentProvider
  ) {}

  async getCertificatePayment(learnerId: string, certificateId: string) {
    await this.assertOwnsCertificate(learnerId, certificateId);
    return {
      isPaid: await this.reconcileCertificate(certificateId),
      price: certificatePrice,
      chargeCurrency: CHARGE_CURRENCY,
    };
  }

  async startCertificatePayment(learnerId: string, certificateId: string) {
    await this.assertOwnsCertificate(learnerId, certificateId);
    if (await this.reconcileCertificate(certificateId)) {
      throw new ConflictError('This certificate is already paid for');
    }

    const provider = this.getProvider();
    const quote = await quoteCharge(certificatePrice);

    const resumable = (await this.paymentRepo.findByCertificate(certificateId)).find(
      (p) =>
        p.status === 'PENDING' &&
        p.accessCode &&
        p.provider === provider.name &&
        p.amountMinor === quote.amountMinor &&
        Date.now() - new Date(p.createdAt).getTime() < RESUME_WINDOW_MS
    );
    if (resumable) {
      return { reference: resumable.reference, provider: provider.name, accessCode: resumable.accessCode };
    }

    const learner = await this.learnerRepo.findById(learnerId);
    if (!learner) throw new NotFoundError('Learner not found');

    const payment = await this.paymentRepo.create({
      learnerId,
      certificateId,
      provider: provider.name,
      reference: `cert_${randomUUID().replace(/-/g, '')}`,
      amountMinor: quote.amountMinor,
      currency: quote.currency,
      fxRate: quote.fxRate,
    });

    try {
      const { accessCode } = await provider.createCheckout({
        reference: payment.reference,
        amountMinor: payment.amountMinor,
        currency: payment.currency,
        email: learner.email,
        metadata: { certificateId },
      });
      await this.paymentRepo.update(payment.id, { accessCode });
      return { reference: payment.reference, provider: provider.name, accessCode };
    } catch (error) {
      await this.paymentRepo.update(payment.id, { status: 'FAILED', failureReason: 'checkout_not_created' });
      throw error;
    }
  }

  async getPaymentStatus(learnerId: string, reference: string) {
    const payment = await this.paymentRepo.findByReference(reference);
    if (!payment || payment.learnerId !== learnerId) {
      throw new NotFoundError('Payment not found');
    }

    const current = await this.reconcileQuietly(payment);
    return { reference, status: current.status };
  }

  async handleWebhook(
    providerName: string,
    rawBody: Buffer,
    headers: Record<string, string | string[] | undefined>
  ) {
    const reference = this.getProvider(providerName).parseWebhook(rawBody, headers);
    if (!reference) return;

    // Payments made outside this app (e.g. dashboard payment pages) are not ours
    const payment = await this.paymentRepo.findByReference(reference);
    if (!payment) return;

    // Errors propagate so the provider retries the webhook
    await this.reconcile(payment);
  }

  private async reconcileCertificate(certificateId: string): Promise<boolean> {
    const payments = await this.paymentRepo.findByCertificate(certificateId);
    if (payments.some((p) => p.status === 'SUCCEEDED')) return true;

    const recent = payments.filter(
      (p) => p.status === 'PENDING' && Date.now() - new Date(p.createdAt).getTime() < RECONCILE_WINDOW_MS
    );
    const results = await Promise.all(recent.map((p) => this.reconcileQuietly(p)));
    return results.some((p) => p.status === 'SUCCEEDED');
  }

  // For reads: a provider outage should show the last known state, not an error
  private async reconcileQuietly(payment: Payment): Promise<Payment> {
    try {
      return await this.reconcile(payment);
    } catch (error: any) {
      console.error(`Payment reconcile failed for ${payment.reference}:`, error.message);
      return payment;
    }
  }

  private async reconcile(payment: Payment): Promise<Payment> {
    if (payment.status === 'SUCCEEDED') return payment;

    const result = await this.getProvider(payment.provider).verify(payment.reference);
    if (result.status === 'pending' && payment.status === 'PENDING') return payment;

    let update: Record<string, any>;
    if (result.status === 'succeeded') {
      // Paystack's amount can exceed ours when customers bear the fees, never fall short
      const paidInFull = result.currency === payment.currency && result.amountMinor >= payment.amountMinor;
      if (paidInFull) {
        update = {
          status: 'SUCCEEDED',
          channel: result.channel,
          providerTxnId: result.providerTxnId,
          paidAt: result.paidAt ?? new Date(),
          failureReason: null,
        };
      } else {
        console.error(`Payment ${payment.reference} succeeded for the wrong amount; review and refund manually`);
        update = { status: 'FAILED', channel: result.channel, failureReason: 'amount_mismatch' };
      }
    } else {
      // A failed attempt can still succeed later (e.g. retried in the same checkout)
      update = {
        status: result.status === 'failed' ? 'FAILED' : 'PENDING',
        channel: result.channel,
        failureReason: result.failureReason ?? null,
      };
    }

    const changed = await this.paymentRepo.recordOutcome(payment.reference, update);
    if (changed && update.status === 'SUCCEEDED') {
      console.log(`Payment ${payment.reference} succeeded via ${result.channel ?? 'unknown channel'}`);
      if ((await this.paymentRepo.countSucceeded(payment.certificateId)) > 1) {
        console.warn(`Certificate ${payment.certificateId} was paid more than once; refund ${payment.reference}`);
      }
    }

    return (await this.paymentRepo.findByReference(payment.reference))!;
  }

  private async assertOwnsCertificate(learnerId: string, certificateId: string) {
    const certificate = await this.certificateRepo.findById(certificateId);
    if (!certificate || certificate.learnerId !== learnerId) {
      throw new NotFoundError('Certificate not found');
    }
  }
}
