<template>
  <div
    id="app"
  >
    <Navbar />
    
    <div
      id="main-section"
      class="d-flex"
    >
      <div
        v-if="!isNarrowScreen"
        id="incomplete-tasks-section"
        class="section task-list"
      >
        <TaskList title="To Do" />
      </div>
      <b-sidebar
        v-if="isNarrowScreen"
        id="sidebar-todo"
        shadow
      >
        <TaskList title="To Do" />
      </b-sidebar>

      <div
        id="selected-task-section"
        class="section"
      >
        <div
          id="sidebar-buttons"
          class="d-flex justify-content-between"
        >
          <b-button
            v-b-toggle.sidebar-todo
            variant="primary"
          >
            To Do
          </b-button>
          <b-button
            v-b-toggle.sidebar-done
            variant="primary"
          >
            Done
          </b-button>
        </div>
        <div id="main-task-container">
          <ActiveTask
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
      <b-sidebar
        v-if="isNarrowScreen"
        id="sidebar-done"
        shadow
      >
        <TaskList title="Done" />
      </b-sidebar>
    </div>
    
    <!-- Modals -->
    <AllActivityModal />
    
    <TagActivityModal />
    
    <TagModal />
    
    <DataModal />
  </div>
</template>

<script>
import Navbar from './Navbar'
import TaskList from './TaskList'
import ActiveTask from './ActiveTask'
import SelectedTask from './SelectedTask'
import { TagActivityModal, AllActivityModal, TagModal, DataModal } from './modals'

import { mapState } from 'vuex'
import $ from 'jquery'

$(document).on('click', '.dropdown-menu', function (e) {
  e.stopPropagation()
})

export default {
  
  name: 'App',
  
  components: {
    ActiveTask,
    Navbar,
    TaskList,
    SelectedTask,
    TagActivityModal,
    AllActivityModal,
    TagModal,
    DataModal
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
  
  beforeDestroy () {
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
@import "../styles/_variables.scss";

$horiz-spacing: 8px;

body {
  overscroll-behavior-y: none;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#main-section {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  font-size: 20px;
  margin-top: $main-section-margin-top;
  padding-left: $horiz-spacing;
  padding-right: $horiz-spacing;
  height: calc(100vh - #{$top-offset})
}

h3, h4, h5, h6 {
  text-align: center;
}

.section {
  margin-left: $horiz-spacing;
  margin-right: $horiz-spacing;
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
  top: $top-offset;
  height: 100%;
  z-index: 100 !important;
}

#sidebar-done {
  right: 0;
}

.top-margin {
  margin-top: 20px;
}
</style>
