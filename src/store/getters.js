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
  
  tagActivity: state => tag => state.tasks.filter(task => task.tags.includes(tag))
    .map(task => {
      const logEvents = task.log.map(event => Object.assign({ task: task.name }, event))
      if (task.completed) {
        logEvents.unshift({ task: task.name, completed: task.completed })
      }
      return logEvents
    }).flat().sort((a, b) => ('started' in a ? a.started : a.completed) - ('started' in b ? b.started : b.completed)),
  
  allActivity: state => state.tasks
    .map(task => {
      const logEvents = task.log.map(event => Object.assign({ task: task.name, tagId: task.tags[0] }, event))
      if (task.completed) {
        logEvents.unshift({ task: task.name, tagId: task.tags[0], completed: task.completed })
      }
      return logEvents
    }).flat().sort((a, b) => ('started' in a ? a.started : a.completed) - ('started' in b ? b.started : b.completed))
}

export default getters
