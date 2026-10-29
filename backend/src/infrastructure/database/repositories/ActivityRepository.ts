import { BaseRepository } from './BaseRepository';
import { IDataProvider } from '../../../core/interfaces/IDataProvider';

export interface Activity {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  content: any; // JSON
}

export interface ActivityCompletion {
  id: string;
  learnerId: string;
  activityId: string;
  completedAt: Date;
}

/**
 * Activity Repository
 *
 * Handles hands-on activities and which learners have completed them.
 */

export class ActivityRepository extends BaseRepository<Activity> {
  constructor(dataProvider: IDataProvider) {
    super('activity', dataProvider);
  }

  async findCompletedActivityIds(learnerId: string): Promise<string[]> {
    const completions = await this.dataProvider.findMany<ActivityCompletion>('activityCompletion', {
      where: { learnerId },
    });
    return completions.map((c) => c.activityId);
  }

  async setCompleted(learnerId: string, activityId: string, completed: boolean): Promise<void> {
    const where = { learnerId_activityId: { learnerId, activityId } };

    if (completed) {
      await this.dataProvider.upsert('activityCompletion', where, { learnerId, activityId }, {});
      return;
    }

    const existing = await this.dataProvider.findUnique('activityCompletion', where);
    if (existing) {
      await this.dataProvider.delete('activityCompletion', where);
    }
  }
}
