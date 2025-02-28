<template>
  <!--  Task List Group Item Wrapper  -->
  <li
    :class="'task draggable-item list-group-item list-group-item-action form-check'+active"
    @click="selectTask({ taskId: task.id })"
  >
    <div class="d-flex align-items-top">
      <Checkbox
        :checked="checked"
        :task-id="task.id"
      />
      <div>
        <div class="task-name">
          {{ task.name }}
        </div>
        <div class="d-flex flex-wrap">
          <TagList
            :tag-list="taskTags"
            :task-id="task.id"
            mini
          />
        </div>
      </div>
      <font-awesome-icon
        v-if="displayCountdownIndicator"
        id="indicatorIcon"
        icon="clock"
      />
    </div>
  </li>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import Checkbox from './Checkbox'
import TagList from './TagList.vue'

export default {
  
  name: 'Task',
  components: { TagList, Checkbox },
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
  // background-color: #f8f9fa;
}

.task-name {
  flex: 1;
  text-align: left;
  margin-left: 8px;
  margin-bottom: 8px;
  line-height: 1;
}

#indicatorIcon {
  color: red;
  width: 2rem;
  height: 2rem;
}

.badge:empty {
  display: inline-block !important;
}

.mini-tag {
  width: 50px !important;
  height: 10px !important;
  margin-top: 10px;
  margin-right: 10px;
}
</style>
