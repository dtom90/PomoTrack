<template>
  <!--  Task List Group Item Wrapper  -->
  <li
    v-if="task"
    :class="['task', 'draggable-item', 'list-group-item', 'list-group-item-action', 'form-check', { active: active }]"
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

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import Checkbox from './Checkbox.vue'
import TaskTagList from './TaskTagList.vue'
import TimerDial from './TimerDial.vue'
import type { Task } from '@/types'

// Define props
const props = defineProps({
  taskId: {
    type: String,
    required: true
  }
})

// Store access
const store = useStore()

// Computed properties (from mapState and computed)
const tempState = computed(() => store.state.tempState)
const settings = computed(() => store.state.settings)
const tasks = computed<{ [taskId: string]: Task }>(() => store.state.tasks)

const task = computed<Task | undefined>(() => {
  return tasks.value[props.taskId]
})

const active = computed(() => {
  return settings.value.selectedTaskID === props.taskId
})

const checked = computed(() => {
  return !!task.value?.completed
})

const displayCountdownIndicator = computed(() => {
  return tempState.value.activeTaskID === props.taskId
})
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
