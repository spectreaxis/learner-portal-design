import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = express.Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticate);

// Get learner progress
router.get('/progress', async (req: AuthRequest, res) => {
  try {
    const learner = await prisma.learner.findUnique({
      where: { id: req.userId },
      include: {
        progress: {
          include: { lesson: true },
          orderBy: { completedAt: 'desc' },
        },
        quizSubmissions: {
          orderBy: { submittedAt: 'desc' },
          take: 10,
        },
        certificates: true,
      },
    });

    res.setHeader('Cache-Control', 'private, max-age=60');
    res.json(learner);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Update lesson progress
router.post('/progress', async (req: AuthRequest, res) => {
  try {
    const { lessonId, completed } = req.body;

    const progress = await prisma.lessonProgress.upsert({
      where: {
        learnerId_lessonId: {
          learnerId: req.userId!,
          lessonId,
        },
      },
      update: {
        completed,
        completedAt: completed ? new Date() : null,
      },
      create: {
        learnerId: req.userId!,
        lessonId,
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    // Update last activity
    await prisma.learner.update({
      where: { id: req.userId },
      data: { lastActivityAt: new Date() },
    });

    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Submit quiz
router.post('/quizzes', async (req: AuthRequest, res) => {
  try {
    const { quizId, answers } = req.body;

    // Get quiz questions
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Calculate score
    const questions = quiz.questions as any[];
    let score = 0;
    questions.forEach((q) => {
      if (answers[q.id]?.toLowerCase() === q.answer.toLowerCase()) {
        score++;
      }
    });

    const passed = score >= (questions.length * 0.7); // 70% passing

    const submission = await prisma.quizSubmission.create({
      data: {
        learnerId: req.userId!,
        quizId,
        answers,
        score,
        maxScore: questions.length,
        passed,
      },
    });

    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

export default router;
