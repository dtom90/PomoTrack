import dexieDb from './dexieDb'
import { nanoid } from 'nanoid'
import ColorManager from 'color-manager'
import { toRaw } from 'vue'

const actions = {
  async loadInitialData ({ commit }) {
    const tasks = await dexieDb.tasks.orderBy('order').toArray()
    const tags = await dexieDb.tags.orderBy('order').toArray()
    const taskTagMaps = await dexieDb.taskTagMap.toArray()
    const settings = await dexieDb.settings.toArray()
    const logs = await dexieDb.logs.toArray()
    // If any logs were running but not stopped, stop them.
    for (const log of logs) {
      if (!log.stopped) {
        log.stopped = log.started + log.timeSpent
        await dexieDb.logs.put(log)
      }
    }
    let selectedTaskLogs = []
    for (const setting of settings) {
      if (setting.key === 'selectedTaskID' && setting.value) {
        selectedTaskLogs = await dexieDb.logs.where('taskId').equals(setting.value).toArray()
      }
    }
    commit('loadInitialData', { tasks, tags, taskTagMaps, settings, selectedTaskLogs })
  },

  async loadAllActivity ({ commit }) {
    const logs = await dexieDb.logs.orderBy('started').reverse().toArray()
    commit('setModalActivity', { logs })
  },

  async loadTagActivity ({ state, commit }) {
    const taskMaps = await dexieDb.taskTagMap.where('tagId').equals(state.tempState.modalTagId).toArray()
    const taskIds = taskMaps.map(taskMap => taskMap.taskId)
    const logs = await dexieDb.logs.where('taskId').anyOf(taskIds).toArray()
    commit('setModalActivity', { logs })
  },

  async addTask ({ state, commit, dispatch }, { name }) {
    const taskName = name.trim()
    if (taskName) {
      try {
        const order = state.tasks.reduce((max, t) => t.order > max ? t.order : max, 0) + 1
        const newTask = {
          id: 'task-' + nanoid(),
          name: taskName,
          notes: '',
          order,
          created_at: Date.now(),
          completed: null,
          archived: null
        }

        await handleDexieError(dexieDb.tasks.add(newTask), 'tasks.add', newTask)

        if (state.settings.addSelectedTags && state.settings.selectedTagIds.length) {
          const taskTagMaps = state.settings.selectedTagIds.map(tagId => ({
            id: 'taskTag-' + nanoid(),
            taskId: newTask.id,
            tagId
          }))
          await handleDexieError(dexieDb.taskTagMap.bulkAdd(taskTagMaps), 'taskTagMap.bulkAdd', taskTagMaps)
          newTask.tags = taskTagMaps.map(taskTagMap => taskTagMap.tagId)
        } else {
          newTask.tags = []
        }
        commit('addTask', { task: newTask })
        await dispatch('updateSetting', { key: 'selectedTaskID', value: newTask.id })
      } catch (error) {
        console.error('Failed to complete addTask operation:', error)
      }
    }
  },

  async updateTaskName ({ state, commit }, { taskId, name }) {
    const task = state.tasks.find(t => t.id === taskId)
    if (task) {
      const taskUpdates = { name }
      await dexieDb.tasks.update(taskId, taskUpdates)
      commit('updateTask', { taskId, taskUpdates })
    }
  },

  async updateTaskNotes ({ state, commit }, { taskId, notes }) {
    const task = state.tasks.find(t => t.id === taskId)
    if (task) {
      const taskUpdates = { notes }
      await dexieDb.tasks.update(taskId, taskUpdates)
      commit('updateTask', { taskId, taskUpdates })
    }
  },

  async reorderIncompleteTasks ({ state, commit }, { newIncompleteTaskOrder }) {
    try {
      const incompleteTasks = state.tasks.filter(t => !t.completed)
      const completedTasks = state.tasks.filter(t => t.completed)
      const origLength = incompleteTasks.length
      if (newIncompleteTaskOrder.length === origLength) {
        const fullTaskOrder = newIncompleteTaskOrder.concat(completedTasks)
        for (const [i, task] of fullTaskOrder.entries()) {
          task.order = i
        }
        await handleDexieError(dexieDb.tasks.bulkPut(fullTaskOrder.map(toRaw)), 'tasks.bulkPut reorder (same length)', fullTaskOrder.map(toRaw))
        commit('setTasks', { tasks: fullTaskOrder })
      } else {
        const reorderTaskIds = {}
        newIncompleteTaskOrder.forEach(task => {
          reorderTaskIds[task.id] = true
        })
        let r = 0
        for (let i = 0; i < incompleteTasks.length; i++) {
          if (incompleteTasks[i].id in reorderTaskIds) {
            incompleteTasks[i] = newIncompleteTaskOrder[r]
            r++
          }
        }
        if (incompleteTasks.length === origLength) { // ensure that the length has not changed
          const fullTaskOrder = incompleteTasks.concat(completedTasks)
          for (const [i, task] of fullTaskOrder.entries()) {
            task.order = i
          }
          await handleDexieError(dexieDb.tasks.bulkPut(fullTaskOrder.map(toRaw)), 'tasks.bulkPut reorder (different length)', fullTaskOrder.map(toRaw))
          commit('setTasks', { tasks: fullTaskOrder })
        }
      }
    } catch (error) {
      console.error('Failed to complete reorderIncompleteTasks operation:', error)
    }
  },

  async startTask ({ state, commit, dispatch }, { taskId }) {
    await dispatch('stopTask')

    const task = state.tasks.find(t => t.id === taskId)
    if (task) {
      const log = {
        id: 'log-' + nanoid(),
        taskId,
        started: Date.now(),
        stopped: null,
        timeSpent: null
      }
      await dexieDb.logs.add(log)
      commit('startTask', { log })
    }
  },

  async updateTaskTimer ({ state, commit }, { taskId }) {
    const task = state.tasks.find(t => t.id === taskId)
    if (task) {
      const runningLog = await dexieDb.logs.where('taskId').equals(taskId).and(log => log.stopped == null).first()
      if (runningLog) {
        runningLog.timeSpent = Date.now() - runningLog.started
        await dexieDb.logs.put(runningLog)
        commit('updateLog', { taskId, log: runningLog })
      }
    }
  },

  async stopTask ({ commit }) {
    const runningLog = await dexieDb.logs.filter(log => log.stopped === null).first()
    if (runningLog) {
      runningLog.stopped = Date.now()
      runningLog.timeSpent = runningLog.stopped - runningLog.started
      await dexieDb.logs.put(runningLog)
      commit('updateLog', { taskId: runningLog.taskId, log: runningLog })
    }
  },

  async completeTask ({ state, commit, dispatch }, { taskId }) {
    const task = state.tasks.find(t => t.id === taskId)
    if (task) {
      let completedValue = null
      if (!task.completed) {
        if (task.id === state.tempState.activeTaskID && state.tempState.running) {
          await dispatch('stopTask')
        }
        completedValue = Date.now()
      }
      const taskUpdates = { completed: completedValue }
      await dexieDb.tasks.update(taskId, taskUpdates)
      commit('updateTask', { taskId, taskUpdates })
    }
  },

  async archiveTask ({ state, commit }, { taskId }) {
    const task = state.tasks.find(t => t.id === taskId)
    if (task) {
      const taskUpdates = { archived: !task.archived }
      await dexieDb.tasks.update(taskId, taskUpdates)
      commit('updateTask', { taskId, taskUpdates })
    }
  },

  async archiveTasks ({ getters, commit }) {
    const completedTasks = getters.completedTasksFiltered.filter(t => !t.archived)
    if (completedTasks.length === 0) {
      alert('No completed tasks to archive')
      return
    }
    if (completedTasks.length === 1 || confirm(`Are you sure that you want to archive all ${completedTasks.length} completed tasks?`)) {
      const taskIds = completedTasks.map(task => task.id)
      await dexieDb.tasks.where('id').anyOf(taskIds).modify({ archived: true })

      const tasksToUpdate = await dexieDb.tasks.where('id').anyOf(taskIds).toArray()
      commit('updateTasks', { tasksToUpdate })
    }
  },

  async addInterval ({ state, commit }, { taskId, started, timeSpent, stopped }) {
    const task = state.tasks.find(t => t.id === taskId)
    if (task) {
      const log = {
        id: 'log-' + nanoid(),
        taskId,
        started: started,
        stopped: stopped,
        timeSpent: timeSpent
      }
      await dexieDb.logs.add(log)
      commit('updateLog', { taskId, log })
    }
  },

  async getLogById ({ }, { logId }) {
    return await dexieDb.logs.where('id').equals(logId).first()
  },

  async updateInterval ({ commit }, { logId, started, timeSpent, stopped }) {
    const log = await dexieDb.logs.get(logId)
    log.started = started
    log.stopped = stopped
    log.timeSpent = timeSpent
    await dexieDb.logs.put(log)
    commit('updateLog', { taskId: log.taskId, log })
  },

  async deleteInterval ({ commit }, { logId }) {
    const log = await dexieDb.logs.get(logId)
    await dexieDb.logs.delete(logId)
    commit('deleteInterval', { taskId: log.taskId, logId })
  },

  async addTaskTagByName ({ state, commit }, { taskId, tagName }) {
    tagName = tagName.trim()
    if (tagName) {
      const task = state.tasks.find(t => t.id === taskId)
      if (task) {
        let tag = await dexieDb.tags.where('tagName').equals(tagName).first()
        const isNewTag = !tag
        if (isNewTag) {
          const colors = Object.values(state.tags).map(tag => tag.color)
          const colorManager = new ColorManager(colors)
          const maxOrder = await dexieDb.tags.orderBy('order').last()
          const order = maxOrder ? maxOrder.order + 1 : 0
          tag = {
            id: 'tag-' + nanoid(),
            tagName: tagName,
            color: colorManager.getRandomColor(),
            order
          }
          await dexieDb.tags.add(tag)
        }
        await dexieDb.taskTagMap.add({
          id: 'taskTag-' + nanoid(),
          taskId,
          tagId: tag.id
        })
        commit('addTaskTag', { taskId, tag, isNewTag })
      }
    }
  },

  async addTaskTagById ({ state, commit }, { taskId, tagId }) {
    const task = state.tasks.find(t => t.id === taskId)
    const tag = state.tags[tagId]
    if (task && tag) {
      await dexieDb.taskTagMap.add({
        id: 'taskTag-' + nanoid(),
        taskId,
        tagId
      })
      commit('addTaskTag', { taskId, tag, isNewTag: false })
    }
  },

  async updateTag ({ commit }, { tagId, ...tagUpdates }) {
    const tag = await dexieDb.tags.where('id').equals(tagId).first()
    if (!tag) {
      alert('Error: the tag you are trying to update does not exist. Please refresh the page and try again.')
      return
    }

    if ('tagName' in tagUpdates) {
      const existingTagWithName = await dexieDb.tags
        .where('tagName').equals(tagUpdates.tagName)
        .and(tag => tag.id !== tagId)
        .first()
      if (existingTagWithName) {
        alert('Error: the new tag name you entered already exists. Please rename it to something else.')
        return
      }
    }

    await dexieDb.tags.update(tagId, tagUpdates)

    commit('updateTag', { tagId, tagUpdates })
  },

  async reorderTags ({ state, commit }, { newOrder }) {
    const reorderedTags = []
    for (const [i, tagId] of newOrder.entries()) {
      const tag = state.tags[tagId]
      if (tag.order !== i) {
        tag.order = i
      }
      reorderedTags.push(toRaw(tag))
    }
    await dexieDb.tags.bulkPut(reorderedTags)
    commit('updateTagOrder', { reorderedTags })
  },

  async removeTaskTag ({ commit }, { taskId, tagId }) {
    await dexieDb.taskTagMap
      .where('taskId').equals(taskId)
      .and(taskTagMap => taskTagMap.tagId === tagId)
      .delete()

    const newTags = await dexieDb.taskTagMap.where('taskId').equals(taskId).toArray()
    const newTagIds = newTags.map(tag => tag.tagId)
    commit('updateTask', { taskId, taskUpdates: { tags: newTagIds } })
  },

  async deleteTag ({ commit }, { tagId }) {
    const tag = await dexieDb.tags.where('id').equals(tagId).first()
    if (confirm(`Are you sure you want to delete the tag "${tag.tagName}"?\nAll tasks with this tag will lose the tag.`)) {
      await dexieDb.taskTagMap.where('tagId').equals(tagId).delete()
      await dexieDb.tags.where('id').equals(tagId).delete()
      commit('deleteTag', { tagId })
    }
  },

  async selectTask ({ dispatch, commit }, { taskId }) {
    await dispatch('updateSetting', { key: 'selectedTaskID', value: taskId })
    if (taskId) {
      const selectedTaskLogs = await dexieDb.logs.where('taskId').equals(taskId).toArray()
      commit('setSelectedTaskLogs', { selectedTaskLogs })
    } else {
      commit('setSelectedTaskLogs', { selectedTaskLogs: [] })
    }
  },

  async addTagFilter ({ state, dispatch }, { tagId }) {
    const selectedTagIds = state.settings.selectedTagIds
    selectedTagIds.push(tagId)
    await dispatch('updateSetting', { key: 'selectedTagIds', value: selectedTagIds })
  },

  async removeTagFilter ({ state, dispatch }, { tagId }) {
    const selectedTagIds = state.settings.selectedTagIds.filter(selectedTagId => selectedTagId !== tagId)
    await dispatch('updateSetting', { key: 'selectedTagIds', value: selectedTagIds })
  },

  async updateSetting ({ commit }, { key, value }) {
    await dexieDb.settings.put({ key, value: toRaw(value) })
    commit('updateSetting', { key, value })
  },

  async removeAllTagFilters ({ dispatch }) {
    await dexieDb.settings.put({ key: 'selectedTagIds', value: [] })
    await dispatch('updateSetting', { key: 'selectedTagIds', value: [] })
  },

  openActivityModal ({ state, commit, dispatch }) {
    if (!state.tempState.modalTagId) {
      dispatch('loadAllActivity')
    } else {
      dispatch('loadTagActivity')
    }
    commit('setActivityModalVisible', true)
  },

  closeActivityModal ({ commit }) {
    commit('setActivityModalVisible', false)
  }
}

// Helper function for Dexie calls
async function handleDexieError (dexiePromise, context = 'database operation', entity) {
  try {
    return await dexiePromise
  } catch (error) {
    console.error(`Dexie error during ${context}:`, error, 'entity(ies):', entity)
    throw error
  }
}

export default actions
