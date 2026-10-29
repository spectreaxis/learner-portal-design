import { IAuthProvider } from '../../core/interfaces/IAuthProvider';
import { ValidationError } from '../../core/errors/AppError';

/**
 * Auth Service
 *
 * Handles authentication business logic including validation,
 * delegating to the appropriate auth provider (JWT, Supabase, etc.).
 */

export class AuthService {
  constructor(private authProvider: IAuthProvider) {}

  async register(email: string, password: string, name: string) {
    // Validation
    if (!email || !password || !name) {
      throw new ValidationError('Email, password, and name are required');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ValidationError('Invalid email format');
    }

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    if (name.trim().length < 2) {
      throw new ValidationError('Name must be at least 2 characters');
    }

    return this.authProvider.register(email.trim().toLowerCase(), password, name.trim());
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    return this.authProvider.login(email.trim().toLowerCase(), password);
  }

  async verifyToken(token: string) {
    if (!token) {
      throw new ValidationError('Token is required');
    }

    return this.authProvider.verifyToken(token);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    if (!currentPassword || !newPassword) {
      throw new ValidationError('Current password and new password are required');
    }

    if (newPassword.length < 6) {
      throw new ValidationError('New password must be at least 6 characters');
    }

    if (currentPassword === newPassword) {
      throw new ValidationError('New password must be different from current password');
    }

    return this.authProvider.changePassword(userId, currentPassword, newPassword);
  }
}
