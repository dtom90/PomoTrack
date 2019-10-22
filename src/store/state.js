/* eslint-disable import/first */
const state = {
  tasks: [],
  tags: {},
  nextTaskID: 0,
  insertAtTop: false,
  selectedTaskID: null,
  activeTaskID: null,
  selectedTag: null,
  running: false
}

// // Load task with activity
// import { taskWithActivity } from '../fixtures'
// state.tasks.push(taskWithActivity())

// // Load state from sample file
// import sample1 from '../fixtures/sample1'
// const state = sample1

export default state
