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
  passed: boolean;
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
      orderBy: { order: 'asc' },
    });
  }

  async createSubmission(data: {
    learnerId: string;
    quizId?: string;
    certificationId?: string;
    answers: any;
    score: number;
    passed: boolean;
  }): Promise<QuizSubmission> {
    return this.dataProvider.create<QuizSubmission>('quizSubmission', {
      ...data,
      submittedAt: new Date(),
    });
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
