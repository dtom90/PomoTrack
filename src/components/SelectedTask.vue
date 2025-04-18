<template>
  <div
    id="selected-task-container"
  >
    <template>
      <!--  Title Section  -->
      <div
        id="title-section"
        class="d-flex justify-content-between align-items-lg-center"
      >
        <!--  Checkbox  -->
        <div>
          <Checkbox
            v-if="isEmptyState"
            size="large"
            :checked="false"
            :disabled="true"
          />
          <Checkbox
            v-if="selectedTask"
            size="large"
            :checked="checked"
            :task-id="selectedTask.id"
          />
        </div>

        <div
          id="checkbox-name-container"
          class="d-flex align-items-center justify-content-center flex-grow-1"
        >
          <!--  Task Name  -->
          <div
            v-if="!editingName"
            id="task-name"
            class="task-name"
            @mousedown="possibleEdit = true"
            @mousemove="possibleEdit = false"
            @mouseup="editName"
          >
            <span>{{ selectedTask && selectedTask.name }}</span>
          </div>
          
          <!--  Task Field (when editing)  -->
          <b-input-group
            v-if="editingName || isEmptyState"
            class="input-group flex-grow-1"
            @submit.prevent="saveName()"
          >
            <b-form-input
              id="task-name-input"
              ref="taskNameInput"
              v-model="newTaskName"
              placeholder="Enter new task.."
              class="task-name border-0"
              @keyup.enter="saveName()"
              @blur="saveName()"
            />
          </b-input-group>
        </div>
        
        <!-- Menu Options -->
        <TaskMenu
          v-if="selectedTask || isEmptyState"
          :task-id="selectedTask && selectedTask.id"
          :is-archived="selectedTask && selectedTask.archived"
        />
      </div>
    </template>
      
    <template>
      <!-- Countdown Timer -->
      <div id="countdown-section">
        <div v-show="isEmptyState || (selectedTask && !selectedTask.completed && (!tempState.running || !tempState.activeTaskID || tempState.activeTaskID === selectedTask.id))">
          <Timer
            :task-id="tempState.activeTaskID || (selectedTask && selectedTask.id)"
            :disabled="isEmptyState"
          />
        </div>
        
        <!-- Continue Timer Here -->
        <div
          v-if="selectedTask && !selectedTask.completed && (tempState.running && tempState.activeTaskID && tempState.activeTaskID !== selectedTask.id)"
          class="d-flex flex-column align-items-center"
          style="color: darkred"
        >
          <div>Continue Here</div>
          <button
            id="continue-here-btn"
            type="button"
            class="btn btn-light btn-lg"
            style="color: darkred"
            title="Continue Timer Here"
            @click="continueTimerHere"
          >
            <font-awesome-icon icon="play" />
          </button>
        </div>
      </div>
      
      <div
        v-if="selectedTask"
        id="tags-and-notes-section"
      >
        <!-- Notes Section -->
        <div
          id="notes-section"
          class="d-flex align-items-center"
        >
          <!-- Display Mode -->
          <!-- eslint-disable vue/no-v-html -->
          <span
            v-if="selectedTask.notes && !editingNotes"
            id="display-notes"
            class="notes-input-and-display"
            @click="editNotes"
            v-html="displayNotes"
          />
          <!-- eslint-enable vue/no-v-html -->
          
          <!-- Editing Mode -->
          <b-input-group
            v-if="editingNotes || !selectedTask.notes"
          >
            <b-form-textarea
              ref="notesInput"
              v-model="selectedTask.notes"
              placeholder="Enter notes here.."
              class="notes-input-and-display"
              no-resize
              @click="editNotes"
              @blur="saveNotes"
              @keydown.enter="handleNotesEnter"
              @input="adjustTextareaHeight"
            />
          </b-input-group>
        </div>
        
        <!-- Tags Section -->
        <div
          id="tags-section"
          class="d-flex align-items-top"
        >
          <label
            v-if="taskTags"
            id="tags-label"
          >
            <span>Tags:</span>
          </label>
          <TaskTagList :task-id="selectedTask.id" />
        </div>
      </div>
    </template>
    
    <template v-if="selectedTask">
      <!-- Activity View -->
      <ActivityView
        id="taskActivity"
        :task-id="selectedTask.id"
        :label="selectedTask.name"
        :log="selectedTask.log"
      />
    </template>
    <br>
  </div>
</template>

<script>
import Checkbox from './Checkbox'
import TaskTagList from './TaskTagList.vue'
import ActivityView from './ActivityView'
import TaskMenu from './TaskMenu.vue'
import { mapActions, mapGetters, mapState } from 'vuex'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import Timer from './Timer.vue'

