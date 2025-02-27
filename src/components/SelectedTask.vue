<template>
  <div
    v-show="selectedTask"
    id="selected-task-container"
    class="border"
  >
    <template v-if="selectedTask">
      <!--  Title Section  -->
      <div
        id="title-section"
        class="d-flex justify-content-between"
      >
        <!--  Checkbox  -->
        <div>
          <Checkbox
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
            <b-badge
              v-if="selectedTask.archived"
              class="archive-badge"
            >
              Archived&nbsp;
            </b-badge>
            <span>{{ selectedTask.name }}</span>
          </div>
          
          <!--  Task Field (when editing)  -->
          <b-input-group
            v-if="editingName"
            class="input-group flex-grow-1"
            @submit.prevent="saveName()"
          >
            <b-form-input
              id="task-name-input"
              ref="taskNameInput"
              v-model="newTaskName"
              placeholder="enter task name"
              class="task-name"
              @keyup.enter="saveName()"
              @blur="saveName()"
            />
          </b-input-group>
        </div>
        
        <!-- Menu Options -->
        <div
          ref="taskMenu"
          class="dropdown"
        >
          <button
            class="btn btn-light"
            title="Task options"
            data-toggle="dropdown"
          >
            <font-awesome-icon icon="ellipsis-vertical" />
          </button>
          <div class="dropdown-menu dropdown-menu-right">
            <div
              id="selected-task-menu"
            >
              <b-button
                block
                variant="archive-color"
                title="Archive task"
                @click="archiveTask({taskId: selectedTask.id})"
              >
                <span v-if="!selectedTask.archived">
                  <font-awesome-icon icon="download" />
                  <span>&nbsp;&nbsp;Archive</span>
                </span>
                <span v-if="selectedTask.archived">
                  <font-awesome-icon icon="upload" />
                  <span>&nbsp;&nbsp;Unarchive</span>
                </span>
              </b-button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Tags Section -->
      <TagList
        :tag-list="taskTags"
        :task-id="selectedTask.id"
        :remove-tag="removeTag"
      />
      
      <!-- Notes Section -->
      <div
        id="notes-section"
        class="d-flex align-items-center"
        style="max-width: 100%"
      >
        <span id="notes-label">Notes: </span>
        
        <!-- Display Mode -->
        <!-- eslint-disable vue/no-v-html -->
        <span
          v-if="!editingNotes"
          id="display-notes"
          @click="editNotes"
          v-html="displayNotes"
        />
        <!-- eslint-enable vue/no-v-html -->
        
        <!-- Editing Mode -->
        <b-input-group
          v-if="editingNotes"
        >
          <b-form-textarea
            ref="notesInput"
            v-model="selectedTask.notes"
            placeholder="enter notes"
            :rows="selectedTask.notes.split('\n').length"
            @blur="saveNotes"
            @keydown.enter="handleNotesEnter"
          />
        </b-input-group>
      </div>
    </template>
    
    <!-- Countdown Timer -->
    <div>
      <div v-show="selectedTask && !selectedTask.completed && (!tempState.running || !tempState.activeTaskID || tempState.activeTaskID === selectedTask.id)">
        <Countdown
          :task-id="tempState.activeTaskID || (selectedTask && selectedTask.id)"
          class="top-margin"
        />
      </div>
    </div>
    
    <template v-if="selectedTask">
      <!-- Continue Timer Here -->
      <div
        v-if="!selectedTask.completed && (tempState.running && tempState.activeTaskID && tempState.activeTaskID !== selectedTask.id)"
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
      
      <!-- Activity View -->
      <ActivityView
        id="taskActivity"
        class="border-top top-margin"
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
import TagList from './TagList'
import ActivityView from './ActivityView'
import { mapActions, mapGetters, mapState } from 'vuex'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import Countdown from './Countdown.vue'

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
    Countdown,
    Checkbox,
    TagList,
    ActivityView
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
    newTaskName: null,
    newTag: '',
    tagOptions: [],
    showTagInput: false
  }),
  
  computed: {
    
    ...mapState([
      'tasks',
      'tempState',
      'tagOrder',
      'selectedTaskID'
    ]),
    
    ...mapGetters([
      'selectedTask'
    ]),
    
    checked () {
      return this.selectedTask.completed !== null
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
      'updateTaskName',
      'updateTaskNotes',
      'startTask',
      'archiveTask',
      'removeTaskTag'
    ]),
    
    editName () {
      if (this.possibleEdit) {
        this.newTaskName = this.selectedTask.name
        this.editingName = true
        this.$refs.taskMenu.classList.remove('show')
        this.$refs.taskMenu.querySelector('button[data-toggle="dropdown"]').setAttribute('aria-expanded', 'false')
        this.$refs.taskMenu.querySelector('.dropdown-menu').classList.remove('show')
        this.$nextTick(() => this.$refs.taskNameInput.focus())
      }
      this.possibleEdit = true
    },
    
    async saveName () {
      if (this.newTaskName.trim().length) {
        await this.updateTaskName({ taskId: this.selectedTask.id, name: this.newTaskName })
      }
      this.editingName = false
    },
    
    addTagButton () {
      this.showTagInput = !this.showTagInput
      if (this.showTagInput) {
        this.$nextTick(() => {
          this.$refs.addTagInput.focus()
        })
      }
    },
    
    removeTag ({ tagId }) {
      this.removeTaskTag({ taskId: this.selectedTask.id, tagId })
      this.$forceUpdate()
    },
    
    editNotes () {
      this.editingNotes = true
      this.$nextTick(() => {
        this.$refs.notesInput.focus()
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
    }
  }
}
</script>

<style scoped lang="scss">
@import "../styles/_variables.scss";

#selected-task-container {
  overflow-y: auto;
  border-radius: 0.25rem;
  flex: 1;
}

#title-section {
  margin: 20px;
}

#checkbox-name-section {
  margin-left: 20px;
  flex: 1;
}

#task-name-container {
  margin: 8px;
}

.task-name {
  font-weight: $large-font-weight;
  font-size: $large-font-size;
  text-align: center;
}

#selected-task-menu {
  justify-content: space-evenly;
}

#notes-section {
  padding: 15px 10px 10px;
}

#notes-label {
  padding-right: 15px;
}

#display-notes {
  padding: 10px;
  border: #e2e6ea 1px solid;
  border-radius: 5px;
  font-size: 16px;
  flex: 1;
  min-width: 0;
  min-height: 38px;
  overflow: visible;
  overflow-wrap: break-word;
}

.dropdown-menu {

  .selected-task-menu {
    margin: 8px;
  }
}

$play-btn-size: 75px;

#play-btn {
  width: $play-btn-size;
  height: $play-btn-size;
  font-size: 28px;
  border-radius: $play-btn-size;
}

.top-margin {
  margin-top: 20px;
}
</style>

<style>
.custom-p {
  margin-bottom: 0 !important;
}
</style>
