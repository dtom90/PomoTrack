<template>
  <div
    id="app"
  >
    <Navbar />

    <div
      id="main-section"
      class="d-flex border"
    >
      <div
        v-if="!isNarrowScreen"
        id="incomplete-tasks-section"
        class="section task-list"
      >
        <TaskList title="To Do" />
      </div>
<!--      <BOffcanvas-->
<!--        v-if="isNarrowScreen"-->
<!--        id="sidebar-todo"-->
<!--        shadow-->
<!--      >-->
<!--        <TaskList title="To Do" />-->
<!--      </BOffcanvas>-->

      <div
        id="selected-task-section"
        class="section border-left border-right"
      >
        <div
          id="sidebar-buttons"
          class="d-flex justify-content-between"
        >
<!--          <b-button-->
<!--            v-b-toggle.sidebar-todo-->
<!--            variant="primary"-->
<!--          >-->
<!--            To Do-->
<!--          </b-button>-->
<!--          <b-button-->
<!--            v-b-toggle.sidebar-done-->
<!--            variant="primary"-->
<!--          >-->
<!--            Done-->
<!--          </b-button>-->
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
<!--      <BOffcanvas-->
<!--        v-if="isNarrowScreen"-->
<!--        id="sidebar-done"-->
<!--        shadow-->
<!--      >-->
<!--        <TaskList title="Done" />-->
<!--      </BOffcanvas>-->
    </div>

    <!-- Modals -->
    <ActivityModal />
  </div>
</template>

<script>
import Navbar from './navbar/Navbar.vue'
import TaskList from './TaskList.vue'
import ActiveTaskButtonButton from './ActiveTaskButton.vue'
import SelectedTask from './SelectedTask.vue'
import ActivityModal from './ActivityModal.vue'

import { mapState } from 'vuex'
import $ from 'jquery'

$(document).on('click', '.dropdown-menu', function (e) {
  e.stopPropagation()
})

export default {

  name: 'App',

  components: {
    ActiveTaskButton: ActiveTaskButtonButton,
    Navbar,
    TaskList,
    SelectedTask,
    ActivityModal
  },

  data () {
    return {
      windowWidth: window.innerWidth
    }
  },

  computed: {

    ...mapState([
      'tempState',
      'settings'
    ]),

    showActive () {
      return this.tempState.activeTaskID && (this.settings.selectedTaskID !== this.tempState.activeTaskID)
    },

    heightClass () {
      return (this.showActive ? 'partial' : 'full') + '-height'
    },

    isNarrowScreen () {
      return this.windowWidth < 768
    }
  },
  mounted () {
    window.addEventListener('resize', this.handleResize)
  },

  beforeUnmount () {
    window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    handleResize () {
      this.windowWidth = window.innerWidth
    }
  }
}
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
</style>
