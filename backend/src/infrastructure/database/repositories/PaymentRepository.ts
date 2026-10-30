import { BaseRepository } from './BaseRepository';
import { IDataProvider } from '../../../core/interfaces/IDataProvider';

export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED';

export interface Payment {
  id: string;
  learnerId: string;
  certificateId: string;
  provider: string;
  reference: string;
  accessCode: string | null;
  amountMinor: number;
  currency: string;
  status: PaymentStatus;
  channel: string | null;
  failureReason: string | null;
  paidAt: Date | null;
  createdAt: Date;
}

/**
 * Payment Repository
 *
 * One record per payment attempt; a certificate is paid once any attempt succeeds.
 */

export class PaymentRepository extends BaseRepository<Payment> {
  constructor(dataProvider: IDataProvider) {
    super('payment', dataProvider);
  }

  async findByReference(reference: string): Promise<Payment | null> {
    return this.dataProvider.findUnique<Payment>(this.model, { reference });
  }

  async findByCertificate(certificateId: string): Promise<Payment[]> {
    return this.dataProvider.findMany<Payment>(this.model, {
      where: { certificateId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countSucceeded(certificateId: string): Promise<number> {
    return this.dataProvider.count(this.model, { certificateId, status: 'SUCCEEDED' });
  }

  /**
   * Record a verified outcome. A succeeded payment is final, so this is a no-op
   * once one exists, which also makes webhook retries and races harmless.
   * @returns Whether the payment was updated
   */
  async recordOutcome(reference: string, data: Record<string, any>): Promise<boolean> {
    const updated = await this.dataProvider.updateMany(
      this.model,
      { reference, status: { not: 'SUCCEEDED' } },
      data
    );
    return updated > 0;
  }
}
