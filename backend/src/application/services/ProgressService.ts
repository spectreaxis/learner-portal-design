import { ProgressRepository } from '../../infrastructure/database/repositories/ProgressRepository';
import { LearnerRepository } from '../../infrastructure/database/repositories/LearnerRepository';
import { LessonRepository } from '../../infrastructure/database/repositories/LessonRepository';
import { NotFoundError, ValidationError } from '../../core/errors/AppError';

/**
 * Progress Service
 *
 * Handles progress tracking business logic including
 * lesson completion and progress updates.
 */

export class ProgressService {
  constructor(
    private progressRepo: ProgressRepository,
    private learnerRepo: LearnerRepository,
    private lessonRepo: LessonRepository
  ) {}

  async getProgress(learnerId: string) {
    const learner = await this.learnerRepo.findById(learnerId);
    if (!learner) {
      throw new NotFoundError('Learner not found');
    }

    return this.progressRepo.findByLearner(learnerId);
  }

  async updateProgress(learnerId: string, lessonId: string, completed: boolean) {
    // Verify learner exists
    const learner = await this.learnerRepo.findById(learnerId);
    if (!learner) {
      throw new NotFoundError('Learner not found');
    }

    // Verify lesson exists
    const lesson = await this.lessonRepo.findById(lessonId);
    if (!lesson) {
      throw new NotFoundError('Lesson not found');
    }

    // Update progress
    const progress = await this.progressRepo.upsertProgress(
      learnerId,
      lessonId,
      completed
    );

    // Update last activity timestamp
    await this.learnerRepo.updateActivity(learnerId);

    return progress;
  }
}
