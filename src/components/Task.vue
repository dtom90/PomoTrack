<template>
  <!--  Task List Group Item Wrapper  -->
  <li
    :class="'task draggable-item list-group-item list-group-item-action form-check'+active"
    @click="selectTask({ taskId: task.id })"
  >
    <div class="d-flex align-items-start ">
      <Checkbox
        :checked="checked"
        :task-id="task.id"
      />
      <div class="task-name-and-tags-wrapper">
        <div class="task-name">
          {{ task.name }}
        </div>
        <div class="d-flex flex-wrap">
          <TaskTagList
            :task-id="task.id"
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
    task: {
      type: Object,
      default: function () {
        return {
          id: 1,
          name: 'new task 1',
          createdDate: Date.now(),
          completed: false
        }
      }
    }
  },
  
  computed: {
    
    ...mapState([
      'tags',
      'tagOrder',
      'tempState',
      'settings'
    ]),
    
    active () {
      return this.settings.selectedTaskID === this.task.id ? ' active' : ''
    },
    
    checked () {
      return this.task.completed !== null
    },
    
    taskTags () {
      return this.task.tags.slice().sort((a, b) => this.tagOrder.indexOf(a) - this.tagOrder.indexOf(b))
    },
    
    displayCountdownIndicator () {
      return this.tempState.activeTaskID === this.task.id
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
@import "../styles/_variables.scss";

.task {
  padding: 8px;
  border: none;
  margin-bottom: 16px;
  border-radius: 8px !important;
}

.task.active, .task:hover {
  color: $dark-primary;
  background-color: $dark-quaternary;
  font-weight: $font-weight-bold;
}

.task-name-and-tags-wrapper {
  margin-left: 8px;
  flex: 1;
}

.task-name {
  flex: 1;
  text-align: left;
  margin-bottom: 8px;
  line-height: 1;
  min-height: $checkbox-size;
  display: flex;
  align-items: center;
}
</style>
