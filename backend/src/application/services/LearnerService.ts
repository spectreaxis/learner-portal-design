import { LearnerRepository } from '../../infrastructure/database/repositories/LearnerRepository';
import { ProgressRepository } from '../../infrastructure/database/repositories/ProgressRepository';
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from '../../core/errors/AppError';

/**
 * Learner Service
 *
 * Handles learner-related business logic including profile management,
 * progress tracking, and activity monitoring.
 */

export class LearnerService {
  constructor(
    private learnerRepo: LearnerRepository,
    private progressRepo: ProgressRepository
  ) {}

  async getProgress(learnerId: string) {
    const learner = await this.learnerRepo.findWithProgress(learnerId);
    if (!learner) {
      throw new NotFoundError('Learner not found');
    }

    return learner;
  }

  async updateLessonProgress(learnerId: string, lessonId: string, completed: boolean) {
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

  async updateProfile(
    learnerId: string,
    data: { name?: string; email?: string; avatar?: string }
  ) {
    // Validate input
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new ValidationError('Invalid email format');
    }

    if (data.name && data.name.trim().length < 2) {
      throw new ValidationError('Name must be at least 2 characters');
    }

    // Check email uniqueness if email is being changed
    if (data.email) {
      const existing = await this.learnerRepo.findByEmail(data.email);
      if (existing && existing.id !== learnerId) {
        throw new ConflictError('Email already in use');
      }
    }

    // Update profile
    const updatedLearner = await this.learnerRepo.updateProfile(learnerId, data);

    return {
      id: updatedLearner.id,
      name: updatedLearner.name,
      email: updatedLearner.email,
      avatar: updatedLearner.avatar,
      enrolledAt: updatedLearner.enrolledAt,
      currentStreak: updatedLearner.currentStreak,
    };
  }

  async trackActivity(learnerId: string) {
    await this.learnerRepo.updateActivity(learnerId);
  }
}
