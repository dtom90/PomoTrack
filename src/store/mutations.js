import Vue from 'vue'
import $ from 'jquery'
import initialState from './initialState'

const mutations = {
  
  setState (state, { tasks, tags, taskTagMaps, logs, settings }) {
    state.tasks = tasks
    state.tasks.forEach(task => {
      task.tags = []
      task.log = []
    })
    state.tags = {}
    state.tagOrder = []
    for (const tag of tags) {
      Vue.set(state.tags, tag.id, tag)
      state.tagOrder.push(tag.id)
    }
    for (const taskTagMap of taskTagMaps) {
      const task = state.tasks.find(t => t.id === taskTagMap.taskId)
      if (task) {
        task.tags.push(taskTagMap.tagId)
      }
    }
    for (const task of state.tasks) {
      task.log = logs.filter(log => log.taskId === task.id)
      if (task.log.length > 0) {
        task.log.sort((a, b) => a.started - b.started)
      }
    }
    for (const key of Object.keys(initialState.settings)) {
      const setting = settings.find(s => s.key === key)
      state.settings[key] = setting ? setting.value : initialState.settings[key]
    }
  },
  
  setTasks (state, { tasks }) {
    state.tasks = tasks
  },
  
  addTask (state, { task }) {
    task.log = []
    if (state.settings.insertAtTop) {
      state.tasks.unshift(task)
    } else {
      state.tasks.push(task)
    }
  },
  
  updateTask (state, { taskId, taskUpdates }) {
    const index = state.tasks.findIndex(t => t.id === taskId)
    if (index !== -1) {
      Vue.set(state.tasks, index, { ...state.tasks[index], ...taskUpdates })
    }
  },
  
  updateTasks (state, { tasksToUpdate }) {
    tasksToUpdate.forEach(taskUpdate => {
      const index = state.tasks.findIndex(t => t.id === taskUpdate.id)
      if (index !== -1) {
        Vue.set(state.tasks, index, { ...state.tasks[index], ...taskUpdate })
      }
    })
  },
  
  startTask (state, { log }) {
    const task = state.tasks.find(t => t.id === log.taskId)
    if (task) {
      task.log = [...task.log, log]
      state.tempState.activeTaskID = task.id
      state.tempState.running = true
    }
  },
  
  updateLog (state, { log }) {
    const taskIndex = state.tasks.findIndex(t => t.id === log.taskId)
    if (taskIndex !== -1) {
      const task = state.tasks[taskIndex]
      const logIndex = task.log.findIndex(l => l.id === log.id)
      if (logIndex >= 0) {
        const newLog = [...task.log]
        newLog[logIndex] = log
        task.log = newLog
        Vue.set(state.tasks, taskIndex, { ...task, log: newLog })
        if (log.stopped === null) {
          state.tempState.running = true
        } else {
          state.tempState.running = false
          state.tempState.activeTaskID = null
        }
      } else {
        Vue.set(state.tasks, taskIndex, { ...task, log: [...task.log, log] })
      }
    }
  },
  
  deleteInterval (state, { taskId, logId }) {
    const taskIndex = state.tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) return
    const task = state.tasks[taskIndex]
    const logIndex = task.log.findIndex(log => log.id === logId)
    if (logIndex === -1) return
    
    const newLog = [...task.log]
    newLog.splice(logIndex, 1)
    Vue.set(state.tasks, taskIndex, { ...task, log: newLog })
  },
  
  resetRunning (state) {
    if (state.tempState.activeTaskID) {
      const activeTask = state.tasks.find(t => t.id === state.tempState.activeTaskID)
      if (activeTask && activeTask.log.length > 0) {
        const lastInterval = activeTask.log[activeTask.log.length - 1]
        if ('running' in lastInterval) {
          Vue.delete(lastInterval, 'running')
        }
      }
    }
    state.tempState.running = false
  },
  
  addTaskTag (state, { taskId, tag, isNewTag }) {
    if (isNewTag) {
      Vue.set(state.tags, tag.id, tag)
      state.tagOrder = [...state.tagOrder, tag.id]
    }
    
    const taskIndex = state.tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) return
    const task = state.tasks[taskIndex]
    const newTags = [...task.tags, tag.id]
    Vue.set(state.tasks, taskIndex, { ...task, tags: newTags })
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
    Vue.delete(state.tags, tagId)
    state.tagOrder = state.tagOrder.filter(tId => tId !== tagId)
    $('#activityModal').modal('hide')
  },
  
  overwriteState (state, newState) {
    const r = confirm('WARNING: Loading state from this file will COMPLETELY OVERWRITE your current data with the data provided in this file. Are you ABSOLUTELY sure that you want to do this?')
    if (r === true) {
      Object.keys(state).forEach(key => {
        state[key] = newState[key]
      })
    }
  },
  
  updateTempState (state, { key, value }) {
    state.tempState[key] = value
  },
  
  updateSetting (state, { key, value }) {
    state.settings[key] = value
  }
}

export default mutations
