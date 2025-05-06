import type { GetterTree } from 'vuex'
import type { PomoTrackState, TaskForState, Tag } from '@/types'

const getters: GetterTree<PomoTrackState, PomoTrackState> = {
  anyTasks: (state): boolean => state.tasks.length > 0,

  getTaskById: (state) => (taskId: string): TaskForState | undefined => {
    return state.tasks.find((t: TaskForState) => t.id === taskId)
  },

  selectedTask (state): TaskForState | undefined {
    return state.tasks.find((t: TaskForState) => t.id === state.settings.selectedTaskID)
  },

  activeTask (state): TaskForState | undefined {
    return state.tasks.find((t: TaskForState) => t.id === state.tempState.activeTaskID)
  },

  incompleteTasks: (state): TaskForState[] => {
    return state.tasks.filter((t: TaskForState) => !t.completed)
  },

  completedTasks (state): TaskForState[] {
    let completedTasks = state.tasks.filter((t: TaskForState) => t.completed)
    completedTasks = completedTasks.sort((a: TaskForState, b: TaskForState) => a.completed - b.completed)
    return completedTasks
  },

  completedTasksFiltered (state): TaskForState[] {
    let completedTasks = state.tasks.filter((t: TaskForState) => t.completed)
    completedTasks = completedTasks.sort((a: TaskForState, b: TaskForState) => a.completed - b.completed)
    return state.settings.selectedTagIds.length > 0
      ? (
        state.settings.filterOperator === 'and'
          ? completedTasks.filter(task => state.settings.selectedTagIds.every(tagId => task.tags.includes(tagId)))
          : completedTasks.filter(task => state.settings.selectedTagIds.some(tagId => task.tags.includes(tagId)))
      )
      : completedTasks
  },

  archivedTasks (state): TaskForState[] {
    return state.tasks.filter((t: TaskForState) => t.archived)
  },

  unselectedTags: (state): string[] => Object.keys(state.tags).filter(tagId => !state.settings.selectedTagIds.includes(tagId)),

  availableTags: (state: PomoTrackState) => (taskId: string, newTagName: string): Tag[] => {
    const task = state.tasks.find((t: TaskForState) => t.id === taskId)
    if (!task) return []
    return Object.values(state.tags)
        .filter((tag: Tag) => !task.tags.includes(tag.id) && tag.tagName.startsWith(newTagName))
        .sort((a: Tag, b: Tag) => state.tagOrder.indexOf(a.id) - state.tagOrder.indexOf(b.id))
  }
}

export default getters
