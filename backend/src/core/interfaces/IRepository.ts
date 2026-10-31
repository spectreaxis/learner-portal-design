import { IDataProvider } from './IDataProvider';

/**
 * Base Repository Interface
 *
 * This interface defines common CRUD operations for domain repositories.
 * Domain-specific repositories can extend this and add custom methods.
 */

export interface IRepository<T> {
  /**
   * Data provider instance
   */
  dataProvider: IDataProvider;

  /**
   * Find a record by ID
   * @param id - Record ID
   * @returns Record or null
   */
  findById(id: string): Promise<T | null>;

  /**
   * Create a new record
   * @param data - Record data
   * @returns Created record
   */
  create(data: any): Promise<T>;

  /**
   * Update a record by ID
   * @param id - Record ID
   * @param data - Update data
   * @returns Updated record
   */
  update(id: string, data: any): Promise<T>;
}
