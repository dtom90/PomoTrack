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

<script>
import Task from './Task.vue'
import TaskFilterDropdown from './TaskFilterDropdown.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import draggable from 'vuedraggable'
import isElectron from '../lib/isElectron'

export default {

  name: 'TaskList',

  components: {
    Task,
    draggable,
    TaskFilterDropdown
  },

  props: {
    title: {
      type: String,
      default: 'To Do'
    }
  },

  data: () => ({
    newTaskName: '',
    isFilterMenuOpen: false,
    sortingOptions: ['Recent', 'Oldest'],
    sortOrder: 'Recent',
    isDragging: false,
    isInElectron: isElectron()
  }),

  computed: {
    ...mapState([
      'tempState',
      'settings',
      'tags',
      'tasks'
    ]),
    ...mapGetters([
      'incompleteTasks',
      'completedTasksFiltered',
      'selectedTask'
    ]),
    isCompletedList () {
      return this.title === 'Done'
    },
    btnId () {
      return this.isCompletedList ? 'completedSettingsButton' : 'todoSettingsButton'
    },
    selectId () {
      return (this.completed ? 'completed' : 'toDo') + 'OrderGroupSelect'
    },
    filterBtnStyle () {
      return {
        '--filter-btn-background-color': this.settings.selectedTagIds.length > 0 ? this.tags[this.settings.selectedTagIds[0]].color : 'white'
      }
    },
    filterButtonTooltip () {
      if (this.tasks.length === 0) {
        return 'Add a task enable filtering'
      } else if (Object.keys(this.tags).length === 0) {
        return 'Add a tag to a task to enable filtering'
      }
      return 'Filter tasks'
    },
    incompleteTaskList: {
      get () {
        let incompleteTasks = this.settings.selectedTagIds.length > 0
          ? this.incompleteTasks.filter(task => this.settings.selectedTagIds.every(tag => task.tags.includes(tag)))
          : this.incompleteTasks
        incompleteTasks = incompleteTasks.filter(t => !t.archived)
        return incompleteTasks
      },
      set (newIncompleteTaskOrder) {
        this.reorderIncompleteTasks({ newIncompleteTaskOrder })
      }
    },

    completedTaskList () {
      let completedTasks = this.completedTasksFiltered
      completedTasks = completedTasks.filter(t => !t.archived)
      return completedTasks && this.sortOrder !== 'Oldest'
        ? completedTasks.slice().reverse()
        : completedTasks
    }
  },

  methods: {

    ...mapActions([
      'addTask',
      'selectTask',
      'addTagFilter',
      'removeTagFilter',
      'reorderIncompleteTasks',
      'archiveTasks',
      'updateSetting'
    ]),

    ...mapMutations([
      'updateTempState'
    ]),

    addNewTask () {
      this.addTask({
        name: this.newTaskName
      })
      this.newTaskName = ''
    }
  }
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
