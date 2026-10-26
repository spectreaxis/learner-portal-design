import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton
 *
 * This ensures only one instance of PrismaClient is created throughout the application,
 * preventing connection pool exhaustion and improving performance.
 */

declare global {
  // Allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prismaClient =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prismaClient;
}

/**
 * Gracefully disconnect Prisma Client on application shutdown
 */
export async function disconnectPrisma() {
  await prismaClient.$disconnect();
}
