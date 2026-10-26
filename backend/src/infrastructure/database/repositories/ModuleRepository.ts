import { BaseRepository } from './BaseRepository';
import { IDataProvider } from '../../../core/interfaces/IDataProvider';

export interface Module {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
  estimatedHours: number;
  locked: boolean;
}

/**
 * Module Repository
 *
 * Handles all database operations related to course modules.
 */

export class ModuleRepository extends BaseRepository<Module> {
  constructor(dataProvider: IDataProvider) {
    super('module', dataProvider);
  }

  async findAllWithLessons(): Promise<any[]> {
    return this.dataProvider.findMany(this.model, {
      include: {
        lessons: {
          select: { id: true, title: true, order: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { number: 'asc' },
    });
  }

  async findByIdWithDetails(moduleId: string): Promise<any | null> {
    return this.dataProvider.findById(this.model, moduleId, {
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
        quizzes: {
          orderBy: { order: 'asc' },
        },
        activities: {
          orderBy: { order: 'asc' },
        },
        certifications: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findByNumber(number: number): Promise<Module | null> {
    return this.dataProvider.findUnique<Module>(this.model, { number });
  }
}
