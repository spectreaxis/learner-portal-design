import { BaseRepository } from './BaseRepository';
import { IDataProvider } from '../../../core/interfaces/IDataProvider';

export interface LessonProgress {
  id: string;
  learnerId: string;
  lessonId: string;
  completed: boolean;
  completedAt: Date | null;
}

/**
 * Progress Repository
 *
 * Handles all database operations related to lesson progress tracking.
 */

export class ProgressRepository extends BaseRepository<LessonProgress> {
  constructor(dataProvider: IDataProvider) {
    super('lessonProgress', dataProvider);
  }

  async upsertProgress(
    learnerId: string,
    lessonId: string,
    completed: boolean
  ): Promise<LessonProgress> {
    return this.dataProvider.upsert<LessonProgress>(
      this.model,
      {
        learnerId_lessonId: {
          learnerId,
          lessonId,
        },
      },
      {
        learnerId,
        lessonId,
        completed,
        completedAt: completed ? new Date() : null,
      },
      {
        completed,
        completedAt: completed ? new Date() : null,
      }
    );
  }

  async findByLearner(learnerId: string): Promise<LessonProgress[]> {
    return this.dataProvider.findMany<LessonProgress>(this.model, {
      where: { learnerId },
      include: { lesson: true },
      orderBy: { completedAt: 'desc' },
    });
  }

  async findByLearnerAndLesson(
    learnerId: string,
    lessonId: string
  ): Promise<LessonProgress | null> {
    return this.dataProvider.findUnique<LessonProgress>(this.model, {
      learnerId_lessonId: { learnerId, lessonId },
    });
  }
}
