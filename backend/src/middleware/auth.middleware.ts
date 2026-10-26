import { Request, Response, NextFunction } from 'express';
import { ProviderFactory } from '../config/providers.config';
import { AppError } from '../core/errors/AppError';

export interface AuthRequest extends Request {
  userId?: string;
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Use auth provider to verify token
    const authProvider = ProviderFactory.getAuthProvider();
    const userId = await authProvider.verifyToken(token);

    req.userId = userId;
    next();
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
