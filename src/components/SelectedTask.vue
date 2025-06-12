<template>
  <div
    id="selected-task-container"
  >
    <div>
      <!--  Title Section  -->
      <div
        id="title-section"
        class="d-flex justify-content-between align-items-center"
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
            :checked="!!selectedTask?.completed"
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
          <BInputGroup
            v-if="editingName || isEmptyState"
            class="input-group flex-grow-1"
            @submit.prevent="saveName()"
          >
            <BFormInput
              id="task-name-input"
              ref="taskNameInput"
              v-model="newTaskName"
              placeholder="Enter new task.."
              class="task-name border-0"
              @keyup.enter="saveName()"
              @blur="saveName()"
            />
          </BInputGroup>
        </div>

        <!-- Menu Options -->
        <TaskMenu
          v-if="selectedTask || isEmptyState"
          :task-id="selectedTask && selectedTask.id"
          :is-archived="selectedTask?.archived"
        />
      </div>
    </div>

    <div>
      <!-- Countdown Timer -->
      <div id="countdown-section">
        <div v-show="isEmptyState || (selectedTask && !selectedTask.completed && (!tempState.running || !tempState.activeTaskID || tempState.activeTaskID === selectedTask.id))">
          <Timer
            :task-id="tempState.activeTaskID ?? selectedTask?.id"
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
            @click="editNotesLocal"
            v-html="displayNotes"
          />
          <!-- eslint-enable vue/no-v-html -->

          <!-- Editing Mode -->
          <BInputGroup
            v-if="editingNotes || (selectedTask && !selectedTask.notes)"
          >
            <b-form-textarea
              ref="notesInput"
              v-model="selectedTask.notes"
              placeholder="Enter notes here.."
              class="notes-input-and-display"
              no-resize
              @click="editNotesLocal"
              @blur="saveNotes"
              @keydown.enter="handleNotesEnter"
              @input="adjustTextareaHeight"
            />
          </BInputGroup>
        </div>

        <!-- Tags Section -->
        <div
          id="tags-section"
          class="d-flex align-items-top"
        >
          <label id="tags-label">
            <span>Tags:</span>
          </label>
          <TaskTagList :task-id="selectedTask.id" />
        </div>
      </div>
    </div>

    <div v-if="selectedTask">
      <!-- Activity View -->
      <ActivityView
        id="taskActivity"
        :task-id="selectedTask.id"
        :label="selectedTask.name"
        :log="selectedTaskLogs"
      />
    </div>
    <br>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useStore } from 'vuex'
import Checkbox from './Checkbox.vue'
import TaskTagList from './TaskTagList.vue'
import ActivityView from './ActivityView.vue'
import TaskMenu from './TaskMenu.vue'
import Timer from './Timer.vue'
import { marked, type Tokens } from 'marked'
import DOMPurify from 'dompurify'
import type { BFormInput, BFormTextarea } from 'bootstrap-vue-next'
import type { Task, TempState, ModalActivityItem } from '@/types' // Assuming central types

// Marked and DOMPurify setup
marked.setOptions({
  breaks: true
})

const renderer = new marked.Renderer()
// TODO: fix link renderer
// const linkRenderer = renderer.link;
// renderer.link = ({ href, title, tokens }: Tokens.Link) => {
//   const text = new Parser().parse(tokens).trim();
//   const html = linkRenderer.call(renderer, href, title || '', text);
//   return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ')
// }

renderer.paragraph = (token: Tokens.Paragraph) => {
  return `<p class="custom-p">${token.raw}</p>`;
};

interface Props {
  heightClass?: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<Props>(), {
  heightClass: 'full-height'
})

const store = useStore()

// Template refs
const taskNameInput = ref<InstanceType<typeof BFormInput> | null>(null)
const notesInput = ref<InstanceType<typeof BFormTextarea> | null>(null)

// Data properties converted to refs
const possibleEdit = ref(true)
const editingName = ref(false)
const editingNotes = ref(false)
const newTaskName = ref<string | null>(null)

// Vuex State
const tempState = computed<TempState>(() => store.state.tempState)
const selectedTaskID = computed<string | null>(() => store.state.selectedTaskID)
const selectedTaskLogs = computed<ModalActivityItem[]>(() => store.state.selectedTaskLogs)

// Vuex Getters
const selectedTask = computed<Task | null>(() => store.getters.selectedTask)
const anyTasks = computed<boolean>(() => store.getters.anyTasks)

// Computed properties
const isEmptyState = computed(() => !anyTasks.value)

const displayNotes = computed(() => {
  if (selectedTask.value && selectedTask.value.notes) {
    const sanitizedNotes = DOMPurify.sanitize(selectedTask.value.notes)
    return marked(sanitizedNotes, { renderer })
  }
  return ''
})

// Watchers
watch(selectedTaskID, () => {
  editingName.value = false
  editingNotes.value = false
  newTaskName.value = selectedTask.value ? selectedTask.value.name : null
})

// Methods
const addTask = (payload: { name: string }) => store.dispatch('addTask', payload)
const updateTaskName = (payload: { taskId: string; name: string }) => store.dispatch('updateTaskName', payload)
const updateTaskNotes = (payload: { taskId: string; notes: string | null }) => store.dispatch('updateTaskNotes', payload)
const startTask = (payload: { taskId: string }) => store.dispatch('startTask', payload)

const editName = () => {
  if (possibleEdit.value && selectedTask.value) {
    newTaskName.value = selectedTask.value.name
    editingName.value = true
    nextTick(() => taskNameInput.value?.focus())
  }
  possibleEdit.value = true
}

const saveName = async () => {
  if (!newTaskName.value || !newTaskName.value.trim().length) {
    editingName.value = false
    return
  }

  if (isEmptyState.value) {
    await addTask({ name: newTaskName.value })
  } else if (selectedTask.value) {
    await updateTaskName({ taskId: selectedTask.value.id, name: newTaskName.value })
  }
  editingName.value = false
}

const editNotesLocal = () => {
  editingNotes.value = true
  nextTick(() => {
    notesInput.value?.focus()
    adjustTextareaHeight()
  })
}

const handleNotesEnter = (event: KeyboardEvent) => {
  if (event.shiftKey) {
    return
  }
  saveNotes()
}

const saveNotes = async () => {
  if (selectedTask.value) {
    await updateTaskNotes({ taskId: selectedTask.value.id, notes: selectedTask.value.notes })
  }
  editingNotes.value = false
}

const continueTimerHere = async () => {
  if (selectedTask.value) {
    await startTask({ taskId: selectedTask.value.id })
  }
}

const adjustTextareaHeight = () => {
  if (notesInput.value && notesInput.value.$el) {
    const textarea = notesInput.value.$el as HTMLTextAreaElement
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
  }
}

// Ensure initial newTaskName is set if selectedTask exists on mount
if (selectedTask.value) {
  newTaskName.value = selectedTask.value.name
}
</script>

<style scoped lang="scss">
@use "../styles/_variables.scss";

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
    font-size: variables.$font-size-xl;
    font-weight: variables.$font-weight-bold;
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