marked.setOptions({
  breaks: true
})

const renderer = new marked.Renderer()
const linkRenderer = renderer.link
renderer.link = (href, title, text) => {
  const html = linkRenderer.call(renderer, href, title, text)
  return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ')
}
// add class to span tags
renderer.paragraph = (text) => {
  return `<p class="custom-p">${text}</p>`
}

export default {
  
  name: 'SelectedTask',
  
  components: {
    Timer,
    Checkbox,
    TaskTagList,
    ActivityView,
    TaskMenu
  },
  
  props: {
    heightClass: {
      type: String,
      default: 'full-height'
    }
  },
  
  data: () => ({
    possibleEdit: true,
    editingName: false,
    editingNotes: false,
    newTaskName: null
  }),
  
  computed: {
    
    ...mapState([
      'tasks',
      'tempState',
      'tagOrder',
      'selectedTaskID',
      'tags'
    ]),
    
    ...mapGetters([
      'selectedTask',
      'anyTasks'
    ]),

    isEmptyState () {
      return !this.anyTasks
    },
    
    checked () {
      return this.selectedTask && this.selectedTask.completed !== null
    },
    
    taskTags () {
      return this.selectedTask.tags
    },

    displayNotes () {
      return marked(DOMPurify.sanitize(this.selectedTask.notes), { renderer })
    }
    
  },
  
  watch: {
    selectedTaskID () {
      this.editingName = false
      this.editingNotes = false
      this.newTaskName = this.selectedTask ? this.selectedTask.name : null
    }
  },
  
  methods: {
    
    ...mapActions([
      'addTask',
      'updateTaskName',
      'updateTaskNotes',
      'startTask',
      'removeTaskTag'
    ]),
    
    editName () {
      if (this.possibleEdit) {
        this.newTaskName = this.selectedTask.name
        this.editingName = true
        this.$nextTick(() => this.$refs.taskNameInput.focus())
      }
      this.possibleEdit = true
    },
    
    async saveName () {
      if (!this.newTaskName || !this.newTaskName.trim().length) {
        this.editingName = false
        return
      }
      
      if (this.isEmptyState) {
        // Create new task
        await this.addTask({ name: this.newTaskName })
      } else {
        // Update existing task
        await this.updateTaskName({ taskId: this.selectedTask.id, name: this.newTaskName })
      }
      this.editingName = false
    },
    
    editNotes () {
      this.editingNotes = true
      this.$nextTick(() => {
        this.$refs.notesInput.focus()
        this.adjustTextareaHeight()
      })
    },
    
    handleNotesEnter (event) {
      if (event.shiftKey) {
        return // Allow the newline to occur
      }
      this.saveNotes()
    },
    
    async saveNotes () {
      await this.updateTaskNotes({ taskId: this.selectedTask.id, notes: this.selectedTask.notes })
      this.editingNotes = false
    },
    
    async continueTimerHere () {
      await this.startTask({ taskId: this.selectedTask.id })
    },
    
    adjustTextareaHeight (event) {
      const textarea = this.$refs.notesInput.$el
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto'
      // Set the height to match the content
      textarea.style.height = textarea.scrollHeight + 'px'
    }
  }
}
</script>

<style scoped lang="scss">
@import "../styles/_variables.scss";

$vertical-spacing: 30px;

#selected-task-container {
  flex: 1;
  
  > * {
    margin-bottom: $vertical-spacing;
  }
}

#title-section {
  .task-name {
    min-height: 50px;
    line-height: 50px;
    margin-left: 20px;
    margin-right: 20px;
    text-align: center;
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
  }
  
  #selected-task-menu {
    justify-content: space-evenly;
  }
}

#countdown-section {
  $play-btn-size: 75px;
  
  #play-btn {
    width: $play-btn-size;
    height: $play-btn-size;
    font-size: 28px;
    border-radius: $play-btn-size;
  }
}

#tags-and-notes-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  > div {
    width: 100%;
    max-width: 400px;
  }
  
  #notes-section {
    
    .notes-input-and-display {
      outline: none !important;
      box-shadow: none !important;
      border: 0;
      padding: 0;
      min-height: 48px;
      overflow-y: hidden; // Hide scrollbar when expanding
    }
    
    #display-notes {
      flex: 1;
      min-width: 0;
      overflow: visible;
      overflow-wrap: break-word;
    }
    margin-bottom: 10px;
  }
  
  #tags-section {
    
    #tags-label {
      padding-right: 15px;
      margin-top: 10px;
      margin-bottom: 0;
    }
  }
}

// New tag section plus button padding
#new-tag-section {
  padding-top: 4px;
}

</style>

<style>
.custom-p {
  margin-bottom: 0 !important;
}
</style>
