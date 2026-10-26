import { BaseRepository } from './BaseRepository';
import { IDataProvider } from '../../../core/interfaces/IDataProvider';

export interface Certificate {
  id: string;
  learnerId: string;
  moduleId: string;
  certificateId: string;
  verificationUrl: string;
  issuedAt: Date;
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

  async findByCertificateId(certificateId: string): Promise<any | null> {
    return this.dataProvider.findUnique(this.model, { certificateId }, {
      include: {
        learner: {
          select: {
            name: true,
            email: true,
          },
        },
        module: {
          select: {
            title: true,
            number: true,
          },
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
    verificationUrl: string;
  }): Promise<Certificate> {
    return this.dataProvider.create<Certificate>(this.model, {
      ...data,
      issuedAt: new Date(),
    });
  }

  async findCertificationById(certificationId: string): Promise<Certification | null> {
    return this.dataProvider.findById<Certification>('certification', certificationId);
  }

  async findCertificationByModule(moduleId: string): Promise<Certification | null> {
    return this.dataProvider.findUnique<Certification>('certification', { moduleId });
  }
}
