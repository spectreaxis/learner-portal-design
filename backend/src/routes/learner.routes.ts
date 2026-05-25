import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import bcrypt from 'bcryptjs';

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
    console.error('Progress update error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Submit quiz
router.post('/quizzes', async (req: AuthRequest, res) => {
  try {
    const { quizId, answers } = req.body;

    // Get quiz with module info
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { module: true }
    });

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

    const percentage = Math.round((score / questions.length) * 100);
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

    // Certificate generation for certification quizzes with 80%+ score
    let certificate = null;
    if (quiz.type === 'certification' && percentage >= 80) {
      // Check if certificate already exists
      const existingCert = await prisma.certificate.findUnique({
        where: {
          learnerId_moduleId: {
            learnerId: req.userId!,
            moduleId: quiz.moduleId
          }
        }
      });

      if (!existingCert) {
        // Generate unique certificate ID
        const moduleNumber = quiz.module.number;
        const timestamp = Date.now().toString(36).toUpperCase();
        const certificateId = `IIAIC-M${moduleNumber}-${timestamp}`;

        certificate = await prisma.certificate.create({
          data: {
            learnerId: req.userId!,
            moduleId: quiz.moduleId,
            certificateId,
            verificationUrl: `${process.env.APP_URL || 'http://localhost:3000'}/certificate/${certificateId}`
          }
        });
      } else {
        certificate = existingCert;
      }
    }

    res.json({ submission, certificate });
  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

// Update profile
router.put('/profile', async (req: AuthRequest, res) => {
  try {
    const { name, email } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.learner.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== req.userId) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Update profile
    const updatedLearner = await prisma.learner.update({
      where: { id: req.userId },
      data: { name, email },
      select: {
        id: true,
        name: true,
        email: true,
        enrolledAt: true,
        currentStreak: true,
      },
    });

    res.json(updatedLearner);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/password', async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Get current user
    const learner = await prisma.learner.findUnique({
      where: { id: req.userId },
    });

    if (!learner) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, learner.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.learner.update({
      where: { id: req.userId },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Track activity completion
router.post('/activities', async (req: AuthRequest, res) => {
  try {
    const { activityId, completed } = req.body;

    // Update last activity timestamp
    await prisma.learner.update({
      where: { id: req.userId },
      data: { lastActivityAt: new Date() }
    });

    // For now, we just track activity views
    // Could add ActivityCompletion table later if needed

    res.json({ success: true, activityId, completed });
  } catch (error) {
    console.error('Activity tracking error:', error);
    res.status(500).json({ error: 'Failed to track activity' });
  }
});

// Public endpoint - certificate verification (no auth required)
const certificateRouter = express.Router();

certificateRouter.get('/certificates/:certificateId', async (req, res) => {
  try {
    const certificate = await prisma.certificate.findUnique({
      where: { certificateId: req.params.certificateId },
      include: {
        learner: { select: { name: true, email: true } },
        module: { select: { number: true, title: true } }
      }
    });

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json(certificate);
  } catch (error) {
    console.error('Certificate verification error:', error);
    res.status(500).json({ error: 'Failed to verify certificate' });
  }
});

export { certificateRouter };
export default router;
