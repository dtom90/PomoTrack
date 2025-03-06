<template>
  <b-dropdown
    ref="dropdown"
    v-b-tooltip.hover.right="filterButtonTooltip"
    :disabled="Object.keys(tags).length === 0"
    dropright
    boundary="viewport"
    variant="light"
    :toggle-class="settings.selectedTagIds.length > 0 ? 'filter-btn-active' : ''"
    :style="filterBtnStyle"
    no-caret
  >
    <template #button-content>
      <font-awesome-icon icon="filter" />
    </template>
    
    <b-dropdown-header>
      <div class="d-flex justify-content-between">
        <div>Filter by Tag</div>
        <a
          :href="settings.selectedTagIds.length ? '#' : null"
          @click="clearAllTags"
        >Clear All</a>
      </div>
    </b-dropdown-header>

    <b-dropdown-divider />

    <b-dropdown-item
      v-for="tag in sortedTagList"
      :key="tag.id"
      :class="unselectedTags.includes(tag.id) ? '' : 'selected'"
      @click.native.stop="itemClicked(tag.id)"
    >
      <TagButton
        :tag="tag"
        :tag-id="tag.id"
        :unselected="unselectedTags.includes(tag.id)"
      />
    </b-dropdown-item>
  </b-dropdown>
</template>

<script>
import TagButton from './TagButton.vue'
import { mapGetters, mapState, mapActions } from 'vuex'

export default {
  name: 'TaskFilterDropdown',
  
  components: {
    TagButton
  },
  
  props: {
    taskTags: {
      type: Array,
      default: null
    }
  },
  
  computed: {
    ...mapGetters([
      'unselectedTags',
      'sortedTagList',
      'incompleteTasks',
      'completedTasksFiltered'
    ]),
    
    ...mapState([
      'tags',
      'tasks',
      'selectedTask',
      'settings'
    ]),
    
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
    }
  },
  
  watch: {
    addSelectedTags (newValue) {
      this.updateAddSelectedTags(newValue)
    }
  },
  
  methods: {
    ...mapActions([
      'addTagFilter',
      'removeTagFilter',
      'selectTask',
      'removeAllTagFilters'
    ]),

    itemClicked (tagId) {
      this.$refs.dropdown.show()
      this.toggleSelectedTag({ tagId })
    },
    
    async toggleSelectedTag ({ tagId }) {
      if (!this.settings.selectedTagIds.includes(tagId)) {
        await this.addTagFilter({ tagId })
      } else {
        await this.removeTagFilter({ tagId })
      }
      await this.updateSelectedTask()
    },
    
    updateSelectedTask () {
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
          this.selectTask({ taskId: tasksWithTag.id })
        } else {
          this.selectTask({ taskId: null })
        }
      }
    },
    
    updateAddSelectedTags (value) {
      this.updateSetting({ key: 'addSelectedTags', value })
    },

    clearAllTags () {
      this.removeAllTagFilters()
    }
  }
}
</script>

<style scoped>
.filter-btn-active > svg {
  color: white;
  -webkit-filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, .7));
  filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, .7));
}

.filter-btn-active:hover > svg {
  color: lightgrey;
}
</style>

<style>

</style>
