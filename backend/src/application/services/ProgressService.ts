import { ProgressRepository } from '../../infrastructure/database/repositories/ProgressRepository';
import { LearnerRepository } from '../../infrastructure/database/repositories/LearnerRepository';
import { LessonRepository } from '../../infrastructure/database/repositories/LessonRepository';
import { QuizRepository } from '../../infrastructure/database/repositories/QuizRepository';
import { NotFoundError, ValidationError } from '../../core/errors/AppError';
import { getQuizzesRequiredForLesson } from '../../core/utils/quiz-placement';

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
    private lessonRepo: LessonRepository,
    private quizRepo: QuizRepository
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

    // A lesson can't be completed until every self-check quiz up to it is passed
    if (completed) {
      await this.assertRequiredQuizzesPassed(learnerId, lesson.moduleId, lesson.order);
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

  async assertRequiredQuizzesPassed(learnerId: string, moduleId: string, lessonOrder: number) {
    const quizzes = await this.quizRepo.findByModuleId(moduleId);
    const required = getQuizzesRequiredForLesson(quizzes, lessonOrder);
    if (required.length === 0) return;

    const passedQuizIds = new Set(await this.quizRepo.findPassedQuizIds(learnerId));
    const firstUnpassed = required.find((quiz) => !passedQuizIds.has(quiz.id));
    if (firstUnpassed) {
      throw new ValidationError(`Pass "${firstUnpassed.title}" before continuing`);
    }
  }
}
