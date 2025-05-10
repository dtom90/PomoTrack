export interface PomoTrackState {
  tasks: { [taskId: string]: Task }
  tags: { [tagId: string]: Tag };
  taskTagsMap: { [taskId: string]: string[] };
  tagOrder: string[];
  selectedTaskLogs: TaskLog[];
  modalActivity: ModalActivityItem[] | null;
  isActivityModalVisible: boolean;
  tempState: TempState;
  settings: Settings;
}

export interface Task {
  id: string;
  name: string;
  notes: string;
  order: number;
  created_at: number;
  completed: number | undefined;
  archived: boolean | undefined;
}

export interface Tag {
  id: string;
  tagName: string;
  color: string;
  order: number;
}

export interface TaskLog {
  id: string;
  taskId: string;
  started: number;
  stopped: number | null;
  timeSpent: number | null;
}

export interface ModalActivityItem extends Partial<TaskLog> {
  task?: string;
  tagIds?: string[];
  completed?: number;
}

export interface Notification {
  id: string;
  message: string;
}

export interface TaskTagMap {
  id: string;
  taskId: string;
  tagId: string;
}

export interface TempState {
  activeTaskID: string | null;
  running: boolean;
  modalTagId: string | null;
  notificationList: Notification[];
  secondsRemaining: number;
  active: boolean;
  overtime: boolean;
}

export interface Settings {
  selectedTaskID: string | null;
  activeMinutes: number;
  restMinutes: number;
  continueOnComplete: boolean;
  secondReminderMinutes: number;
  secondReminderEnabled: boolean;
  selectedTagIds: string[];
  addSelectedTags: boolean;
  timeFormat24: boolean;
  DailyTarget: number | null;
  WeeklyTarget: number | null;
  MonthlyTarget: number | null;
}

export interface SettingKv {
  key: keyof Settings;
  value: Settings[keyof Settings];
}

export interface ElectronAPI {
  checkForUpdates: () => Promise<unknown>;
  onMessage: (callback: (message: unknown) => void) => void;
  onDiskSpaceStatus: (callback: (diskSpaceStatus: DiskSpaceStatus) => void) => void;
}

interface DiskSpaceStatus {
  isLow: boolean,
  free: number,
  total: number,
  percentage: number,
  path: string,
}
