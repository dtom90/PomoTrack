<template>
  <div>
    <!-- TaskList Title Section -->
    <div class="title-section">
      <!-- TaskList Title -->
      <h3 class="title">
        {{ title }}
      </h3>
      
      <!-- To Do List Filter Menu -->
      <b-dropdown
        v-if="!isCompletedList"
        id="filter-menu-button"
        v-b-tooltip.hover.right="filterButtonTooltip"
        :disabled="Object.keys(tags).length === 0"
        dropright
        variant="light"
        :toggle-class="settings.selectedTagIds.length > 0 ? 'filter-btn-active' : ''"
        :style="filterBtnStyle"
        no-caret
      >
        <template #button-content>
          <font-awesome-icon icon="filter" />
        </template>

        <TagList
          v-if="settings.selectedTagIds.length > 0"
          label="Filtering on tasks with"
          :tag-list="settings.selectedTagIds"
          :remove-tag="removeTag"
          :update-filter-operator="updateSelectedTask"
          remove-text="Clear Filter"
        />
        <div
          v-if="settings.selectedTagIds.length > 0"
          class="form-check form-check-inline"
        >
          <input
            id="addTagsSelect"
            v-model="addSelectedTags"
            class="form-check-input"
            type="checkbox"
          >
          <label
            class="form-check-label"
            for="addTagsSelect"
          >Include in new tasks</label>
        </div>
        <div
          v-if="settings.selectedTagIds.length > 0 && unselectedTags.length > 0"
          class="dropdown-divider"
        />
        <TagList
          v-if="unselectedTags.length > 0"
          :label="settings.selectedTagIds.length > 0 ? 'Add to filter' : 'Filter on'"
          :tag-list="unselectedTags"
          :select-tag="selectTag"
        />
      </b-dropdown>
      
      <!-- Done List Menu -->
      <div
        v-if="isCompletedList"
      >
        <button
          :id="btnId"
          class="btn btn-light"
          title="List options"
          data-toggle="dropdown"
        >
          <font-awesome-icon icon="ellipsis-vertical" />
        </button>
        
        <div
          id="done-menu"
          class="dropdown-menu"
        >
          <div class="input-group">
            <select
              :id="selectId"
              v-model="sortOrder"
              class="custom-select"
            >
              <option
                v-for="option in sortingOptions"
                :key="option"
                :value="option"
              >
                {{ option }}
              </option>
            </select>
            <div class="input-group-append">
              <label
                class="input-group-text"
                :for="selectId"
              >First</label>
            </div>
          </div>
          <div class="dropdown-divider" />
          <button
            id="archive-btn"
            class="btn btn-danger"
            title="Archive all list tasks"
            @click="archiveTasks"
          >
            Archive All
          </button>
        </div>
      </div>
    </div>
    
    <div
      v-if="!isCompletedList"
      id="todo-input-section"
      class="input-group"
    >
      <!-- New Task Input Field -->
      <input
        id="new-task"
        v-model="newTaskName"
        type="text"
        class="form-control"
        placeholder="enter new task"
        @keyup.enter="addNewTask"
      >
    </div>
    
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
import TagList from './TagList.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import draggable from 'vuedraggable'

export default {
  
  name: 'TaskList',
  
  components: {
    Task,
    TagList,
    draggable
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
      'selectedTask',
      'unselectedTags'
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
    addSelectedTags: {
      get () {
        return this.settings.addSelectedTags
      },
      set (value) {
        this.updateSetting({ key: 'addSelectedTags', value })
      }
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
    },

    async selectTag (tagId, e) {
      e.stopPropagation()
      await this.addTagFilter({ tagId })
      await this.updateSelectedTask()
    },
    
    async removeTag ({ tagId }) {
      await this.removeTagFilter({ tagId })
      await this.updateSelectedTask()
    },
    
    async updateSelectedTask () {
      // Select some task with the selected tags
      if (!this.selectedTask || (this.selectedTask && !(
        (this.settings.filterOperator === 'or' && this.settings.selectedTagIds.some(tag => this.selectedTask.tags.includes(tag))) ||
        (this.settings.filterOperator === 'and' && this.settings.selectedTagIds.every(tag => this.selectedTask.tags.includes(tag)))
      ))) {
        let tasksWithTag = this.settings.filterOperator === 'or'
          ? this.incompleteTasks.find(task => this.settings.selectedTagIds.some(tag => task.tags.includes(tag)))
          : this.incompleteTasks.find(task => this.settings.selectedTagIds.every(tag => task.tags.includes(tag)))
        if (!tasksWithTag) {
          let completedTasks = this.completedTasksFiltered
          completedTasks = completedTasks.filter(t => !t.archived)
          tasksWithTag = this.settings.filterOperator === 'or'
            ? completedTasks.find(task => this.settings.selectedTagIds.some(tag => task.tags.includes(tag)))
            : completedTasks.find(task => this.settings.selectedTagIds.every(tag => task.tags.includes(tag)))
        }
        if (tasksWithTag) {
          await this.selectTask({ taskId: tasksWithTag.id })
        } else {
          await this.selectTask({ taskId: null })
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "../styles/_variables.scss";

.title-section {
  display: flex;
}

.title {
  flex: 1;
  margin-left: 40px;
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

#filter-menu-button {
  width: 50px;
  margin-bottom: 0.5rem;
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

#incomplete-task-list {
  max-height: calc(100vh - #{$top-offset} - 96px);
  overflow-y: auto;
}

.scroll-list {
  max-height: calc(100vh - #{$top-offset} - 42px);
  overflow-y: auto;
}

</style>

<style>
/*noinspection CssUnusedSymbol*/
.filter-btn-active {
  /*noinspection CssUnresolvedCustomProperty*/
  background-color: var(--filter-btn-background-color) !important;
}
</style>
