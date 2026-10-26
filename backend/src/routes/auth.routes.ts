import express from 'express';
import { ProviderFactory } from '../config/providers.config';
import { AuthService } from '../application/services/AuthService';
import { AppError } from '../core/errors/AppError';

const router = express.Router();

// Initialize AuthService with appropriate provider
const authProvider = ProviderFactory.getAuthProvider();
const authService = new AuthService(authProvider);

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const result = await authService.register(email, password, name);

    res.status(201).json({
      token: result.token,
      learner: result.user,
    });
  } catch (error: any) {
    console.error('Registration error:', error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: error.message,
      });
    }

    res.status(500).json({
      error: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.json({
      token: result.token,
      learner: result.user,
    });
  } catch (error: any) {
    console.error('Login error:', error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: error.message,
      });
    }

    res.status(500).json({
      error: 'Login failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;
