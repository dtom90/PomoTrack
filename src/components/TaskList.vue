<template>
  <div class="task-list-container">
    <!-- TaskList Title Section -->
    <div class="title-section">
      <!-- TaskList Title -->
      <span class="title">
        {{ title }}
      </span>

      <!-- To Do List Filter Menu -->
      <TaskFilterDropdown v-if="!isCompletedList" />

      <!-- Done List Menu -->
      <BDropdown
        v-if="isCompletedList"
        :id="btnId"
        right
        variant="light"
        toggle-class="btn-light"
        title="List options"
        no-caret
      >
        <template #button-content>
          <font-awesome-icon icon="ellipsis-vertical" />
        </template>

        <BDropdownItem
          id="archive-btn"
          variant="danger"
          title="Archive all list tasks"
          @click="archiveTasks"
        >
          Archive All
        </BDropdownItem>
      </BDropdown>
    </div>

    <BInputGroup
      v-if="!isCompletedList"
      id="todo-input-section"
      class="my-3"
    >
      <!-- New Task Input Field -->
      <BFormInput
        id="new-task"
        v-model="newTaskName"
        placeholder="Enter new task.."
        @keyup.enter="addNewTask"
      />
    </BInputGroup>

    <!-- Incomplete Tasks -->
    <draggable
      v-if="!isCompletedList"
      id="incomplete-task-list"
      v-model="incompleteTaskList"
      item-key="id"
      :key="incompleteTaskList.length"
      class="list-group"
      ghost-class="draggable-ghost"
      :animation="200"
      @start="isDragging = true"
      @end="isDragging = false"
    >
      <template #item="{element: task}">
        <div :key="task.id"> <!-- a bug in vue.draggable.next requires this to be wrapped in a non-component element -->
          <Task
            :task-id="task.id"
            @click="selectTask({ taskId: task.id })"
          />
        </div>
      </template>
    </draggable>

    <!-- Completed Tasks -->
    <ul
      v-if="isCompletedList && completedTaskList.length > 0"
      id="completed-task-list"
      class="list-group scroll-list"
    >
      <Task
        v-for="task in completedTaskList"
        :key="task.id"
        :task-id="task.id"
        @click="selectTask({ taskId: task.id })"
      />
    </ul>

    <!-- Empty State for Completed Tasks -->
    <div
      v-if="isCompletedList && completedTaskList.length === 0"
      id="completed-task-list"
      class="empty-state-container"
    >
      <img
        src="@/assets/icons/empty-white-box.svg"
        alt="Empty Archive"
        class="mb-2"
      >
      <span class="text-muted text-center">Completed tasks will appear here</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import Task from './Task.vue'
import TaskFilterDropdown from './TaskFilterDropdown.vue'
import draggable from 'vuedraggable'
import type { TaskForState } from '@/types'

// Define props
const props = defineProps({
  title: {
    type: String,
    default: 'To Do'
  }
})

const emit = defineEmits(['hide-offcanvas'])

// Store access
const store = useStore()

// Reactive state (from data)
const newTaskName = ref('')
const isDragging = ref(false)
const sortOrder = ref('Recent') // Assuming 'Recent' is the default

// Computed properties (from mapState, mapGetters, and computed)
const settings = computed(() => store.state.settings)
const incompleteTasksGetter = computed(() => store.getters.incompleteTasks)
const completedTasksFilteredGetter = computed(() => store.getters.completedTasksFiltered)

const isCompletedList = computed(() => props.title === 'Done')

const btnId = computed(() => {
  return isCompletedList.value ? 'completedSettingsButton' : 'todoSettingsButton'
})

const incompleteTaskList = computed<TaskForState[]>({
  get() {
    if (!settings.value || !incompleteTasksGetter.value) return []
    let filteredTasks = settings.value.selectedTagIds.length > 0
      ? incompleteTasksGetter.value.filter((task: TaskForState) =>
          settings.value.selectedTagIds.every((tagId: string) => task.tags.includes(tagId))
        )
      : incompleteTasksGetter.value
    filteredTasks = filteredTasks.filter((t: TaskForState) => !t.archived)
    return filteredTasks
  },
  set(newIncompleteTaskOrder: TaskForState[]) {
    store.dispatch('reorderIncompleteTasks', { newIncompleteTaskOrder })
  }
})

const completedTaskList = computed<TaskForState[]>(() => {
  if (!completedTasksFilteredGetter.value) return []
  const filteredCompletedTasks = completedTasksFilteredGetter.value.filter((t: TaskForState) => !t.archived)
  return filteredCompletedTasks && sortOrder.value !== 'Oldest'
    ? filteredCompletedTasks.slice().reverse()
    : filteredCompletedTasks
})

// Methods (from methods and mapActions/mapMutations)
const addNewTask = () => {
  if (newTaskName.value.trim()) {
    store.dispatch('addTask', {
      name: newTaskName.value.trim()
    })
    newTaskName.value = ''
  }
}

const selectTask = (payload: { taskId: string }) => {
  store.dispatch('selectTask', payload)
  emit('hide-offcanvas')
}

const archiveTasks = () => {
  store.dispatch('archiveTasks')
}
</script>

<style scoped lang="scss">
@use "../styles/_variables.scss";

.task-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.title-section {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.title {
  flex: 1;
  text-align: left;
  font-size: variables.$font-size-large;
  font-weight: variables.$font-weight-bold;
}

.title-section > button,
.dropdown-menu > button,
.dropdown-menu > .form-check {
  margin-bottom: 0.5rem;
}

#todo-input-section {
  margin-bottom: 10px;
}

#add-position-button {
  border: 1px solid #ced4da;
}

#add-position-menu {
  text-align: center;
}

.filter-btn-active > svg {
  color: white;
  -webkit-filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, .7));
  filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, .7));
}

.filter-btn-active:hover > svg {
  color: lightgrey;
}

#filter-menu {
  width: 200px;
}

#done-menu {
  width: 170px;
}

#filter-menu .form-check {
  margin: 0;
}

.custom-icons img {
  width: 1.4em;
  height: 1.4em;
}

.sortable-chosen {
  background-color: #e9ecef;
}

/* Empty state styling */
.empty-state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6c757d;
  flex-grow: 1;
}

.empty-state-icon {
  margin-bottom: 1rem;
  opacity: 0.6;
}

.empty-state-text {
  font-size: 1rem;
  margin-bottom: 0;
}

#incomplete-task-list {
  user-select: none;
}
</style>

<style>
/*noinspection CssUnusedSymbol*/
.filter-btn-active {
  /*noinspection CssUnresolvedCustomProperty*/
  background-color: var(--filter-btn-background-color) !important;
}
</style>
