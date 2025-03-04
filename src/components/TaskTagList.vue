<template>
  <div>
    <!--  spacing for consistent spacing  -->
    <div
      v-if="!taskTags.length"
      style="height: 30px"
    />
    <TagButton
      v-for="tagId in taskTags"
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
import { mapGetters, mapState } from 'vuex'
import TagButton from './TagButton.vue'

export default {
  name: 'TaskTagList',
  components: {
    TagButton
  },
  props: {
    taskId: {
      type: String,
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
    mini: {
      type: Boolean,
      default: false
    }
  },
  
  computed: {
    ...mapState([
      'tags',
      'tagOrder',
      'tasks'
    ]),
    
    ...mapGetters([
      'availableTags',
      'getTaskById'
    ]),
    
    taskTags () {
      if (!this.taskId) return []
      const task = this.getTaskById(this.taskId)
      if (!task) return []
      return task.tags.slice().sort((a, b) => this.tagOrder.indexOf(a) - this.tagOrder.indexOf(b))
    }
  }
}
</script>

<style scoped lang="scss">

</style>