import { BaseRepository } from './BaseRepository';
import { IDataProvider } from '../../../core/interfaces/IDataProvider';

export interface Quiz {
  id: string;
  moduleId: string;
  title: string;
  questions: any; // JSON
  passingScore: number;
  type: string;
  order: number;
}

export interface QuizSubmission {
  id: string;
  learnerId: string;
  quizId: string;
  certificationId: string | null;
  answers: any; // JSON
  score: number;
  maxScore: number;
  passed: boolean;
  submittedAt: Date;
}

export interface LatestQuizResult {
  score: number;
  maxScore: number;
  passed: boolean;
  answers: Record<string, string>;
  submittedAt: Date;
}

/**
 * Quiz Repository
 *
 * Handles all database operations related to quizzes and quiz submissions.
 */

export class QuizRepository extends BaseRepository<Quiz> {
  constructor(dataProvider: IDataProvider) {
    super('quiz', dataProvider);
  }

  async findByModuleId(moduleId: string): Promise<Quiz[]> {
    return this.dataProvider.findMany<Quiz>(this.model, {
      where: { moduleId },
      // Quiz has no order column; titles are numbered ("Self-Check Quiz 1", "2", ...)
      orderBy: { title: 'asc' },
    });
  }

  async createSubmission(data: {
    learnerId: string;
    quizId?: string;
    certificationId?: string;
    answers: any;
    score: number;
    maxScore: number;
    passed: boolean;
  }): Promise<QuizSubmission> {
    return this.dataProvider.create<QuizSubmission>('quizSubmission', {
      ...data,
      submittedAt: new Date(),
    });
  }

  /**
   * The learner's most recent submission for each quiz and certification,
   * keyed by quiz or certification ID, so finished attempts can be shown again
   */
  async findLatestResults(learnerId: string): Promise<Record<string, LatestQuizResult>> {
    const submissions = await this.dataProvider.findMany<QuizSubmission>('quizSubmission', {
      where: { learnerId },
      orderBy: { submittedAt: 'desc' },
    });

    const latest: Record<string, LatestQuizResult> = {};
    for (const s of submissions) {
      const key = s.quizId ?? s.certificationId;
      if (!key || latest[key]) continue;
      latest[key] = {
        score: s.score,
        maxScore: s.maxScore,
        passed: s.passed,
        answers: s.answers,
        submittedAt: s.submittedAt,
      };
    }
    return latest;
  }

  /** IDs of self-check quizzes the learner has passed at least once */
  async findPassedQuizIds(learnerId: string): Promise<string[]> {
    const submissions = await this.dataProvider.findMany<QuizSubmission>('quizSubmission', {
      where: { learnerId, passed: true, quizId: { not: null } },
    });
    return [...new Set(submissions.map((s) => s.quizId))];
  }

  async findSubmissionsByLearner(learnerId: string): Promise<QuizSubmission[]> {
    return this.dataProvider.findMany<QuizSubmission>('quizSubmission', {
      where: { learnerId },
      orderBy: { submittedAt: 'desc' },
      take: 10,
    });
  }

  async findSubmissionById(submissionId: string): Promise<QuizSubmission | null> {
    return this.dataProvider.findById<QuizSubmission>('quizSubmission', submissionId);
  }
}
