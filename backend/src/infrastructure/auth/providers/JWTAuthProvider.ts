import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IAuthProvider } from '../../../core/interfaces/IAuthProvider';
import { LearnerRepository } from '../../database/repositories/LearnerRepository';
import {
  AuthenticationError,
  ValidationError,
  ConflictError,
} from '../../../core/errors/AppError';

/**
 * JWT Authentication Provider
 *
 * Implements authentication using JSON Web Tokens and bcrypt for password hashing.
 * This is the traditional auth approach that works with any PostgreSQL database.
 */

export class JWTAuthProvider implements IAuthProvider {
  private jwtSecret: string;
  private learnerRepo: LearnerRepository;
  private tokenExpiry: string;

  constructor(learnerRepo: LearnerRepository, jwtSecret: string, tokenExpiry = '7d') {
    this.learnerRepo = learnerRepo;
    this.jwtSecret = jwtSecret;
    this.tokenExpiry = tokenExpiry;
  }

  async register(email: string, password: string, name: string) {
    // Check if user already exists
    const existing = await this.learnerRepo.findByEmail(email);
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create learner
    const learner = await this.learnerRepo.create({
      email,
      password: hashedPassword,
      name,
    });

    // Generate JWT token
    const token: string = jwt.sign(
      { userId: learner.id },
      this.jwtSecret,
      { expiresIn: this.tokenExpiry } as jwt.SignOptions
    );

    return {
      token,
      user: {
        id: learner.id,
        email: learner.email,
        name: learner.name,
      },
    };
  }

  async login(email: string, password: string) {
    // Find user by email
    const learner = await this.learnerRepo.findByEmail(email);
    if (!learner) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, learner.password);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Generate JWT token
    const token: string = jwt.sign(
      { userId: learner.id },
      this.jwtSecret,
      { expiresIn: this.tokenExpiry } as jwt.SignOptions
    );

    return {
      token,
      user: {
        id: learner.id,
        email: learner.email,
        name: learner.name,
      },
    };
  }

  async verifyToken(token: string): Promise<string> {
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, this.jwtSecret) as { userId: string };

      // Verify user still exists in database (prevents stale token attacks)
      const user = await this.learnerRepo.findById(decoded.userId);
      if (!user) {
        throw new AuthenticationError('User no longer exists. Please log in again.');
      }

      return decoded.userId;
    } catch (error: any) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError('Invalid or expired token');
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Find user
    const learner = await this.learnerRepo.findById(userId);
    if (!learner) {
      throw new AuthenticationError('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, learner.password);
    if (!isValidPassword) {
      throw new ValidationError('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.learnerRepo.update(userId, { password: hashedPassword });
  }

  async logout(userId: string): Promise<void> {
    // JWT is stateless, so logout is handled client-side by removing the token
    // This method is here for interface completeness and future session management
    // Could implement token blacklisting or refresh token revocation here
  }
}
