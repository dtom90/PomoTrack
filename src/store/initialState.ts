import type { PomoTrackState } from "@/types"

const initialState: PomoTrackState = {
  tasks: {},
  tags: {},
  taskTagsMap: {},
  tagOrder: [],
  selectedTaskLogs: [],
  modalActivity: null,
  isActivityModalVisible: false,

  tempState: {
    activeTaskID: null,
    running: false,
    modalTagId: null,
    notificationList: [],
    secondsRemaining: 0,
    active: true,
    overtime: false
  },

  settings: {

    // Timer settings
    selectedTaskID: null,
    activeMinutes: 25,
    restMinutes: 5,
    continueOnComplete: false,
    secondReminderMinutes: 5,
    secondReminderEnabled: true,

    // TaskList settings
    selectedTagIds: [],
    addSelectedTags: true,

    // Navbar settings
    timeFormat24: false,
    DailyTarget: null,
    WeeklyTarget: null,
    MonthlyTarget: null
  }
}

export default initialState
