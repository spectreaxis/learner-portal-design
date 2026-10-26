/**
 * Data Provider Interface
 *
 * This interface abstracts database operations, allowing the application to switch
 * between different data sources (Prisma, Supabase, MongoDB, etc.) without code changes.
 */

export interface FindOptions {
  include?: Record<string, any>;
  select?: Record<string, any>;
}

export interface FindManyOptions extends FindOptions {
  where?: Record<string, any>;
  orderBy?: Record<string, any>;
  take?: number;
  skip?: number;
}

export interface TransactionOperation {
  model: string;
  operation: 'create' | 'update' | 'delete' | 'upsert';
  data: Record<string, any>;
  where?: Record<string, any>;
}

export interface IDataProvider {
  /**
   * Find a single record by ID
   * @param model - Model name (e.g., 'learner', 'module')
   * @param id - Record ID
   * @param options - Query options (include, select)
   * @returns Single record or null
   */
  findById<T>(model: string, id: string, options?: FindOptions): Promise<T | null>;

  /**
   * Find a single record by unique field
   * @param model - Model name
   * @param where - Where clause
   * @param options - Query options (include, select)
   * @returns Single record or null
   */
  findUnique<T>(
    model: string,
    where: Record<string, any>,
    options?: FindOptions
  ): Promise<T | null>;

  /**
   * Find multiple records
   * @param model - Model name
   * @param options - Query options (where, orderBy, take, skip, include, select)
   * @returns Array of records
   */
  findMany<T>(model: string, options?: FindManyOptions): Promise<T[]>;

  /**
   * Create a single record
   * @param model - Model name
   * @param data - Record data
   * @returns Created record
   */
  create<T>(model: string, data: Record<string, any>): Promise<T>;

  /**
   * Update a single record
   * @param model - Model name
   * @param where - Where clause
   * @param data - Update data
   * @returns Updated record
   */
  update<T>(
    model: string,
    where: Record<string, any>,
    data: Record<string, any>
  ): Promise<T>;

  /**
   * Upsert (create or update) a record
   * @param model - Model name
   * @param where - Where clause
   * @param create - Create data
   * @param update - Update data
   * @returns Upserted record
   */
  upsert<T>(
    model: string,
    where: Record<string, any>,
    create: Record<string, any>,
    update: Record<string, any>
  ): Promise<T>;

  /**
   * Delete a single record
   * @param model - Model name
   * @param where - Where clause
   * @returns Deleted record
   */
  delete<T>(model: string, where: Record<string, any>): Promise<T>;

  /**
   * Count records
   * @param model - Model name
   * @param where - Where clause (optional)
   * @returns Number of records
   */
  count(model: string, where?: Record<string, any>): Promise<number>;

  /**
   * Execute transaction (multiple operations atomically)
   * @param operations - Array of operations
   * @returns Transaction result
   */
  transaction<T>(operations: TransactionOperation[]): Promise<T>;

  /**
   * Raw query execution (for complex queries)
   * @param query - Raw query string
   * @param params - Query parameters
   * @returns Query result
   */
  rawQuery<T>(query: string, params?: any[]): Promise<T>;
}
