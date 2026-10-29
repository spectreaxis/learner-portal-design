import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
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

// Initialize services
const learnerService = new LearnerService(learnerRepo, progressRepo);
const progressService = new ProgressService(progressRepo, learnerRepo, lessonRepo);
const quizService = new QuizService(quizRepo, certificateRepo, learnerRepo);
const certificateService = new CertificateService(certificateRepo, paymentRepo);
const authService = new AuthService(authProvider);

// All routes require authentication
router.use(authenticate);

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

    const progress = await learnerService.updateLessonProgress(
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

    await learnerService.trackActivity(req.userId!);

    res.json({ success: true, activityId, completed });
  } catch (error: any) {
    console.error('Activity tracking error:', error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to track activity' });
  }
});

// Public endpoint - certificate verification (no auth required)
const certificateRouter = express.Router();

certificateRouter.get('/certificates/:certificateId', async (req, res) => {
  try {
    const certificate = await certificateService.verifyCertificate(
      req.params.certificateId
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
