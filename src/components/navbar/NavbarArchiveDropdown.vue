<template>
  <b-nav-item-dropdown
    id="archive-dropdown"
    ref="dropdown"
    text="Archive"
    no-caret
    boundary="viewport"
    right
  >
    <div>
      <b-dropdown-header>
        Archived Tasks
      </b-dropdown-header>
      <b-dropdown-divider />
      <template v-if="archivedTasks.length">
        <b-dropdown-item
          v-for="task of archivedTasks"
          :key="task.id"
          @click.native.stop="onTaskClick"
        >
          <div class="d-flex">
            <div class="flex-1 d-flex align-items-center">
              <Checkbox
                :checked="task.completed !== null"
                :disabled="true"
              />
              <span class="ml-4 text-wrap">{{ task.name }}</span>
            </div>
            <div class="text-right">
              <div class="task-item-wrapper">
                <b-button
                  variant="light"
                  class="task-dropdown-item"
                  @click.stop="toggleSubmenu(task.id)"
                >
                  <font-awesome-icon icon="ellipsis-vertical" />
                </b-button>
                
                <!-- Submenu -->
                <div
                  class="task-submenu"
                  :class="{ 'active': activeSubmenu === task.id }"
                >
                  <b-dropdown-item @click="unarchiveTask(task.id)">
                    Restore
                  </b-dropdown-item>
                </div>
              </div>
            </div>
          </div>
        </b-dropdown-item>
      </template>
    
      <b-dropdown-item
        v-if="archivedTasks.length === 0"
        disabled
      >
        <div class="d-flex flex-column align-items-center justify-content-center">
          <div class="empty-archive-state d-flex flex-column align-items-center justify-content-center">
            <img
              src="/icons/empty-white-box.svg"
              alt="Empty Archive"
              class="mb-2"
            >
            <span class="text-muted">Archived Tasks will appear here</span>
          </div>
        </div>
      </b-dropdown-item>
    </div>
  </b-nav-item-dropdown>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Checkbox from '../Checkbox.vue'
export default {
  name: 'NavbarArchiveDropdown',
  
  components: { Checkbox },
  
  data () {
    return {
      activeSubmenu: null
    }
  },
  
  computed: {
    ...mapGetters([
      'archivedTasks'
    ])
  },
  
  methods: {
    ...mapActions([
      'archiveTask'
    ]),
    
    onTaskClick () {
      this.$refs.dropdown.show()
    },
    
    toggleSubmenu (taskId) {
      this.$refs.dropdown.show() // Keep dropdown open after submenu is toggled
      if (this.activeSubmenu === taskId) {
        this.activeSubmenu = null
      } else {
        this.activeSubmenu = taskId
      }
    },
    
    closeSubmenu () {
      this.activeSubmenu = null
    },
    
    unarchiveTask (taskId) {
      this.archiveTask({ taskId, archived: false })
      this.closeSubmenu()
    }
  }
}
</script>

<style scoped>
.task-item-wrapper {
  position: relative;
}

.task-submenu {
  position: absolute;
  top: 0;
  left: 100%;
  display: none;
  min-width: 10rem;
  padding: 4px;
  margin: 0;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.175);
  z-index: 1000;
  text-align: left;

  .dropdown-item {
    color: #37352F !important;
  }
}

.task-submenu.active {
  display: block;
}

.empty-archive-state {
  height: 220px;
  width: 180px;
}
</style>

<style>
#archive-dropdown {
  .dropdown-menu {
    width: 500px !important;
  }

  .dropdown-item {
    color: #37352F !important;
  }

  .text-wrap {
    color: #37352F !important;
  }
}
</style>
