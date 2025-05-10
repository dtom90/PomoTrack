/* eslint-disable no-console */
import type { Store } from 'vuex'
import Dexie, { type Table } from 'dexie';
import isElectron from "@/lib/isElectron.ts";
import type { PomoTrackState, Task, Tag, TaskLog, TaskTagMap, SettingKv } from '@/types';

let storageEnabled: boolean | null = isElectron() ? null : true

let dexieDb: PomoTrackDatabase | undefined;

export class PomoTrackDatabase extends Dexie {
  tasks!: Table<Task>;
  tags!: Table<Tag>;
  taskTagMap!: Table<TaskTagMap>;
  logs!: Table<TaskLog>;
  settings!: Table<SettingKv>;

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

async function initializeStorage() {
  if (navigator.storage && navigator.storage.persist) {
    const persistent = await navigator.storage.persist()
    if (persistent) {
      console.log("Storage will not be cleared except by explicit user action")
    } else {
      console.log("Storage may be cleared by the UA under storage pressure.")
    }

    while (storageEnabled === null) {
      console.log('checking disk space...')
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    if (storageEnabled) {
      dexieDb = new PomoTrackDatabase()
    } else {
      throw Error(diskSpaceLowError)
    }
  }
}

const diskSpaceLowError = 'Disk Space is too low. The app has been disabled to prevent data corruption. Please free up at least 2GB of space to continue using the app.'

if (isElectron() && window.electronAPI) {
  window.electronAPI.onDiskSpaceStatus((data) => {
    if (data.isLow) {
      if (storageEnabled != false) {
        storageEnabled = false
        dexieDb?.close()
        alert(diskSpaceLowError)
      }
      console.error(data)
    } else {
      storageEnabled = true
    }
  })
}

async function loadInitialData(store: Store<PomoTrackState>) {
  try {
    await store.dispatch('loadInitialData');
    console.log('Initial data loaded successfully.');
  } catch (error) {
    console.error('Failed to load initial data:', error);
  }
}

export { initializeStorage, loadInitialData, storageEnabled, dexieDb }
