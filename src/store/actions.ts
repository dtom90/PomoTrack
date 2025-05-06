import type { ActionContext } from 'vuex'
import type { PomoTrackState, Task, TaskForState, Tag, TaskLog, TaskTagMap, SettingKv } from '@/types'
import dexieDb from './dexieDb'
import { nanoid } from 'nanoid'
// @ts-expect-error color-manager is not typed yet (TODO)
import ColorManager from 'color-manager'
import { toRaw } from 'vue'

const actions = {
  async loadInitialData ({ commit }: ActionContext<PomoTrackState, PomoTrackState>) {
    const tasks = await dexieDb.tasks.orderBy('order').toArray()
    const tags = await dexieDb.tags.orderBy('order').toArray()
    const taskTagMaps = await dexieDb.taskTagMap.toArray()
    const settings = await dexieDb.settings.toArray()
    const logs = await dexieDb.logs.toArray()
    // If any logs were running but not stopped, stop them.
    for (const log of logs) {
      if (!log.stopped && log.timeSpent) {
        log.stopped = log.started + log.timeSpent
        await dexieDb.logs.put(log)
      }
    }
    let selectedTaskLogs: TaskLog[] = []
    for (const setting of settings) {
      if (setting.key === 'selectedTaskID' && setting.value) {
        const selectedTaskID = setting.value as string
        selectedTaskLogs = await dexieDb.logs.where('taskId').equals(selectedTaskID).toArray()
      }
    }
    commit('loadInitialData', { tasks, tags, taskTagMaps, settings, selectedTaskLogs })
  },

  async loadAllActivity ({ commit }: ActionContext<PomoTrackState, PomoTrackState>) {
    const logs = await dexieDb.logs.orderBy('started').reverse().toArray()
    commit('setModalActivity', { logs })
  },

  async loadTagActivity ({ state, commit }: ActionContext<PomoTrackState, PomoTrackState>) {
    if (!state.tempState.modalTagId) {
      return
    }
    const taskMaps = await dexieDb.taskTagMap.where('tagId').equals(state.tempState.modalTagId).toArray()
    const taskIds = taskMaps.map(taskMap => taskMap.taskId)
    const logs = await dexieDb.logs.where('taskId').anyOf(taskIds).toArray()
    commit('setModalActivity', { logs })
  },

  async addTask ({ state, commit, dispatch }: ActionContext<PomoTrackState, PomoTrackState>, { name }: { name: string }) {
    const taskName = name.trim()
    if (taskName) {
      try {
        const order = state.tasks.reduce((max, t) => t.order > max ? t.order : max, 0) + 1
        const newTask: Task = {
          id: 'task-' + nanoid(),
          name: taskName,
          notes: '',
          order,
          created_at: Date.now(),
          completed: undefined,
          archived: undefined
        }

        await handleDexieError(dexieDb.tasks.add(newTask), 'tasks.add', newTask)

        const taskForState: TaskForState = {
          ...newTask,
          tags: []
        }

        if (state.settings.addSelectedTags && state.settings.selectedTagIds.length) {
          const taskTagMaps: TaskTagMap[] = state.settings.selectedTagIds.map((tagId: string) => ({
            id: 'taskTag-' + nanoid(),
            taskId: newTask.id,
            tagId
          }))
          await handleDexieError(dexieDb.taskTagMap.bulkAdd(taskTagMaps), 'taskTagMap.bulkAdd', taskTagMaps)
          taskForState.tags = taskTagMaps.map((taskTagMap: TaskTagMap) => taskTagMap.tagId)
        } else {
          taskForState.tags = []
        }
        commit('addTask', { task: taskForState })
        await dispatch('selectTask', { taskId: newTask.id })
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to complete addTask operation:', error)
      }
    }
  },

  async updateTaskName ({ state, commit }: ActionContext<PomoTrackState, PomoTrackState>, { taskId, name }: { taskId: string, name: string }) {
    const task = state.tasks.find(t => t.id === taskId)
    if (task) {
      const taskUpdates: Partial<Task> = { name }
      await dexieDb.tasks.update(taskId, taskUpdates)
      commit('updateTask', { taskId, taskUpdates })
    }
  },

  async updateTaskNotes ({ state, commit }: ActionContext<PomoTrackState, PomoTrackState>, { taskId, notes }: { taskId: string, notes: string }) {
    const task = state.tasks.find(t => t.id === taskId)
    if (task) {
      const taskUpdates: Partial<Task> = { notes }
      await dexieDb.tasks.update(taskId, taskUpdates)
      commit('updateTask', { taskId, taskUpdates })
    }
  },

  async reorderIncompleteTasks ({ state, commit }: ActionContext<PomoTrackState, PomoTrackState>, { newIncompleteTaskOrder }: { newIncompleteTaskOrder: TaskForState[] }) {
    try {
      const incompleteTasks: TaskForState[] = state.tasks.filter(t => !t.completed)
      const completedTasks: TaskForState[] = state.tasks.filter(t => t.completed)
      const origLength = incompleteTasks.length
      if (newIncompleteTaskOrder.length === origLength) {
        const fullTaskOrder: TaskForState[] = newIncompleteTaskOrder.concat(completedTasks)
        for (const [i, task] of fullTaskOrder.entries()) {
          task.order = i
        }
        await handleDexieError(dexieDb.tasks.bulkPut(fullTaskOrder.map(toRaw) as Task[]), 'tasks.bulkPut reorder (same length)', fullTaskOrder.map(toRaw))
        commit('setTasks', { tasks: fullTaskOrder })
      } else {
        const reorderTaskIds: { [key: string]: boolean } = {}
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
          const fullTaskOrder: TaskForState[] = incompleteTasks.concat(completedTasks)
          for (const [i, task] of fullTaskOrder.entries()) {
            task.order = i
          }
          await handleDexieError(dexieDb.tasks.bulkPut(fullTaskOrder.map(toRaw) as Task[]), 'tasks.bulkPut reorder (different length)', fullTaskOrder.map(toRaw))
          commit('setTasks', { tasks: fullTaskOrder })
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to complete reorderIncompleteTasks operation:', error)
    }
  },

  async startTask ({ state, commit, dispatch }: ActionContext<PomoTrackState, PomoTrackState>, { taskId }: { taskId: string }) {
    await dispatch('stopTask')

    const task = state.tasks.find(t => t.id === taskId)
    if (task) {
      const log: TaskLog = {
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

  async updateTaskTimer ({ state, commit }: ActionContext<PomoTrackState, PomoTrackState>, { taskId }: { taskId: string }) {
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

  async stopTask ({ commit }: ActionContext<PomoTrackState, PomoTrackState>) {
    const runningLog = await dexieDb.logs.filter(log => log.stopped === null).first()
    if (runningLog) {
      runningLog.stopped = Date.now()
      runningLog.timeSpent = runningLog.stopped - runningLog.started
      await dexieDb.logs.put(runningLog)
      commit('updateLog', { taskId: runningLog.taskId, log: runningLog })
    }
  },

  async completeTask ({ state, commit, dispatch }: ActionContext<PomoTrackState, PomoTrackState>, { taskId }: { taskId: string }) {
    const task = state.tasks.find(t => t.id === taskId)
    if (task) {
      let completedValue = undefined
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

  async archiveTask ({ state, commit }: ActionContext<PomoTrackState, PomoTrackState>, { taskId }: { taskId: string }) {
    const task = state.tasks.find(t => t.id === taskId)
    if (task) {
      const taskUpdates = { archived: !task.archived }
      await dexieDb.tasks.update(taskId, taskUpdates)
      commit('updateTask', { taskId, taskUpdates })
    }
  },

  async archiveTasks ({ getters, commit }: ActionContext<PomoTrackState, PomoTrackState>) {
    const completedTasks: TaskForState[] = getters.completedTasksFiltered.filter((t: TaskForState) => !t.archived)
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

  async addInterval ({ state, commit }: ActionContext<PomoTrackState, PomoTrackState>, { taskId, started, timeSpent, stopped }: { taskId: string, started: number, timeSpent: number, stopped: number }) {
    const task = state.tasks.find(t => t.id === taskId)
    if (task) {
      const log = {
        id: 'log-' + nanoid(),
        taskId,
        started,
        timeSpent,
        stopped
      } as TaskLog
      await dexieDb.logs.add(log)
      commit('updateLog', { taskId, log })
    }
  },

  async getLogById ({ }, { logId }: { logId: string }): Promise<TaskLog | undefined> {
    return await dexieDb.logs.where('id').equals(logId).first()
  },

  async updateInterval ({ commit }: ActionContext<PomoTrackState, PomoTrackState>, { logId, started, timeSpent, stopped }: { logId: string, started: number, timeSpent: number, stopped: number }) {
    const log = await dexieDb.logs.get(logId)
    if (!log) return
    log.started = started
    log.stopped = stopped
    log.timeSpent = timeSpent
    await dexieDb.logs.put(log)
    commit('updateLog', { taskId: log.taskId, log })
  },

  async deleteInterval ({ commit }: ActionContext<PomoTrackState, PomoTrackState>, { logId }: { logId: string }) {
    const log = await dexieDb.logs.get(logId)
    if (!log) return
    await dexieDb.logs.delete(logId)
    commit('deleteInterval', { taskId: log.taskId, logId })
  },

  async addTaskTagByName ({ state, commit }: ActionContext<PomoTrackState, PomoTrackState>, { taskId, tagName }: { taskId: string, tagName: string }) {
    tagName = tagName.trim()
    if (tagName) {
      const task = state.tasks.find(t => t.id === taskId)
      if (task) {
        let tag = await dexieDb.tags.where('tagName').equals(tagName).first()
        const isNewTag = !tag
        if (!tag) {
          const colors = Object.values(state.tags).map(tag => tag.color)
          const colorManager = new ColorManager(colors)
          const maxOrder = await dexieDb.tags.orderBy('order').last()
          const order = maxOrder ? maxOrder.order + 1 : 0
          tag = {
            id: 'tag-' + nanoid(),
            tagName,
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

  async addTaskTagById ({ state, commit }: ActionContext<PomoTrackState, PomoTrackState>, { taskId, tagId }: { taskId: string, tagId: string }) {
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

  async updateTag ({ commit }: ActionContext<PomoTrackState, PomoTrackState>, { tagId, ...tagUpdates }: { tagId: string } & Partial<Tag>) {
    const tag = await dexieDb.tags.where('id').equals(tagId).first()
    if (!tag) {
      alert('Error: the tag you are trying to update does not exist. Please refresh the page and try again.')
      return
    }

    if ('tagName' in tagUpdates && tagUpdates.tagName) {
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

  async reorderTags ({ state, commit }: ActionContext<PomoTrackState, PomoTrackState>, { newOrder }: { newOrder: string[] }) {
    const reorderedTags: Tag[] = []
    for (const [i, tagId] of newOrder.entries()) {
      const tag = state.tags[tagId]
      if (tag.order !== i) {
        tag.order = i
      }
      reorderedTags.push(toRaw(tag))
    }
    await handleDexieError(dexieDb.tags.bulkPut(reorderedTags), 'tags.bulkPut reorder', reorderedTags)
    commit('updateTagOrder', { reorderedTags })
  },

  async removeTaskTag ({ commit }: ActionContext<PomoTrackState, PomoTrackState>, { taskId, tagId }: { taskId: string, tagId: string }) {
    await dexieDb.taskTagMap
      .where('taskId').equals(taskId)
      .and((taskTagMap: TaskTagMap) => taskTagMap.tagId === tagId)
      .delete()

    const newTags = await dexieDb.taskTagMap.where('taskId').equals(taskId).toArray()
    const newTagIds = newTags.map(tag => tag.tagId)
    commit('updateTask', { taskId, taskUpdates: { tags: newTagIds } })
  },

  async deleteTag ({ commit }: ActionContext<PomoTrackState, PomoTrackState>, { tagId }: { tagId: string }) {
    const tag = await dexieDb.tags.where('id').equals(tagId).first()
    if (!tag) return
    if (confirm(`Are you sure you want to delete the tag "${tag.tagName}"?\nAll tasks with this tag will lose the tag.`)) {
      await dexieDb.taskTagMap.where('tagId').equals(tagId).delete()
      await dexieDb.tags.where('id').equals(tagId).delete()
      commit('deleteTag', { tagId })
    }
  },

  async selectTask ({ dispatch, commit }: ActionContext<PomoTrackState, PomoTrackState>, { taskId }: { taskId: string | null }) {
    await dispatch('updateSetting', { key: 'selectedTaskID', value: taskId })
    if (taskId) {
      const selectedTaskLogs = await dexieDb.logs.where('taskId').equals(taskId).toArray()
      commit('setSelectedTaskLogs', { selectedTaskLogs })
    } else {
      commit('setSelectedTaskLogs', { selectedTaskLogs: [] })
    }
  },

  async addTagFilter ({ state, dispatch }: ActionContext<PomoTrackState, PomoTrackState>, { tagId }: { tagId: string }) {
    const selectedTagIds = state.settings.selectedTagIds
    selectedTagIds.push(tagId)
    await dispatch('updateSetting', { key: 'selectedTagIds', value: selectedTagIds })
  },

  async removeTagFilter ({ state, dispatch }: ActionContext<PomoTrackState, PomoTrackState>, { tagId }: { tagId: string }) {
    const selectedTagIds = state.settings.selectedTagIds.filter(selectedTagId => selectedTagId !== tagId)
    await dispatch('updateSetting', { key: 'selectedTagIds', value: selectedTagIds })
  },

  async updateSetting ({ commit }: ActionContext<PomoTrackState, PomoTrackState>, { key, value }: SettingKv) {
    await handleDexieError(dexieDb.settings.put({ key, value: toRaw(value) }), 'settings.put', { key, value: toRaw(value) })
    commit('updateSetting', { key, value })
  },

  async removeAllTagFilters ({ dispatch }: ActionContext<PomoTrackState, PomoTrackState>) {
    await handleDexieError(dexieDb.settings.put({ key: 'selectedTagIds', value: [] }), 'settings.put removeAllTagFilters')
    await dispatch('updateSetting', { key: 'selectedTagIds', value: [] })
  },

  openActivityModal ({ state, commit, dispatch }: ActionContext<PomoTrackState, PomoTrackState>) {
    if (!state.tempState.modalTagId) {
      dispatch('loadAllActivity')
    } else {
      dispatch('loadTagActivity')
    }
    commit('setActivityModalVisible', true)
  },

  closeActivityModal ({ commit }: ActionContext<PomoTrackState, PomoTrackState>) {
    commit('setActivityModalVisible', false)
  }
}

// Helper function for Dexie calls
async function handleDexieError<T> (dexiePromise: Promise<T>, context = 'database operation', entity?: unknown): Promise<T> {
  try {
    return await dexiePromise
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Dexie error during ${context}:`, error, 'entity(ies):', entity)
    throw error
  }
}

export default actions
