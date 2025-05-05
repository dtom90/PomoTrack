export interface PomoTrackState {
  tasks: Task[];
  tags: { [key: string]: Tag };
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
  created_at: Date;
  completed: boolean;
  archived: boolean;
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
  started: Date;
  stopped: Date;
  timeSpent: number;
}

export interface ModalActivityItem {
  id: string;
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
  filterOperator: 'and' | 'or';
  addSelectedTags: boolean;
  timeFormat24: boolean;
  DailyTarget: number | null;
  WeeklyTarget: number | null;
  MonthlyTarget: number | null;
}

export interface ElectronAPI {
  onMessage: (callback: (message: unknown) => void) => void;
  checkForUpdates: () => Promise<unknown>;
}
