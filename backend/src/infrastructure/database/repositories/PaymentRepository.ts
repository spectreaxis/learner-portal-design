import { BaseRepository } from './BaseRepository';
import { IDataProvider } from '../../../core/interfaces/IDataProvider';

export interface Payment {
  id: string;
  learnerId: string;
  certificateId: string;
  amount: number;
  phoneNumber: string;
  merchantRequestId: string;
  checkoutRequestId: string;
  mpesaReceiptNumber: string | null;
  transactionDate: Date | null;
  status: string;
  resultCode: string | null;
  resultDesc: string | null;
  metadata: any; // JSON
  createdAt: Date;
}

/**
 * Payment Repository
 *
 * Handles all database operations related to M-Pesa payments.
 */

export class PaymentRepository extends BaseRepository<Payment> {
  constructor(dataProvider: IDataProvider) {
    super('payment', dataProvider);
  }

  async findByCertificateId(certificateId: string): Promise<Payment | null> {
    return this.dataProvider.findUnique<Payment>(this.model, { certificateId });
  }

  async findByCheckoutRequestId(checkoutRequestId: string): Promise<Payment | null> {
    return this.dataProvider.findUnique<Payment>(this.model, { checkoutRequestId });
  }

  async upsertPayment(
    certificateId: string,
    data: {
      learnerId: string;
      amount: number;
      phoneNumber: string;
      merchantRequestId: string;
      checkoutRequestId: string;
      status: string;
      metadata?: any;
    }
  ): Promise<Payment> {
    return this.dataProvider.upsert<Payment>(
      this.model,
      { certificateId },
      {
        ...data,
        certificateId,
        createdAt: new Date(),
      },
      {
        ...data,
      }
    );
  }

  async updatePaymentStatus(
    paymentId: string,
    data: {
      status: string;
      mpesaReceiptNumber?: string;
      transactionDate?: Date;
      resultCode?: string;
      resultDesc?: string;
      metadata?: any;
    }
  ): Promise<Payment> {
    return this.dataProvider.update<Payment>(this.model, { id: paymentId }, data);
  }

  async findByLearner(learnerId: string): Promise<Payment[]> {
    return this.dataProvider.findMany<Payment>(this.model, {
      where: { learnerId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
