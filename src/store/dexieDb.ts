import Dexie, { type Table } from 'dexie';
import type { Task, Tag, TaskLog, TaskTagMap, Settings } from '@/types';

export class PomoTrackDatabase extends Dexie {
  tasks!: Table<Task>;
  tags!: Table<Tag>;
  taskTagMap!: Table<TaskTagMap>;
  logs!: Table<TaskLog>;
  settings!: Table<Settings>;

  constructor() {
    super('PomoTrackDatabase');
    this.version(1).stores({
      tasks: 'id, name, notes, order, created_at, completed, archived',
      tags: 'id, &tagName, color, order',
      taskTagMap: 'id, taskId, tagId',
      logs: 'id, taskId, started, stopped, timeSpent',
      settings: 'key'
    });
  }
}

const dexieDb = new PomoTrackDatabase();

export default dexieDb;
