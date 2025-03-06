<template>
  <div>
    <TagButton
      v-for="tagId in taskTags"
      :key="tagId"
      :tag="tags[tagId]"
      :tag-id="tagId"
      :mini="mini"
      :select-tag="selectTag"
      :remove-text="'Remove tag from task'"
      :remove-tag="mini ? null : removeTag"
      :class="mini ? 'tag-button-mini' : 'tag-button'"
    />
  </div>
</template>

<script>
import { mapGetters, mapState, mapMutations, mapActions } from 'vuex'
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
  },
  
  methods: {
    ...mapActions([
      'removeTaskTag'
    ]),
    
    ...mapMutations([
      'updateTempState'
    ]),
    
    selectTag ({ tagId }) {
      if (!this.mini) {
        this.updateTempState({ key: 'modalTagId', value: tagId })
        this.$root.$emit('bv::toggle::modal', 'activityModal')
      }
    },
    
    removeTag ({ tagId }) {
      this.removeTaskTag({ taskId: this.taskId, tagId })
      this.$forceUpdate()
    }
  }
}
</script>

<style scoped lang="scss">
.tag-button-mini {
  margin-right: 4px;
  margin-top: 4px;
}

.tag-button {
  margin-right: 8px;
  margin-top: 8px;
}
</style>
