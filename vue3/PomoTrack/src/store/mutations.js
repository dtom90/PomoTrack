import $ from 'jquery'
import initialState from './initialState'

const mutations = {

  loadInitialData (state, { tasks, tags, taskTagMaps, settings, selectedTaskLogs }) {
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
    for (const key of Object.keys(initialState.settings)) {
      const setting = settings.find(s => s.key === key)
      state.settings[key] = setting ? setting.value : initialState.settings[key]
    }
    state.selectedTaskLogs = selectedTaskLogs
  },

  /** Tasks **/

  addTask (state, { task }) {
    state.tasks.push(task)
  },

  updateTask (state, { taskId, taskUpdates }) {
    const index = state.tasks.findIndex(t => t.id === taskId)
    if (index !== -1) {
      state.tasks[index] = { ...state.tasks[index], ...taskUpdates }
    }
  },

  setTasks (state, { tasks }) {
    state.tasks = tasks
  },

  updateTasks (state, { tasksToUpdate }) {
    tasksToUpdate.forEach(taskUpdate => {
      const index = state.tasks.findIndex(t => t.id === taskUpdate.id)
      if (index !== -1) {
        state.tasks[index] = { ...state.tasks[index], ...taskUpdate }
      }
    })
  },

  /** Logs **/

  startTask (state, { log }) {
    const task = state.tasks.find(t => t.id === log.taskId)
    if (task) {
      state.tempState.activeTaskID = task.id
      state.tempState.running = true
      state.selectedTaskLogs.push(log)
    }
  },

  updateLog (state, { taskId, log }) {
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

  deleteInterval (state, { taskId, logId }) {
    if (taskId !== state.settings.selectedTaskID) return
    const logIndex = state.selectedTaskLogs.findIndex(l => l.id === logId)
    if (logIndex === -1) return
    state.selectedTaskLogs.splice(logIndex, 1)
  },

  setSelectedTaskLogs (state, { selectedTaskLogs }) {
    state.selectedTaskLogs = selectedTaskLogs
  },

  setModalActivity (state, { logs }) {
    // Add task name and tags to each log
    const logsWithTaskDetails = logs.map(l => {
      const task = state.tasks.find(t => t.id === l.taskId)
      return Object.assign({ task: task.name, tagIds: task.tags }, l)
    })
    // Add completed tasks as events
    for (const task of state.tasks.filter(t => t.completed)) {
      logsWithTaskDetails.unshift({ task: task.name, tagIds: task.tags, completed: task.completed })
    }
    logsWithTaskDetails.sort((a, b) => ('started' in a ? a.started : a.completed) - ('started' in b ? b.started : b.completed))
    state.modalActivity = logsWithTaskDetails
  },

  unloadModalActivity (state) {
    state.modalActivity = null
  },

  setActivityModalVisible (state, isVisible) {
    state.isActivityModalVisible = isVisible
  },

  /** Tags **/

  addTaskTag (state, { taskId, tag, isNewTag }) {
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

  updateTagOrder (state, { reorderedTags }) {
    reorderedTags.forEach(tag => {
      state.tags[tag.id] = tag
    })
    state.tagOrder = reorderedTags.map(tag => tag.id)
  },

  updateTag (state, { tagId, tagUpdates }) {
    state.tags[tagId] = { ...state.tags[tagId], ...tagUpdates }
  },

  deleteTag (state, { tagId }) {
    state.tasks.forEach(task => {
      task.tags = task.tags.filter(tId => tId !== tagId)
    })
    state.settings.selectedTagIds = state.settings.selectedTagIds.filter(tag => tag !== tagId)
    delete state.tags[tagId]
    state.tagOrder = state.tagOrder.filter(tId => tId !== tagId)
    state.isActivityModalVisible = false
  },

  /** Temp state and Settings **/

  updateTempState (state, { key, value }) {
    state.tempState[key] = value
  },

  updateSetting (state, { key, value }) {
    state.settings[key] = value
  },

  /** Notifications **/

  saveNotification (state, { notification }) {
    state.tempState.notificationList.push(notification)
  },

  clearNotifications (state) {
    // close all open notification
    while (state.tempState.notificationList.length > 0) {
      state.tempState.notificationList.pop().close()
    }
  }
}

export default mutations
