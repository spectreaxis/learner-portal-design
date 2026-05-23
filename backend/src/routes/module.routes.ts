import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all modules
router.get('/', async (req, res) => {
  try {
    const modules = await prisma.module.findMany({
      include: {
        lessons: {
          select: { id: true, title: true, order: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { number: 'asc' },
    });

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.json(modules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
});

// Get single module
router.get('/:moduleId', async (req, res) => {
  try {
    const module = await prisma.module.findUnique({
      where: { id: req.params.moduleId },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
        quizzes: true,
        activities: true,
      },
    });

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.json(module);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch module' });
  }
});

// Get lesson
router.get('/:moduleId/lessons/:lessonId', async (req, res) => {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params.lessonId },
      include: { module: true },
    });

    if (!lesson || lesson.moduleId !== req.params.moduleId) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

export default router;
