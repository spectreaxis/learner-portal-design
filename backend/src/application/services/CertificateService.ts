import { CertificateRepository } from '../../infrastructure/database/repositories/CertificateRepository';
import { PaymentRepository } from '../../infrastructure/database/repositories/PaymentRepository';
import { NotFoundError } from '../../core/errors/AppError';

/**
 * Certificate Service
 *
 * Handles certificate-related business logic including
 * verification and payment status checking.
 */

export class CertificateService {
  constructor(
    private certificateRepo: CertificateRepository,
    private paymentRepo: PaymentRepository
  ) {}

  async verifyCertificate(certificateId: string) {
    const certificate = await this.certificateRepo.findByCertificateId(certificateId);
    if (!certificate) {
      throw new NotFoundError('Certificate not found');
    }

    // Check payment status
    const payment = await this.paymentRepo.findByCertificateId(certificate.id);

    return {
      ...certificate,
      isPaid: payment?.status === 'COMPLETED',
      payment: payment
        ? {
            status: payment.status,
            amount: payment.amount,
            mpesaReceiptNumber: payment.mpesaReceiptNumber,
          }
        : null,
    };
  }

  async getCertificateStatus(learnerId: string, moduleId: string) {
    const certificate = await this.certificateRepo.findByLearnerAndModule(
      learnerId,
      moduleId
    );

    if (!certificate) {
      return {
        exists: false,
        isPaid: false,
      };
    }

    const payment = await this.paymentRepo.findByCertificateId(certificate.id);

    return {
      exists: true,
      certificate,
      isPaid: payment?.status === 'COMPLETED',
      payment,
    };
  }

  async checkPaymentStatus(certificateId: string) {
    const certificate = await this.certificateRepo.findByCertificateId(certificateId);
    if (!certificate) {
      throw new NotFoundError('Certificate not found');
    }

    const payment = await this.paymentRepo.findByCertificateId(certificate.id);

    return {
      isPaid: payment?.status === 'COMPLETED',
      payment,
    };
  }
}
