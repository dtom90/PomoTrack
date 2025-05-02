<template>
  <!--  Task List Group Item Wrapper  -->
  <li
    :class="['task', 'draggable-item', 'list-group-item', 'list-group-item-action', 'form-check', { active: active }]"
    @click="selectTask({ taskId: taskId })"
  >
    <div class="d-flex align-items-start ">
      <Checkbox
        :checked="checked"
        :task-id="taskId"
      />
      <div class="task-name-and-tags-wrapper">
        <div class="task-name">
          {{ task.name }}
        </div>
        <div class="d-flex flex-wrap">
          <TaskTagList
            :task-id="taskId"
            mini
          />
        </div>
      </div>
      <TimerDial
        v-if="displayCountdownIndicator"
        :size="20"
        :circle-thickness="4"
      />
    </div>
  </li>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import Checkbox from './Checkbox'
import TaskTagList from './TaskTagList.vue'
import TimerDial from './TimerDial.vue'

export default {
  
  name: 'Task',
  components: { TaskTagList, Checkbox, TimerDial },
  props: {
    taskId: {
      type: String,
      required: true
    }
  },
  
  computed: {
    
    ...mapState([
      'tags',
      'tagOrder',
      'tempState',
      'settings',
      'tasks'
    ]),

    // Find the task object from the store using taskId
    task () {
      return this.tasks.find(t => t.id === this.taskId)
    },
    
    active () {
      // Use taskId directly if task might not be found immediately
      return this.settings.selectedTaskID === this.taskId
    },
    
    checked () {
      // Ensure task exists before accessing properties
      return this.task ? this.task.completed !== null : false
    },
    
    displayCountdownIndicator () {
      // Use taskId directly
      return this.tempState.activeTaskID === this.taskId
    }
  },
  
  methods: {
    ...mapActions([
      'selectTask'
    ])
  }
  
}
</script>

<style scoped lang="scss">
@use "../styles/_variables.scss";

.task {
  padding-top: 12px;
  padding-bottom: 12px;
  padding-left: 8px;
  padding-right: 8px;
  border: none;
  border-radius: 8px !important;
  color: variables.$dark-primary !important;
}

.task.active, .task:hover {
  background-color: variables.$dark-quaternary;
}

.task.active {
  font-weight: variables.$font-weight-bold;
}

.task-name-and-tags-wrapper {
  margin-left: 12px;
  flex: 1;
}

.task-name {
  flex: 1;
  text-align: left;
  line-height: 21px;
  min-height: variables.$checkbox-size;
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}
</style>
