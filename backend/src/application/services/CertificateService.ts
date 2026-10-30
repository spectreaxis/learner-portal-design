import { CertificateRepository } from '../../infrastructure/database/repositories/CertificateRepository';
import { PaymentRepository } from '../../infrastructure/database/repositories/PaymentRepository';
import { NotFoundError } from '../../core/errors/AppError';

/**
 * Certificate Service
 *
 * Handles public certificate verification.
 */

export class CertificateService {
  constructor(
    private certificateRepo: CertificateRepository,
    private paymentRepo: PaymentRepository
  ) {}

  async verifyCertificate(certificateId: string) {
    const certificate = await this.certificateRepo.findByCertificateId(certificateId);
    // A certificate only becomes valid once it is paid for
    if (!certificate || (await this.paymentRepo.countSucceeded(certificate.id)) === 0) {
      throw new NotFoundError('Certificate not found');
    }

    // Public endpoint: expose only what a verifier needs, never the learner's
    // email or payment details
    return {
      certificateId: certificate.certificateId,
      earnedAt: certificate.earnedAt,
      learnerName: certificate.learner?.name,
      module: certificate.module,
    };
  }
}
