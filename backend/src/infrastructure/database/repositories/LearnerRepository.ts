import { BaseRepository } from './BaseRepository';
import { IDataProvider } from '../../../core/interfaces/IDataProvider';

export interface Learner {
  id: string;
  email: string;
  password: string;
  name: string;
  avatar?: string | null;
  enrolledAt: Date;
  currentStreak: number;
  lastActivityAt: Date;
}

/**
 * Learner Repository
 *
 * Handles all database operations related to learners (users).
 */

export class LearnerRepository extends BaseRepository<Learner> {
  constructor(dataProvider: IDataProvider) {
    super('learner', dataProvider);
  }

  async findByEmail(email: string): Promise<Learner | null> {
    return this.dataProvider.findUnique<Learner>(this.model, { email });
  }

  async findWithProgress(learnerId: string): Promise<any> {
    return this.dataProvider.findById(this.model, learnerId, {
      include: {
        progress: {
          include: { lesson: true },
        },
        quizSubmissions: {
          orderBy: { submittedAt: 'desc' },
          take: 10,
        },
        certificates: {
          include: { module: true },
        },
      },
    });
  }

  async updateActivity(learnerId: string): Promise<void> {
    await this.dataProvider.update(
      this.model,
      { id: learnerId },
      { lastActivityAt: new Date() }
    );
  }

  async updateProfile(
    learnerId: string,
    data: { name?: string; email?: string; avatar?: string }
  ): Promise<Learner> {
    return this.dataProvider.update<Learner>(this.model, { id: learnerId }, data);
  }
}
