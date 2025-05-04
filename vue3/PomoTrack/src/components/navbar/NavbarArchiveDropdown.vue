<template>
  <b-nav-item-dropdown
    id="archive-dropdown"
    ref="dropdown"
    text="Archive"
    no-caret
    boundary="viewport"
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
          @click.stop="onTaskClick"
        >
          <div class="d-flex">
            <div class="flex-1 d-flex align-items-center">
              <CompleteStatus :completed="task.completed !== null" />
              <span class="ms-4 text-wrap">{{ task.name }}</span>
            </div>
            <div class="text-right">
              <div class="submenu-button-wrapper">
                <b-button
                  variant="light"
                  class="task-dropdown-item"
                  @click.stop="toggleSubmenu(task.id)"
                >
                  <font-awesome-icon icon="ellipsis-vertical" />
                </b-button>

                <!-- Submenu -->
                <div
                  class="submenu task-submenu"
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
              src="@/assets/icons/empty-white-box.svg"
              alt="Empty Archive"
              class="mb-2"
            >
            <span class="text-muted">Archived tasks will appear here</span>
          </div>
        </div>
      </b-dropdown-item>
    </div>
  </b-nav-item-dropdown>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import CompleteStatus from '@/components/CompleteStatus.vue'

export default {
  name: 'NavbarArchiveDropdown',

  components: { CompleteStatus },

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
.task-submenu {
  min-width: 10rem;
  text-align: left;
}

.empty-archive-state {
  height: 220px;
  width: 180px;
}
</style>

<style>
/*noinspection CssUnusedSymbol*/
#archive-dropdown-menu {
  width: 500px !important;
}

.dropdown-header {
  text-align: left;
}
</style>
