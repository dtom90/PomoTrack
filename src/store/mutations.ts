import type { MutationTree } from 'vuex';
import initialState from './initialState'
import type { PomoTrackState, TaskForState, Tag, ModalActivityItem, TaskLog, TaskTagMap, Settings, TempState, Notification as NotificationType, SettingKv } from '@/types';

// Define a type for the notification payload in saveNotification to include the 'close' method seen in clearNotifications
interface NotificationPayload extends NotificationType {
  close: () => void;
}

const mutations: MutationTree<PomoTrackState> = {

  loadInitialData (state: PomoTrackState, { tasks, tags, taskTagMaps, settings, selectedTaskLogs }: { tasks: TaskForState[], tags: Tag[], taskTagMaps: TaskTagMap[], settings: SettingKv[], selectedTaskLogs: TaskLog[] }) {
    state.tasks = tasks
    state.tasks.forEach(task => {
      task.tags = []
    })
    state.tags = {}
    state.tagOrder = []
    for (const tag of tags) {
      state.tags[tag.id] = tag
      state.tagOrder.push(tag.id)
    }
    for (const taskTagMap of taskTagMaps) {
      const task = state.tasks.find(t => t.id === taskTagMap.taskId)
      if (task) {
        task.tags.push(taskTagMap.tagId)
      }
    }
    for (const key of Object.keys(initialState.settings) as Array<keyof Settings>) {
      const setting = settings.find(s => s.key === key)
      // @ts-expect-error Typescript is not smart enough to know that the key is a keyof Settings
      state.settings[key] = setting ? setting.value : initialState.settings[key]
    }
    state.selectedTaskLogs = selectedTaskLogs
  },

  /** Tasks **/

  addTask (state: PomoTrackState, { task }: { task: TaskForState }) {
    state.tasks.push(task)
  },

  updateTask (state: PomoTrackState, { taskId, taskUpdates }: { taskId: string, taskUpdates: Partial<TaskForState> }) {
    const index = state.tasks.findIndex(t => t.id === taskId)
    if (index !== -1) {
      state.tasks[index] = { ...state.tasks[index], ...taskUpdates }
    }
  },

  setTasks (state: PomoTrackState, { tasks }: { tasks: TaskForState[] }) {
    state.tasks = tasks
  },

  updateTasks (state: PomoTrackState, { tasksToUpdate }: { tasksToUpdate: (Partial<TaskForState> & { id: string })[] }) {
    tasksToUpdate.forEach(taskUpdate => {
      const index = state.tasks.findIndex(t => t.id === taskUpdate.id)
      if (index !== -1) {
        state.tasks[index] = { ...state.tasks[index], ...taskUpdate }
      }
    })
  },

  /** Logs **/

  startTask (state: PomoTrackState, { log }: { log: TaskLog }) {
    const task = state.tasks.find(t => t.id === log.taskId)
    if (task) {
      state.tempState.activeTaskID = task.id
      state.tempState.running = true
      state.selectedTaskLogs.push(log)
    }
  },

  updateLog (state: PomoTrackState, { taskId, log }: { taskId: string, log: TaskLog }) {
    if (taskId !== state.settings.selectedTaskID) return
    const logIndex = state.selectedTaskLogs.findIndex(l => l.id === log.id)
    if (logIndex >= 0) {
      state.selectedTaskLogs[logIndex] = log
      if (log.stopped === null) {
        state.tempState.running = true
      } else {
        state.tempState.running = false
        state.tempState.activeTaskID = null
      }
    } else {
      state.selectedTaskLogs.push(log)
    }
  },

  deleteInterval (state: PomoTrackState, { taskId, logId }: { taskId: string, logId: string }) {
    if (taskId !== state.settings.selectedTaskID) return
    const logIndex = state.selectedTaskLogs.findIndex(l => l.id === logId)
    if (logIndex === -1) return
    state.selectedTaskLogs.splice(logIndex, 1)
  },

  setSelectedTaskLogs (state: PomoTrackState, { selectedTaskLogs }: { selectedTaskLogs: TaskLog[] }) {
    state.selectedTaskLogs = selectedTaskLogs
  },

  setModalActivity (state: PomoTrackState, { logs }: { logs: TaskLog[] }) {
    const logsWithTaskDetails: ModalActivityItem[] = logs.map(l => {
      const task = state.tasks.find(t => t.id === l.taskId)
      if (!task) return l as ModalActivityItem
      return Object.assign({ task: task.name, tagIds: task.tags }, l)
    })
    // Add completed tasks as events
    for (const task of state.tasks.filter(t => t.completed)) {
      logsWithTaskDetails.unshift({ task: task.name, tagIds: task.tags, completed: task.completed })
    }
    // @ts-expect-error element will either have started or completed
    logsWithTaskDetails.sort((a, b) => ('started' in a ? a.started : a.completed) - ('started' in b ? b.started : b.completed))
    state.modalActivity = logsWithTaskDetails
  },

  unloadModalActivity (state: PomoTrackState) {
    state.modalActivity = null
  },

  setActivityModalVisible (state: PomoTrackState, isVisible: boolean) {
    state.isActivityModalVisible = isVisible
  },

  /** Tags **/

  addTaskTag (state: PomoTrackState, { taskId, tag, isNewTag }: { taskId: string, tag: Tag, isNewTag: boolean }) {
    if (isNewTag) {
      state.tags[tag.id] = tag
      state.tagOrder = [...state.tagOrder, tag.id]
    }

    const taskIndex = state.tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) return
    const task = state.tasks[taskIndex]
    const newTags = [...task.tags, tag.id]
    state.tasks[taskIndex] = { ...task, tags: newTags }
  },

  updateTagOrder (state: PomoTrackState, { reorderedTags }: { reorderedTags: Tag[] }) {
    reorderedTags.forEach(tag => {
      state.tags[tag.id] = tag
    })
    state.tagOrder = reorderedTags.map(tag => tag.id)
  },

  updateTag (state: PomoTrackState, { tagId, tagUpdates }: { tagId: string, tagUpdates: Partial<Tag> }) {
    state.tags[tagId] = { ...state.tags[tagId], ...tagUpdates }
  },

  deleteTag (state: PomoTrackState, { tagId }: { tagId: string }) {
    state.tasks.forEach(task => {
      task.tags = task.tags.filter(tId => tId !== tagId)
    })
    state.settings.selectedTagIds = state.settings.selectedTagIds.filter(tag => tag !== tagId)
    delete state.tags[tagId]
    state.tagOrder = state.tagOrder.filter(tId => tId !== tagId)
    state.isActivityModalVisible = false
  },

  /** Temp state and Settings **/

  updateTempState (state: PomoTrackState, { key, value }: { key: keyof TempState, value: TempState[keyof TempState] }) {
    // @ts-expect-error Typescript is not smart enough to know that the key is a keyof TempState
    state.tempState[key] = value
  },

  updateSetting (state: PomoTrackState, { key, value }: { key: keyof Settings, value: Settings[keyof Settings] }) {
    // @ts-expect-error Typescript is not smart enough to know that the key is a keyof Settings
    state.settings[key] = value
  },

  /** Notifications **/

  saveNotification (state: PomoTrackState, { notification }: { notification: NotificationPayload }) {
    state.tempState.notificationList.push(notification)
  },

  clearNotifications (state: PomoTrackState) {
    // close all open notification
    while (state.tempState.notificationList.length > 0) {
      const notification = state.tempState.notificationList.pop();
      // Check if notification exists and has a close method before calling
      if (notification && typeof (notification as NotificationPayload).close === 'function') {
        (notification as NotificationPayload).close();
      }
    }
  }
}

export default mutations
