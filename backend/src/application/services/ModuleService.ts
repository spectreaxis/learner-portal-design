import { ModuleRepository } from '../../infrastructure/database/repositories/ModuleRepository';
import { LessonRepository } from '../../infrastructure/database/repositories/LessonRepository';
import { NotFoundError } from '../../core/errors/AppError';

/**
 * Module Service
 *
 * Handles module and lesson-related business logic including
 * content retrieval and caching.
 */

export class ModuleService {
  constructor(
    private moduleRepo: ModuleRepository,
    private lessonRepo: LessonRepository
  ) {}

  async getAllModules() {
    return this.moduleRepo.findAllWithLessons();
  }

  async getModuleById(moduleId: string) {
    const module = await this.moduleRepo.findByIdWithDetails(moduleId);
    if (!module) {
      throw new NotFoundError('Module not found');
    }

    return module;
  }

  async getLessonById(lessonId: string) {
    const lesson = await this.lessonRepo.findByIdWithModule(lessonId);
    if (!lesson) {
      throw new NotFoundError('Lesson not found');
    }

    return lesson;
  }

  async getLessonsByModule(moduleId: string) {
    const module = await this.moduleRepo.findById(moduleId);
    if (!module) {
      throw new NotFoundError('Module not found');
    }

    return this.lessonRepo.findByModuleId(moduleId);
  }
}
