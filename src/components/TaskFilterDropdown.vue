<template>
  <b-dropdown
    v-b-tooltip.hover.right="filterButtonTooltip"
    :disabled="Object.keys(tags).length === 0"
    dropright
    variant="light"
    :toggle-class="selectedTagIds.length > 0 ? 'filter-btn-active' : ''"
    :style="filterBtnStyle"
    no-caret
  >
    <template #button-content>
      <font-awesome-icon icon="filter" />
    </template>
    
    <div v-if="selectedTagIds.length > 0">
      <h6
        v-if="!taskTags"
        style="width: 100%"
        class="tag-label"
      >
        <span>Filtering on tasks with:</span>
      </h6>
      <TagList
        v-if="selectedTagIds.length > 0"
        :tag-list="selectedTagIds"
        :remove-tag="removeTag"
        :update-filter-operator="updateSelectedTask"
        remove-text="Clear Filter"
      />
    </div>
    <div
      v-if="selectedTagIds.length > 0"
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
      v-if="selectedTagIds.length > 0 && unselectedTags.length > 0"
      class="dropdown-divider"
    />
    <div v-if="unselectedTags.length > 0">
      <h6
        v-if="!taskTags"
        style="width: 100%"
        class="tag-label"
      >
        <span>{{ selectedTagIds.length > 0 ? 'Add to filter' : 'Filter on' }}:</span>
      </h6>
      <TagList
        id="filterTags"
        :tag-list="unselectedTags"
        :select-tag="selectTag"
      />
    </div>
  </b-dropdown>
</template>

<script>
import TagList from './TagList.vue'

export default {
  name: 'TaskFilterDropdown',
  
  components: {
    TagList
  },
  
  props: {
    tags: {
      type: Object,
      required: true
    },
    selectedTagIds: {
      type: Array,
      required: true
    },
    unselectedTags: {
      type: Array,
      required: true
    },
    addSelectedTags: {
      type: Boolean,
      required: true
    },
    taskTags: {
      type: Array,
      default: null
    },
    tasks: {
      type: Array,
      required: true
    }
  },
  
  computed: {
    filterBtnStyle () {
      return {
        '--filter-btn-background-color': this.selectedTagIds.length > 0 ? this.tags[this.selectedTagIds[0]].color : 'white'
      }
    },
    filterButtonTooltip () {
      if (this.tasks.length === 0) {
        return 'Add a task enable filtering'
      } else if (Object.keys(this.tags).length === 0) {
        return 'Add a tag to a task to enable filtering'
      }
      return 'Filter tasks'
    }
  },
  
  watch: {
    addSelectedTags (newValue) {
      this.updateAddSelectedTags(newValue)
    }
  },
  
  methods: {
    selectTag (tagId, e) {
      this.$emit('select-tag', tagId, e)
    },
    
    removeTag (tag) {
      this.$emit('remove-tag', tag)
    },
    
    updateSelectedTask () {
      this.$emit('update-selected-task')
    },
    
    updateAddSelectedTags (value) {
      this.$emit('update-add-selected-tags', value)
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
