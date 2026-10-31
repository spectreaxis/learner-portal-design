import { QuizRepository } from '../../infrastructure/database/repositories/QuizRepository';
import { CertificateRepository } from '../../infrastructure/database/repositories/CertificateRepository';
import { LearnerRepository } from '../../infrastructure/database/repositories/LearnerRepository';
import { LessonRepository } from '../../infrastructure/database/repositories/LessonRepository';
import { ProgressRepository } from '../../infrastructure/database/repositories/ProgressRepository';
import { newCertificateId } from './CertificateService';
import { NotFoundError, ValidationError } from '../../core/errors/AppError';
import { SELF_CHECK_PASSING_PERCENTAGE, SELF_CHECK_QUIZ_TYPE } from '../../core/utils/quiz-placement';

/**
 * Quiz Service
 *
 * Handles quiz and certification business logic including
 * submissions, scoring, and certificate awarding.
 */

export class QuizService {
  constructor(
    private quizRepo: QuizRepository,
    private certificateRepo: CertificateRepository,
    private learnerRepo: LearnerRepository,
    private lessonRepo: LessonRepository,
    private progressRepo: ProgressRepository
  ) {}

  async submitQuiz(
    learnerId: string,
    quizId: string,
    answers: any
  ) {
    // Verify learner exists
    const learner = await this.learnerRepo.findById(learnerId);
    if (!learner) {
      throw new NotFoundError('Learner not found');
    }

    // Verify quiz exists with module info
    const quiz: any = await this.quizRepo.dataProvider.findById('quiz', quizId, {
      include: { module: true }
    });
    if (!quiz) {
      throw new NotFoundError('Quiz not found');
    }

    // Calculate score
    const questions = quiz.questions as any[];
    let correctAnswers = 0;

    questions.forEach((q: any) => {
      if (answers[q.id]?.toLowerCase() === q.answer?.toLowerCase()) {
        correctAnswers++;
      }
    });

    const percentage = Math.round((correctAnswers / questions.length) * 100);
    const passed = percentage >= SELF_CHECK_PASSING_PERCENTAGE;

    // Create submission
    const submission = await this.quizRepo.createSubmission({
      learnerId,
      quizId,
      answers,
      score: correctAnswers,
      maxScore: questions.length,
      passed,
    });

    // Update last activity
    await this.learnerRepo.updateActivity(learnerId);

    return { submission };
  }

  async submitCertification(
    learnerId: string,
    certificationId: string,
    answers: any
  ) {
    // Verify learner exists
    const learner = await this.learnerRepo.findById(learnerId);
    if (!learner) {
      throw new NotFoundError('Learner not found');
    }

    // Verify certification exists with module info
    const certification: any = await this.certificateRepo.dataProvider.findById(
      'certification',
      certificationId,
      { include: { module: true } }
    );
    if (!certification) {
      throw new NotFoundError('Certification not found');
    }

    await this.assertReadyForCertification(learnerId, certification.moduleId);

    // Calculate score
    const questions = (certification.content as any).questions;
    let correctAnswers = 0;

    questions.forEach((q: any) => {
      if (answers[q.id]?.toLowerCase() === q.answer?.toLowerCase()) {
        correctAnswers++;
      }
    });

    const percentage = Math.round((correctAnswers / questions.length) * 100);
    const requiredScore = certification.requiredScore || 70;
    const passed = percentage >= requiredScore;

    // Create submission
    const submission = await this.quizRepo.createSubmission({
      learnerId,
      certificationId,
      answers,
      score: correctAnswers,
      maxScore: questions.length,
      passed,
    });

    // Certificate generation for passing certification assessments
    let certificateRecord = null;
    if (passed) {
      // Check if certificate already exists
      const existingCertificate =
        await this.certificateRepo.findByLearnerAndModule(
          learnerId,
          certification.moduleId
        );

      if (!existingCertificate) {
        certificateRecord = await this.certificateRepo.createCertificate({
          learnerId,
          moduleId: certification.moduleId,
          certificateId: newCertificateId(certification.module.number),
        });
      } else {
        certificateRecord = existingCertificate;
      }
    }

    // Update last activity
    await this.learnerRepo.updateActivity(learnerId);

    return { submission, certificate: certificateRecord };
  }

  /** The assessment unlocks only after every lesson is completed and every self-check quiz passed */
  private async assertReadyForCertification(learnerId: string, moduleId: string) {
    const [lessons, progress, quizzes, passedQuizIds] = await Promise.all([
      this.lessonRepo.findByModuleId(moduleId),
      this.progressRepo.findByLearner(learnerId),
      this.quizRepo.findByModuleId(moduleId),
      this.quizRepo.findPassedQuizIds(learnerId),
    ]);

    const completedLessonIds = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId));
    if (lessons.some((lesson) => !completedLessonIds.has(lesson.id))) {
      throw new ValidationError('Complete all lessons before taking the certification assessment');
    }

    const passed = new Set(passedQuizIds);
    const unpassedQuiz = quizzes.find((q) => q.type === SELF_CHECK_QUIZ_TYPE && !passed.has(q.id));
    if (unpassedQuiz) {
      throw new ValidationError(`Pass "${unpassedQuiz.title}" before taking the certification assessment`);
    }
  }
}
