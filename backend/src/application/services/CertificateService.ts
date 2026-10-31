import { randomBytes } from 'crypto';
import {
  CertificateRecord,
  CertificateRepository,
} from '../../infrastructure/database/repositories/CertificateRepository';
import { PaymentRepository } from '../../infrastructure/database/repositories/PaymentRepository';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../../core/errors/AppError';
import { isValidSignature, securityCode, signCertificate, toCrockford } from '../../core/utils/certificate-signing';
import { isMinorNameCorrection, normalizePersonName, personNameProblem } from '../../core/utils/person-name';

// Corrections a learner can make on their own; past this, support re-issues
const MAX_NAME_CORRECTIONS = 2;
const REASON_MIN_LENGTH = 5;
const REASON_MAX_LENGTH = 300;

/** Random, so certificate IDs cannot be guessed or enumerated */
export function newCertificateId(moduleNumber: number): string {
  return `IIAIC-M${moduleNumber}-${toCrockford(randomBytes(7), 10)}`;
}

type IssuedRecord = CertificateRecord & { recipientName: string; signature: string };

const signedFields = (record: CertificateRecord, recipientName: string, revision: number) => ({
  certificateId: record.certificateId,
  moduleNumber: record.module.number,
  recipientName,
  earnedAt: record.earnedAt,
  revision,
});

/**
 * Certificate Service
 *
 * Issues certificates once paid for, verifies them publicly, and handles
 * learners' corrections to the name printed on them.
 */

export class CertificateService {
  constructor(
    private certificateRepo: CertificateRepository,
    private paymentRepo: PaymentRepository
  ) {}

  /** The learner's own view of a certificate, issuing it on the first view after payment */
  async getForLearner(learnerId: string, certificateId: string) {
    const record = await this.findOwned(learnerId, certificateId);

    if (!(await this.isPaid(record))) {
      // Until it is issued, the certificate carries the learner's current profile name
      return {
        certificateId: record.certificateId,
        isIssued: false as const,
        recipientName: record.learner.name,
      };
    }

    const issued = await this.ensureIssued(record);
    return {
      certificateId: issued.certificateId,
      isIssued: true as const,
      recipientName: issued.recipientName,
      securityCode: securityCode(issued.signature),
      revision: issued.revision,
      nameCorrectionsLeft: MAX_NAME_CORRECTIONS - issued.nameChanges.length,
    };
  }

  async verifyCertificate(certificateId: string) {
    const record = await this.certificateRepo.findByCertificateId(certificateId);
    // A certificate only becomes valid once it is paid for
    if (!record || !(await this.isPaid(record))) {
      throw new NotFoundError('Certificate not found');
    }

    const issued = await this.ensureIssued(record);
    const signatureValid = isValidSignature(
      signedFields(issued, issued.recipientName, issued.revision),
      issued.signature
    );
    if (!signatureValid) {
      console.error(`Certificate ${certificateId} failed its signature check; the record may have been altered`);
    }

    // Public endpoint: expose only what a verifier needs, never the learner's
    // email, payment details or previous names
    return {
      certificateId: issued.certificateId,
      earnedAt: issued.earnedAt,
      recipientName: issued.recipientName,
      module: issued.module,
      revision: issued.revision,
      securityCode: securityCode(issued.signature),
      signatureValid,
      nameCorrectedAt: issued.nameChanges.map((change) => change.createdAt),
    };
  }

  async correctName(
    learnerId: string,
    certificateId: string,
    request: { name: unknown; reason: unknown; ipAddress?: string }
  ) {
    const record = await this.findOwned(learnerId, certificateId);
    if (!(await this.isPaid(record))) {
      throw new ValidationError(
        'This certificate is not issued yet, so it uses the name on your profile. Change it in Settings.'
      );
    }
    const issued = await this.ensureIssued(record);

    const name = normalizePersonName(String(request.name ?? ''));
    const reason = String(request.reason ?? '').trim();
    const problem = personNameProblem(name);
    if (problem) throw new ValidationError(problem);
    if (reason.length < REASON_MIN_LENGTH || reason.length > REASON_MAX_LENGTH) {
      throw new ValidationError(
        `Explain the correction in ${REASON_MIN_LENGTH} to ${REASON_MAX_LENGTH} characters`
      );
    }
    if (name === issued.recipientName) {
      throw new ValidationError('That is already the name on this certificate');
    }
    if (issued.nameChanges.length >= MAX_NAME_CORRECTIONS) {
      throw new ForbiddenError(
        'This certificate has used all its name corrections. Contact support to have it re-issued.'
      );
    }
    if (!isMinorNameCorrection(issued.recipientName, name)) {
      throw new ForbiddenError(
        'Only spelling corrections, or adding or removing part of your name, can be made here. ' +
          'For a different name, contact support with proof of identity.'
      );
    }

    try {
      await this.certificateRepo.correctName(issued, {
        newName: name,
        reason,
        signature: signCertificate(signedFields(issued, name, issued.revision + 1)),
        ipAddress: request.ipAddress,
      });
    } catch (error: any) {
      // P2025: the revision changed under us, i.e. another correction won the race
      if (error.code === 'P2025') {
        throw new ConflictError('This certificate was just changed. Reload the page and try again.');
      }
      throw error;
    }

    return this.getForLearner(learnerId, certificateId);
  }

  private async findOwned(learnerId: string, certificateId: string): Promise<CertificateRecord> {
    const record = await this.certificateRepo.findByCertificateId(certificateId);
    if (!record || record.learnerId !== learnerId) {
      throw new NotFoundError('Certificate not found');
    }
    return record;
  }

  private async isPaid(record: CertificateRecord): Promise<boolean> {
    return (await this.paymentRepo.countSucceeded(record.id)) > 0;
  }

  // Issuing fixes the name from the learner's profile and signs the record;
  // from then on only a recorded correction changes it
  private async ensureIssued(record: CertificateRecord): Promise<IssuedRecord> {
    if (record.recipientName && record.signature) return record as IssuedRecord;

    const recipientName = normalizePersonName(record.learner.name);
    const signature = signCertificate(signedFields(record, recipientName, record.revision));
    await this.certificateRepo.issue(record.id, recipientName, signature);
    return { ...record, recipientName, signature };
  }
}
