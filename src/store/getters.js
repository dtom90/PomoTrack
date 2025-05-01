const getters = {
  anyTasks: state => state.tasks.length > 0,
  
  getTaskById: state => (taskId) => {
    return state.tasks.find(t => t.id === taskId)
  },
  
  selectedTask (state) {
    return state.tasks.find(t => t.id === state.settings.selectedTaskID)
  },
  
  activeTask (state) {
    return state.tasks.find(t => t.id === state.tempState.activeTaskID)
  },
  
  incompleteTasks: (state) => {
    return state.tasks.filter(t => !t.completed)
  },
  
  completedTasks (state) {
    let completedTasks = state.tasks.filter(t => t.completed)
    completedTasks = completedTasks.sort((a, b) => a.completed - b.completed)
    return completedTasks
  },
  
  completedTasksFiltered (state) {
    let completedTasks = state.tasks.filter(t => t.completed)
    completedTasks = completedTasks.sort((a, b) => a.completed - b.completed)
    return state.settings.selectedTagIds.length > 0
      ? (
        state.settings.filterOperator === 'and'
          ? completedTasks.filter(task => state.settings.selectedTagIds.every(tag => task.tags.includes(tag)))
          : completedTasks.filter(task => state.settings.selectedTagIds.some(tag => task.tags.includes(tag)))
      )
      : completedTasks
  },
  
  archivedTasks (state) {
    return state.tasks.filter(t => t.archived)
  },

  unselectedTags: state => Object.keys(state.tags).filter(tag => !state.settings.selectedTagIds.includes(tag)),
  
  availableTags: state => (taskId, newTagName) => {
    const task = state.tasks.find(t => t.id === taskId)
    if (!task) return []
    return Object.values(state.tags)
      .filter(tag => !task.tags.includes(tag.id) && tag.tagName.startsWith(newTagName))
      .sort((a, b) => state.tagOrder.indexOf(a) - state.tagOrder.indexOf(b))
  },
}

export default getters
