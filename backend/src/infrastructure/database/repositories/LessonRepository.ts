import { BaseRepository } from './BaseRepository';
import { IDataProvider } from '../../../core/interfaces/IDataProvider';

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: any; // JSON
  order: number;
}

/**
 * Lesson Repository
 *
 * Handles all database operations related to lessons.
 */

export class LessonRepository extends BaseRepository<Lesson> {
  constructor(dataProvider: IDataProvider) {
    super('lesson', dataProvider);
  }

  async findByModuleId(moduleId: string): Promise<Lesson[]> {
    return this.dataProvider.findMany<Lesson>(this.model, {
      where: { moduleId },
      orderBy: { order: 'asc' },
    });
  }

  async findByIdWithModule(lessonId: string): Promise<any | null> {
    return this.dataProvider.findById(this.model, lessonId, {
      include: { module: true },
    });
  }
}
