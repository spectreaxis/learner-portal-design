import { PrismaClient } from '@prisma/client';
import {
  IDataProvider,
  FindOptions,
  FindManyOptions,
  TransactionOperation,
} from '../../../core/interfaces/IDataProvider';

/**
 * Prisma Data Provider
 *
 * Wrapper around Prisma Client that implements the IDataProvider interface.
 * This allows the application to use Prisma while maintaining abstraction.
 */

export class PrismaDataProvider implements IDataProvider {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findById<T>(model: string, id: string, options?: FindOptions): Promise<T | null> {
    const prismaModel = this.getPrismaModel(model);
    return (await prismaModel.findUnique({
      where: { id },
      ...options,
    })) as T | null;
  }

  async findUnique<T>(
    model: string,
    where: Record<string, any>,
    options?: FindOptions
  ): Promise<T | null> {
    const prismaModel = this.getPrismaModel(model);
    return (await prismaModel.findUnique({
      where,
      ...options,
    })) as T | null;
  }

  async findMany<T>(model: string, options?: FindManyOptions): Promise<T[]> {
    const prismaModel = this.getPrismaModel(model);
    return (await prismaModel.findMany(options)) as T[];
  }

  async create<T>(model: string, data: Record<string, any>): Promise<T> {
    const prismaModel = this.getPrismaModel(model);
    return (await prismaModel.create({ data })) as T;
  }

  async update<T>(
    model: string,
    where: Record<string, any>,
    data: Record<string, any>
  ): Promise<T> {
    const prismaModel = this.getPrismaModel(model);
    return (await prismaModel.update({ where, data })) as T;
  }

  async updateMany(
    model: string,
    where: Record<string, any>,
    data: Record<string, any>
  ): Promise<number> {
    const prismaModel = this.getPrismaModel(model);
    const { count } = await prismaModel.updateMany({ where, data });
    return count;
  }

  async upsert<T>(
    model: string,
    where: Record<string, any>,
    create: Record<string, any>,
    update: Record<string, any>
  ): Promise<T> {
    const prismaModel = this.getPrismaModel(model);
    return (await prismaModel.upsert({ where, create, update })) as T;
  }

  async delete<T>(model: string, where: Record<string, any>): Promise<T> {
    const prismaModel = this.getPrismaModel(model);
    return (await prismaModel.delete({ where })) as T;
  }

  async count(model: string, where?: Record<string, any>): Promise<number> {
    const prismaModel = this.getPrismaModel(model);
    return await prismaModel.count({ where });
  }

  async transaction<T>(operations: TransactionOperation[]): Promise<T> {
    const prismaOperations = operations.map((op) => {
      const prismaModel = this.getPrismaModel(op.model);

      switch (op.operation) {
        case 'create':
          return prismaModel.create({ data: op.data });
        case 'update':
          return prismaModel.update({ where: op.where!, data: op.data });
        case 'delete':
          return prismaModel.delete({ where: op.where! });
        case 'upsert':
          return prismaModel.upsert({
            where: op.where!,
            create: op.data,
            update: op.data,
          });
        default:
          throw new Error(`Unsupported operation: ${op.operation}`);
      }
    });

    return (await this.prisma.$transaction(prismaOperations)) as T;
  }

  async rawQuery<T>(query: string, params?: any[]): Promise<T> {
    return (await this.prisma.$queryRawUnsafe(query, ...(params || []))) as T;
  }

  /**
   * Get Prisma model from model name
   * @param model - Model name in camelCase (e.g., 'learner', 'module', 'lessonProgress')
   * @returns Prisma model delegate
   */
  private getPrismaModel(model: string): any {
    // @ts-ignore - Prisma models are dynamically accessed
    if (!this.prisma[model]) {
      throw new Error(`Model "${model}" not found in Prisma Client`);
    }
    // @ts-ignore
    return this.prisma[model];
  }
}
