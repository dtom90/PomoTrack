
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
  // Add other Task properties here
}

export interface Tag {
  id: string;
  name: string;
  // Add other Tag properties here
}

export interface TaskLog {
  id: string;
  // Add other TaskLog properties here
}

export interface ModalActivityItem {
  id: string;
  // Add other ModalActivityItem properties here
}

export interface Notification {
  id: string;
  message: string;
  // Add other Notification properties here
}

// Derived from initialState.js
export interface TempState {
  activeTaskID: string | null;
  running: boolean;
  modalTagId: string | null;
  notificationList: Notification[];
  secondsRemaining: number;
  active: boolean;
  overtime: boolean;
}

// Derived from initialState.js
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
