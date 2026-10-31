import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { learnerRateLimiter, publicRateLimiter } from '../middleware/rate-limit.middleware';
import { ProviderFactory } from '../config/providers.config';
import { LearnerService } from '../application/services/LearnerService';
import { ProgressService } from '../application/services/ProgressService';
import { QuizService } from '../application/services/QuizService';
import { CertificateService } from '../application/services/CertificateService';
import { AuthService } from '../application/services/AuthService';
import { LearnerRepository } from '../infrastructure/database/repositories/LearnerRepository';
import { ProgressRepository } from '../infrastructure/database/repositories/ProgressRepository';
import { QuizRepository } from '../infrastructure/database/repositories/QuizRepository';
import { CertificateRepository } from '../infrastructure/database/repositories/CertificateRepository';
import { LessonRepository } from '../infrastructure/database/repositories/LessonRepository';
import { PaymentRepository } from '../infrastructure/database/repositories/PaymentRepository';
import { ActivityRepository } from '../infrastructure/database/repositories/ActivityRepository';
import { AppError } from '../core/errors/AppError';

const router = express.Router();

// Initialize data provider and repositories
const dataProvider = ProviderFactory.getDataProvider();
const authProvider = ProviderFactory.getAuthProvider();

const learnerRepo = new LearnerRepository(dataProvider);
const progressRepo = new ProgressRepository(dataProvider);
const lessonRepo = new LessonRepository(dataProvider);
const quizRepo = new QuizRepository(dataProvider);
const certificateRepo = new CertificateRepository(dataProvider);
const paymentRepo = new PaymentRepository(dataProvider);
const activityRepo = new ActivityRepository(dataProvider);

// Initialize services
const learnerService = new LearnerService(learnerRepo, quizRepo, activityRepo);
const progressService = new ProgressService(progressRepo, learnerRepo, lessonRepo, quizRepo);
const quizService = new QuizService(quizRepo, certificateRepo, learnerRepo, lessonRepo, progressRepo);
const certificateService = new CertificateService(certificateRepo, paymentRepo);
const authService = new AuthService(authProvider);

// Each learner has their own request budget, and all routes require authentication
router.use(learnerRateLimiter, authenticate);

// Get learner progress
router.get('/progress', async (req: AuthRequest, res) => {
  try {
    const learner = await learnerService.getProgress(req.userId!);

    // Progress changes after every lesson and quiz; a cached copy shows stale data
    res.setHeader('Cache-Control', 'no-store');
    res.json(learner);
  } catch (error: any) {
    console.error('Progress fetch error:', error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Update lesson progress
router.post('/progress', async (req: AuthRequest, res) => {
  try {
    const { lessonId, completed } = req.body;

    // ProgressService validates the lesson and enforces the self-check quiz gate
    const progress = await progressService.updateProgress(
      req.userId!,
      lessonId,
      completed
    );

    res.json(progress);
  } catch (error: any) {
    console.error('Progress update error:', error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Submit quiz or certification
router.post('/quizzes', async (req: AuthRequest, res) => {
  try {
    const { quizId, answers } = req.body;

    // Try to find as quiz first
    const quiz = await quizRepo.findById(quizId);

    let result;
    if (quiz) {
      // It's a quiz
      result = await quizService.submitQuiz(req.userId!, quizId, answers);
    } else {
      // Try as certification
      const certification = await certificateRepo.findCertificationById(quizId);
      if (!certification) {
        return res.status(404).json({ error: 'Quiz or certification not found' });
      }
      result = await quizService.submitCertification(req.userId!, quizId, answers);
    }

    res.json(result);
  } catch (error: any) {
    console.error('Quiz submission error:', error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

// Update profile
router.put('/profile', async (req: AuthRequest, res) => {
  try {
    const { name, email } = req.body;

    const updatedLearner = await learnerService.updateProfile(req.userId!, {
      name,
      email,
    });

    res.json(updatedLearner);
  } catch (error: any) {
    console.error('Profile update error:', error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/password', async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    await authService.changePassword(req.userId!, currentPassword, newPassword);

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Password change error:', error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Track activity completion
router.post('/activities', async (req: AuthRequest, res) => {
  try {
    const { activityId, completed } = req.body;

    await learnerService.setActivityCompleted(req.userId!, activityId, completed !== false);

    res.json({ success: true, activityId, completed });
  } catch (error: any) {
    console.error('Activity tracking error:', error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to track activity' });
  }
});

// The learner's own certificate; the first view after payment issues it
router.get('/certificates/:certificateId/details', async (req: AuthRequest, res) => {
  try {
    const certificate = await certificateService.getForLearner(
      req.userId!,
      req.params.certificateId as string
    );

    res.setHeader('Cache-Control', 'no-store');
    res.json(certificate);
  } catch (error: any) {
    console.error('Certificate fetch error:', error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to load certificate' });
  }
});

// Correct the name on an issued certificate (re-signs it and records the change)
router.post('/certificates/:certificateId/name-corrections', async (req: AuthRequest, res) => {
  try {
    const { name, reason } = req.body;

    const certificate = await certificateService.correctName(
      req.userId!,
      req.params.certificateId as string,
      { name, reason, ipAddress: req.ip }
    );

    res.json(certificate);
  } catch (error: any) {
    console.error('Certificate name correction error:', error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to correct the name' });
  }
});

// Public endpoint - certificate verification (no auth required)
const certificateRouter = express.Router();

certificateRouter.get('/certificates/:certificateId', publicRateLimiter, async (req, res) => {
  try {
    const certificate = await certificateService.verifyCertificate(
      req.params.certificateId as string
    );

    res.json(certificate);
  } catch (error: any) {
    console.error('Certificate verification error:', error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to verify certificate' });
  }
});

export { certificateRouter };
export default router;
