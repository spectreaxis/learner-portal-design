import { IRepository } from '../../../core/interfaces/IRepository';
import { IDataProvider } from '../../../core/interfaces/IDataProvider';

/**
 * Base Repository
 *
 * Provides common CRUD operations for all domain repositories.
 * Domain-specific repositories extend this class and add custom methods.
 */

export abstract class BaseRepository<T> implements IRepository<T> {
  protected model: string;
  public dataProvider: IDataProvider;

  constructor(model: string, dataProvider: IDataProvider) {
    this.model = model;
    this.dataProvider = dataProvider;
  }

  async findById(id: string): Promise<T | null> {
    return this.dataProvider.findById<T>(this.model, id);
  }

  async create(data: any): Promise<T> {
    return this.dataProvider.create<T>(this.model, data);
  }

  async update(id: string, data: any): Promise<T> {
    return this.dataProvider.update<T>(this.model, { id }, data);
  }
}
