import express from 'express';
import { ProviderFactory } from '../config/providers.config';
import { ModuleService } from '../application/services/ModuleService';
import { ModuleRepository } from '../infrastructure/database/repositories/ModuleRepository';
import { LessonRepository } from '../infrastructure/database/repositories/LessonRepository';
import { AppError } from '../core/errors/AppError';
import { getQuizAfterLessonOrder, SELF_CHECK_QUIZ_TYPE } from '../core/utils/quiz-placement';

const router = express.Router();

// Initialize data provider and repositories
const dataProvider = ProviderFactory.getDataProvider();
const moduleRepo = new ModuleRepository(dataProvider);
const lessonRepo = new LessonRepository(dataProvider);

// Initialize service
const moduleService = new ModuleService(moduleRepo, lessonRepo);

// Get all modules
router.get('/', async (req, res) => {
  try {
    const modules = await moduleService.getAllModules();

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.json(modules);
  } catch (error: any) {
    console.error('Modules fetch error:', error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to fetch modules' });
  }
});

// Get single module
router.get('/:moduleId', async (req, res) => {
  try {
    const module = await moduleService.getModuleById(req.params.moduleId);

    // Transform to match frontend expected format
    const transformed: any = {
      ...module,
      selfCheckQuizzes: (module.quizzes || [])
        .filter((q: any) => q.type === SELF_CHECK_QUIZ_TYPE)
        .map((q: any) => ({
          id: q.id,
          title: q.title,
          questions: q.questions,
          // Lesson order the quiz follows; it must be passed before moving past that lesson
          afterLessonOrder: getQuizAfterLessonOrder(q.title),
        })),
      handsOnActivity: module.activities?.[0]
        ? {
            ...(module.activities[0].content as Record<string, any>),
            // After the spread: the seeded content has its own "id" that must not
            // replace the database ID used to record completion
            id: module.activities[0].id,
            title: module.activities[0].title,
            description: module.activities[0].description,
          }
        : undefined,
      certificationAssessment: module.certifications?.[0]
        ? {
            id: module.certifications[0].id,
            // Strip the answer key: certification is scored server-side only
            questions: (((module.certifications[0].content as Record<string, any>)?.questions || []) as any[])
              .map(({ answer: _answer, explanation: _explanation, ...question }) => question),
            requiredScore: module.certifications[0].requiredScore,
          }
        : undefined,
    };

    // Remove the raw database fields
    delete transformed.quizzes;
    delete transformed.activities;
    delete transformed.certifications;

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.json(transformed);
  } catch (error: any) {
    console.error('Module fetch error:', error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to fetch module' });
  }
});

// Get lesson
router.get('/:moduleId/lessons/:lessonId', async (req, res) => {
  try {
    const lesson = await moduleService.getLessonById(req.params.lessonId);

    if ((lesson as any).moduleId !== req.params.moduleId) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.json(lesson);
  } catch (error: any) {
    console.error('Lesson fetch error:', error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

export default router;
