import type { GetterTree } from 'vuex'
import type { PomoTrackState, Task, Tag } from '@/types'

const getters: GetterTree<PomoTrackState, PomoTrackState> = {
  anyTasks: (state): boolean => state.tasks.length > 0,

  getTaskById: (state) => (taskId: string): Task | undefined => {
    return state.tasks.find((t: Task) => t.id === taskId)
  },

  getTaskTagIds: (state) => (taskId: string): string[] => {
    return state.taskTagsMap[taskId]
  },

  selectedTask (state): Task | undefined {
    return state.tasks.find((t: Task) => t.id === state.settings.selectedTaskID)
  },

  activeTask (state): Task | undefined {
    return state.tasks.find((t: Task) => t.id === state.tempState.activeTaskID)
  },

  incompleteTasks: (state): Task[] => {
    return state.tasks.filter((t: Task) => !t.completed)
  },

  completedTasks (state): Task[] {
    let completedTasks = state.tasks.filter((t: Task) => t.completed)
    completedTasks = completedTasks.sort((a: Task, b: Task) => (a.completed ?? 0) - (b.completed ?? 0))
    return completedTasks
  },

  completedTasksFiltered (state): Task[] {
    let completedTasks = state.tasks.filter((t: Task) => t.completed)
    completedTasks = completedTasks.sort((a: Task, b: Task) => (a.completed ?? 0) - (b.completed ?? 0))
    return state.settings.selectedTagIds.length > 0
      ? (
        completedTasks.filter(task => state.settings.selectedTagIds.every(tagId => state.taskTagsMap[task.id].includes(tagId)))
      )
      : completedTasks
  },

  archivedTasks (state): Task[] {
    return state.tasks.filter((t: Task) => t.archived)
  },

  unselectedTags: (state): string[] => Object.keys(state.tags).filter(tagId => !state.settings.selectedTagIds.includes(tagId)),

  availableTags: (state: PomoTrackState) => (taskId: string, newTagName: string): Tag[] => {
    const task = state.tasks.find((t: Task) => t.id === taskId)
    if (!task) return []
    return Object.values(state.tags)
        .filter((tag: Tag) => !state.taskTagsMap[task.id].includes(tag.id) && tag.tagName.startsWith(newTagName))
        .sort((a: Tag, b: Tag) => state.tagOrder.indexOf(a.id) - state.tagOrder.indexOf(b.id))
  }
}

export default getters
