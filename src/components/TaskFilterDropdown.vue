<template>
  <b-dropdown
    v-b-tooltip.hover.right="filterButtonTooltip"
    :disabled="Object.keys(tags).length === 0"
    dropright
    boundary="viewport"
    variant="light"
    :toggle-class="selectedTagIds.length > 0 ? 'filter-btn-active' : ''"
    :style="filterBtnStyle"
    no-caret
  >
    <template #button-content>
      <font-awesome-icon icon="filter" />
    </template>
    
    <b-dropdown-item
      v-for="tag in sortedTagList"
      :key="tag.id"
    >
      <TagButton
        :tag="tag"
        :tag-id="tag.id"
        :select-tag="selectTag"
        :unselected="unselectedTags.includes(tag.id)"
      />
    </b-dropdown-item>
  </b-dropdown>
</template>

<script>
import TagButton from './TagButton.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'TaskFilterDropdown',
  
  components: {
    TagButton,
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
    ...mapGetters([
      'sortedTagList'
    ]),
    
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
