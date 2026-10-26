import { IAuthProvider } from '../core/interfaces/IAuthProvider';
import { IDataProvider } from '../core/interfaces/IDataProvider';
import { JWTAuthProvider } from '../infrastructure/auth/providers/JWTAuthProvider';
import { PrismaDataProvider } from '../infrastructure/database/providers/PrismaDataProvider';
import { prismaClient } from '../infrastructure/prisma/client';
import { LearnerRepository } from '../infrastructure/database/repositories/LearnerRepository';

/**
 * Provider Factory
 *
 * Singleton factory that manages provider initialization and switching.
 * Providers are selected based on environment variables, allowing zero-code
 * deployment across different platforms (Supabase, traditional hosting, etc.).
 */

export type AuthProviderType = 'jwt' | 'supabase';
export type DataProviderType = 'prisma' | 'supabase';

export interface ProviderConfig {
  auth: AuthProviderType;
  data: DataProviderType;
}

export class ProviderFactory {
  private static config: ProviderConfig = {
    auth: (process.env.AUTH_PROVIDER as AuthProviderType) || 'jwt',
    data: (process.env.DATA_PROVIDER as DataProviderType) || 'prisma',
  };

  private static dataProviderInstance: IDataProvider | null = null;
  private static authProviderInstance: IAuthProvider | null = null;

  /**
   * Get data provider instance (singleton)
   * @returns IDataProvider instance based on DATA_PROVIDER environment variable
   */
  static getDataProvider(): IDataProvider {
    if (!this.dataProviderInstance) {
      switch (this.config.data) {
        case 'supabase':
          // TODO: Implement SupabaseDataProvider
          // const supabaseClient = createClient(
          //   process.env.SUPABASE_URL!,
          //   process.env.SUPABASE_SERVICE_KEY!
          // );
          // this.dataProviderInstance = new SupabaseDataProvider(supabaseClient);
          console.warn(
            'Supabase provider not yet implemented. Falling back to Prisma.'
          );
          this.dataProviderInstance = new PrismaDataProvider(prismaClient);
          break;

        case 'prisma':
        default:
          this.dataProviderInstance = new PrismaDataProvider(prismaClient);
          console.log('✓ Using Prisma Data Provider');
          break;
      }
    }
    return this.dataProviderInstance;
  }

  /**
   * Get auth provider instance (singleton)
   * @returns IAuthProvider instance based on AUTH_PROVIDER environment variable
   */
  static getAuthProvider(): IAuthProvider {
    if (!this.authProviderInstance) {
      const dataProvider = this.getDataProvider();
      const learnerRepo = new LearnerRepository(dataProvider);

      switch (this.config.auth) {
        case 'supabase':
          // TODO: Implement SupabaseAuthProvider
          // this.authProviderInstance = new SupabaseAuthProvider(
          //   learnerRepo,
          //   process.env.SUPABASE_URL!,
          //   process.env.SUPABASE_SERVICE_KEY!
          // );
          console.warn(
            'Supabase auth provider not yet implemented. Falling back to JWT.'
          );
          this.authProviderInstance = new JWTAuthProvider(
            learnerRepo,
            process.env.JWT_SECRET || 'default-secret-change-in-production'
          );
          break;

        case 'jwt':
        default:
          const jwtSecret = process.env.JWT_SECRET;
          if (!jwtSecret && process.env.NODE_ENV === 'production') {
            throw new Error('JWT_SECRET environment variable is required in production');
          }
          this.authProviderInstance = new JWTAuthProvider(
            learnerRepo,
            jwtSecret || 'default-secret-change-in-production'
          );
          console.log('✓ Using JWT Auth Provider');
          break;
      }
    }
    return this.authProviderInstance;
  }

  /**
   * Get current provider configuration
   * @returns Current provider configuration
   */
  static getConfig(): ProviderConfig {
    return this.config;
  }

  /**
   * Reset provider instances (useful for testing)
   */
  static reset(): void {
    this.dataProviderInstance = null;
    this.authProviderInstance = null;
  }
}
