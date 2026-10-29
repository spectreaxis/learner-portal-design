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

  // Case-insensitive so accounts created before emails were normalised still match
  async findByEmail(email: string): Promise<Learner | null> {
    const [learner] = await this.dataProvider.findMany<Learner>(this.model, {
      where: { email: { equals: email.trim(), mode: 'insensitive' } },
      take: 1,
    });
    return learner ?? null;
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
    const learner = await this.findById(learnerId);
    if (!learner) return;

    const now = new Date();
    const daysSinceLast = daysBetween(learner.lastActivityAt, now);

    // Same day keeps the streak (but starts it if this is the first activity),
    // the next day extends it, and any longer gap restarts it
    const currentStreak =
      daysSinceLast === 0
        ? Math.max(learner.currentStreak, 1)
        : daysSinceLast === 1
        ? learner.currentStreak + 1
        : 1;

    await this.dataProvider.update(
      this.model,
      { id: learnerId },
      { lastActivityAt: now, currentStreak }
    );
  }

  async updateProfile(
    learnerId: string,
    data: { name?: string; email?: string; avatar?: string }
  ): Promise<Learner> {
    return this.dataProvider.update<Learner>(this.model, { id: learnerId }, data);
  }
}

/** Number of calendar days (UTC) between two dates */
export function daysBetween(from: Date, to: Date): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const startOfDay = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.round((startOfDay(new Date(to)) - startOfDay(new Date(from))) / MS_PER_DAY);
}
