import { BaseRepository } from './BaseRepository';
import { IDataProvider } from '../../../core/interfaces/IDataProvider';

export interface Certificate {
  id: string;
  learnerId: string;
  moduleId: string;
  certificateId: string;
  earnedAt: Date;
  recipientName: string | null;
  revision: number;
  signature: string | null;
}

export interface CertificateRecord extends Certificate {
  learner: { name: string };
  module: { title: string; number: number };
  nameChanges: { revision: number; createdAt: Date }[];
}

export interface Certification {
  id: string;
  moduleId: string;
  title: string;
  questions: any; // JSON
  passingScore: number;
  order: number;
}

/**
 * Certificate Repository
 *
 * Handles all database operations related to certificates and certifications.
 */

export class CertificateRepository extends BaseRepository<Certificate> {
  constructor(dataProvider: IDataProvider) {
    super('certificate', dataProvider);
  }

  async findByCertificateId(certificateId: string): Promise<CertificateRecord | null> {
    return this.dataProvider.findUnique<CertificateRecord>(this.model, { certificateId }, {
      include: {
        learner: { select: { name: true } },
        module: { select: { title: true, number: true } },
        nameChanges: {
          select: { revision: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async findByLearnerAndModule(
    learnerId: string,
    moduleId: string
  ): Promise<Certificate | null> {
    return this.dataProvider.findUnique<Certificate>(this.model, {
      learnerId_moduleId: { learnerId, moduleId },
    });
  }

  async createCertificate(data: {
    learnerId: string;
    moduleId: string;
    certificateId: string;
  }): Promise<Certificate> {
    return this.dataProvider.create<Certificate>(this.model, {
      ...data,
      earnedAt: new Date(),
    });
  }

  async issue(id: string, recipientName: string, signature: string): Promise<void> {
    await this.dataProvider.update(this.model, { id }, { recipientName, signature });
  }

  /**
   * Renames an issued certificate and records the change in one transaction.
   * Matching on the current revision makes a concurrent correction fail
   * rather than both passing the correction limit.
   */
  async correctName(
    certificate: Certificate,
    change: { newName: string; reason: string; signature: string; ipAddress?: string }
  ): Promise<void> {
    const revision = certificate.revision + 1;
    await this.dataProvider.transaction([
      {
        model: this.model,
        operation: 'update',
        where: { id: certificate.id, revision: certificate.revision },
        data: { recipientName: change.newName, signature: change.signature, revision },
      },
      {
        model: 'certificateNameChange',
        operation: 'create',
        data: {
          certificateId: certificate.id,
          previousName: certificate.recipientName,
          newName: change.newName,
          reason: change.reason,
          revision,
          ipAddress: change.ipAddress,
        },
      },
    ]);
  }

  async findCertificationById(certificationId: string): Promise<Certification | null> {
    return this.dataProvider.findById<Certification>('certification', certificationId);
  }
}
