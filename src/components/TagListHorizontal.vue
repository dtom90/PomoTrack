<template>
  <div>
    <!--  spacing for consistent spacing  -->
    <div
      v-if="!sortedTagList.length"
      style="height: 30px"
    />
    <TagButton
      v-for="tagId in sortedTagList"
      :key="tagId"
      :tag="tags[tagId]"
      :tag-id="tagId"
      :mini="mini"
      :remove-tag-button="!mini"
      :remove-text="removeText"
      :remove-tag="removeTag"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import TagButton from './TagButton.vue'

export default {
  name: 'TagListHorizontal',
  components: {
    TagButton
  },
  props: {
    tagList: {
      type: Array,
      default: () => []
    },
    taskId: {
      type: String,
      default: null
    },
    label: {
      type: String,
      default: 'Tags'
    },
    selectText: {
      type: String,
      default: 'View tag activity'
    },
    selectTag: {
      type: Function,
      default: null
    },
    removeText: {
      type: String,
      default: 'Remove tag from task'
    },
    removeTag: {
      type: Function,
      default: null
    },
    updateFilterOperator: {
      type: Function,
      default: null
    },
    mini: {
      type: Boolean,
      default: false
    }
  },
  
  data: () => ({
    editing: false,
    inputTagName: '',
    tagOptions: [],
    showTagInput: false
  }),
  
  computed: {
    
    ...mapState([
      'tags',
      'tagOrder',
      'settings'
    ]),
    
    ...mapGetters([
      'availableTags'
    ]),
    
    taskTags () {
      return this.taskId != null
    },
    
    sortedTagList () {
      return this.tagList.slice().sort((a, b) => this.tagOrder.indexOf(a) - this.tagOrder.indexOf(b))
    },
    
    filterOperator: {
      get () {
        return this.$store.state.settings.filterOperator
      },
      async set (value) {
        await this.updateSetting({ key: 'filterOperator', value })
        if (this.updateFilterOperator) {
          this.updateFilterOperator()
        }
      }
    }
  },
  
  methods: {
    
    ...mapActions([
      'addTaskTagById',
      'addTaskTagByName',
      'updateSetting'
    ]),
    
    ...mapMutations([
      'updateTempState'
    ]),
    
    addTagButton: function () {
      this.showTagInput = !this.showTagInput
      if (this.showTagInput) {
        this.$nextTick(() => {
          this.$refs.addTagInput.focus()
        })
      }
    },
    
    tagInputChange: function () {
      this.tagOptions = this.availableTags(this.taskId, this.inputTagName)
    },
    
    addTag: function ({ tagId, tagName }) {
      if (tagId != null) {
        this.addTaskTagById({ taskId: this.taskId, tagId })
      } else if (tagName != null && tagName.length) {
        this.addTaskTagByName({ taskId: this.taskId, tagName })
      }
      this.inputTagName = ''
      this.tagInputChange()
      this.tagOptions = this.availableTags(this.taskId, this.inputTagName)
      this.$refs.addTagInput.focus()
    },
    
    clickOutside: function (event) {
      if (!(event.relatedTarget && event.relatedTarget.classList &&
        event.relatedTarget.classList.contains('tag-option'))) {
        this.tagOptions = []
        if (!(event.relatedTarget && event.relatedTarget.id === 'addTagButton')) {
          this.showTagInput = false
        }
      }
    }
    
  }
}
</script>

<style scoped lang="scss">

</style>
