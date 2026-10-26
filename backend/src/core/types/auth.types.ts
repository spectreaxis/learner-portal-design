import { Request } from 'express';

/**
 * Shared authentication types
 */

export interface AuthRequest extends Request {
  userId?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface TokenPayload {
  userId: string;
  email?: string;
  iat?: number;
  exp?: number;
}
