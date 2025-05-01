const initialState = {
  tasks: [],
  tags: {},
  tagOrder: [],
  totalTarget: {},
  selectedTaskLogs: [],
  allActivity: null,
  tagActivity: null,
  
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
    filterOperator: 'and',
    addSelectedTags: true,
    
    // Navbar settings
    timeFormat24: false,
    DailyTarget: null,
    WeeklyTarget: null,
    MonthlyTarget: null
  }
}

export default initialState
