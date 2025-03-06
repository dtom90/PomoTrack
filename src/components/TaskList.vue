<template>
  <div>
    <!-- TaskList Title Section -->
    <div class="title-section">
      <!-- TaskList Title -->
      <span class="title">
        {{ title }}
      </span>
      
      <!-- To Do List Filter Menu -->
      <TaskFilterDropdown v-if="!isCompletedList" />
      
      <!-- Done List Menu -->
      <b-dropdown
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
        
        <b-dropdown-item
          id="archive-btn"
          variant="danger"
          title="Archive all list tasks"
          @click="archiveTasks"
        >
          Archive All
        </b-dropdown-item>
      </b-dropdown>
    </div>
    
    <b-input-group
      v-if="!isCompletedList"
      id="todo-input-section"
      class="my-3"
    >
      <!-- New Task Input Field -->
      <b-form-input
        id="new-task"
        v-model="newTaskName"
        placeholder="Enter new task.."
        @keyup.enter="addNewTask"
      />
    </b-input-group>
    
    <!-- Incomplete Tasks -->
    <draggable
      v-if="!isCompletedList"
      id="incomplete-task-list"
      v-model="incompleteTaskList"
      class="list-group"
      ghost-class="draggable-ghost"
      :animation="200"
      @start="isDragging = true"
      @end="isDragging = false"
    >
      <transition-group
        type="transition"
        :name="!isDragging ? 'flip-list' : ''"
      >
        <Task
          v-for="task in incompleteTaskList"
          :key="task.id"
          :task="task"
        />
      </transition-group>
    </draggable>
    
    <!-- Completed Tasks -->
    <ul
      v-if="isCompletedList"
      id="completed-task-list"
      class="list-group scroll-list"
    >
      <Task
        v-for="task in completedTaskList"
        :key="task.id"
        :task="task"
      />
    </ul>
  </div>
</template>

<script>
import Task from './Task.vue'
import TaskFilterDropdown from './TaskFilterDropdown.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import draggable from 'vuedraggable'

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
    isDragging: false
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
          ? (
            this.settings.filterOperator === 'and'
              ? this.incompleteTasks.filter(task => this.settings.selectedTagIds.every(tag => task.tags.includes(tag)))
              : this.incompleteTasks.filter(task => this.settings.selectedTagIds.some(tag => task.tags.includes(tag)))
          )
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
@import "../styles/_variables.scss";

.title-section {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.title {
  flex: 1;
  text-align: left;
  font-size: $font-size-large;
  font-weight: $font-weight-bold;
}

.title-section > button,
.dropdown-menu > button,
.dropdown-menu > .form-check,
{
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

</style>

<style>
/*noinspection CssUnusedSymbol*/
.filter-btn-active {
  /*noinspection CssUnresolvedCustomProperty*/
  background-color: var(--filter-btn-background-color) !important;
}
</style>
