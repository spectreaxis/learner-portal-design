import { IAuthProvider } from '../core/interfaces/IAuthProvider';
import { IDataProvider } from '../core/interfaces/IDataProvider';
import { IPaymentProvider } from '../core/interfaces/IPaymentProvider';
import { JWTAuthProvider } from '../infrastructure/auth/providers/JWTAuthProvider';
import { PrismaDataProvider } from '../infrastructure/database/providers/PrismaDataProvider';
import { PaystackProvider } from '../infrastructure/payments/PaystackProvider';
import { prismaClient } from '../infrastructure/prisma/client';
import { LearnerRepository } from '../infrastructure/database/repositories/LearnerRepository';
import { NotFoundError } from '../core/errors/AppError';

/**
 * Provider Factory
 *
 * Singleton factory that manages provider initialization and switching.
 * Providers are selected based on environment variables, allowing zero-code
 * deployment across different platforms (Supabase, traditional hosting, etc.).
 */

export type AuthProviderType = 'jwt' | 'supabase';
export type DataProviderType = 'prisma' | 'supabase';
export type PaymentProviderType = 'paystack';

export interface ProviderConfig {
  auth: AuthProviderType;
  data: DataProviderType;
  payment: PaymentProviderType;
}

export class ProviderFactory {
  private static config: ProviderConfig = {
    auth: (process.env.AUTH_PROVIDER as AuthProviderType) || 'jwt',
    data: (process.env.DATA_PROVIDER as DataProviderType) || 'prisma',
    payment: (process.env.PAYMENT_PROVIDER as PaymentProviderType) || 'paystack',
  };

  private static dataProviderInstance: IDataProvider | null = null;
  private static authProviderInstance: IAuthProvider | null = null;
  private static paymentProviderInstances = new Map<string, IPaymentProvider>();

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
   * Get a payment provider instance (singleton per provider)
   * @param name - Provider that owns an existing payment; defaults to PAYMENT_PROVIDER for new ones
   * @returns IPaymentProvider instance
   */
  static getPaymentProvider(name: string = this.config.payment): IPaymentProvider {
    let provider = this.paymentProviderInstances.get(name);
    if (!provider) {
      switch (name) {
        case 'paystack': {
          const secretKey = process.env.PAYSTACK_SECRET_KEY;
          if (!secretKey) {
            throw new Error('PAYSTACK_SECRET_KEY environment variable is required for Paystack payments');
          }
          if (process.env.NODE_ENV === 'production' && secretKey.startsWith('sk_test_')) {
            console.warn('⚠️ Paystack is using a TEST secret key in production');
          }
          provider = new PaystackProvider(secretKey);
          break;
        }
        default:
          throw new NotFoundError(`Unknown payment provider: ${name}`);
      }
      this.paymentProviderInstances.set(name, provider);
    }
    return provider;
  }

  /**
   * Get current provider configuration
   * @returns Current provider configuration
   */
  static getConfig(): ProviderConfig {
    return this.config;
  }
}
