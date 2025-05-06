<template>
  <div
    id="app"
  >
    <Navbar />

    <div
      id="main-section"
    >
      <div class="d-flex border h-100">
        <div
          v-if="!isNarrowScreen"
          id="incomplete-tasks-section"
          class="section task-list"
        >
          <TaskList title="To Do" />
        </div>

        <div
          id="selected-task-section"
          class="section border-start border-end"
        >
          <div
            id="sidebar-buttons"
            class="d-flex justify-content-between"
          >
          </div>
          <div id="main-task-container">
            <ActiveTaskButton
              v-if="showActive"
            />
            <SelectedTask
              :height-class="heightClass"
            />
          </div>
        </div>

        <div
          v-if="!isNarrowScreen"
          id="completed-tasks-section"
          class="section task-list"
        >
          <TaskList title="Done" />
        </div>
      </div>

      <div id="footer" v-if="isNarrowScreen">
        <div class="d-flex justify-content-evenly">
          <BButton
            v-b-toggle.sidebar-todo
            variant="light"
          >
            To Do
          </BButton>
          <BButton
            v-b-toggle.sidebar-done
            variant="light"
          >
            Done
          </BButton>
        </div>

        <BOffcanvas
          id="sidebar-todo"
          shadow
        >
          <TaskList title="To Do" />
        </BOffcanvas>
        <BOffcanvas
          id="sidebar-done"
          shadow
          placement="end"
        >
          <TaskList title="Done" />
        </BOffcanvas>
      </div>
    </div>

    <!-- Modals -->
    <ActivityModal />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import Navbar from './navbar/Navbar.vue'
import TaskList from './TaskList.vue'
import ActiveTaskButton from './ActiveTaskButton.vue'
import SelectedTask from './SelectedTask.vue'
import ActivityModal from './ActivityModal.vue'
import type { Settings, TempState } from '@/types'

// Store access
const store = useStore()
const settings = computed<Settings>(() => store.state.settings)
const tempState = computed<TempState>(() => store.state.tempState)

// Local reactive state
const windowWidth = ref(window.innerWidth)

// Computed properties
const showActive = computed(() => {
  return tempState.value.activeTaskID && (settings.value.selectedTaskID !== tempState.value.activeTaskID)
})

const heightClass = computed(() => {
  return (showActive.value ? 'partial' : 'full') + '-height'
})

const isNarrowScreen = computed(() => {
  return windowWidth.value < 768
})

// Methods
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss">
@use "../styles/_variables.scss";

$horiz-spacing: 24px;

body {
  overscroll-behavior-y: none;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: variables.$dark-primary;
}

#main-section {
  font-size: variables.$font-size-base;
  height: calc(100vh - #{variables.$top-offset})
}

h3, h4, h5, h6 {
  text-align: center;
}

.section {
  padding: $horiz-spacing;
  overflow-y: auto;
}

#selected-task-section {
  flex: 2;
  min-width: 0;
}

#main-task-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.modal-dialog {
  margin-top: 56px !important;
}

.modal-title {
  display: flex;
  flex: 1;
  justify-content: center;
}

@media (min-width: 768px) {
  #sidebar-buttons {
    display: none !important;
  }

  .task-list {
    flex: 1;
  }
}

.b-sidebar {
  display: block;
  position: absolute;
  top: variables.$top-offset;
  height: 100%;
  z-index: 100 !important;
}

#sidebar-done {
  right: 0;
}

#footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #f8f9fa;
  padding: 10px 0;
  border-top: 1px solid #dee2e6;
  z-index: 1000;
}

@media (max-width: 767px) {
  #main-section {
    padding-bottom: 60px;
  }
}
</style>
