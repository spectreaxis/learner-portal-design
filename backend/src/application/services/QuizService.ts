import { QuizRepository } from '../../infrastructure/database/repositories/QuizRepository';
import { CertificateRepository } from '../../infrastructure/database/repositories/CertificateRepository';
import { LearnerRepository } from '../../infrastructure/database/repositories/LearnerRepository';
import { NotFoundError, ValidationError } from '../../core/errors/AppError';

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
    private learnerRepo: LearnerRepository
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
    const requiredScore = 70;
    const passed = percentage >= requiredScore;

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
        // Generate unique certificate ID
        const moduleNumber = certification.module.number;
        const timestamp = Date.now().toString(36).toUpperCase();
        const certificateId = `IIAIC-M${moduleNumber}-${timestamp}`;

        certificateRecord = await this.certificateRepo.createCertificate({
          learnerId,
          moduleId: certification.moduleId,
          certificateId,
          verificationUrl: `${process.env.APP_URL || 'http://localhost:3000'}/certificate/${certificateId}`,
        });
      } else {
        certificateRecord = existingCertificate;
      }
    }

    // Update last activity
    await this.learnerRepo.updateActivity(learnerId);

    return { submission, certificate: certificateRecord };
  }
}
