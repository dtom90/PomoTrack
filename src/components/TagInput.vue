<template>
  <b-dropdown
    ref="dropdown"
    :disabled="false"
    toggle-class="btn-light"
    boundary="viewport"
    no-caret
    dropright
    @show="resetInput"
  >
    <template #button-content>
      <font-awesome-icon icon="plus" />
    </template>

    <b-form-input
      id="addTagInput"
      ref="addTagInput"
      v-model="inputTagName"
      type="text"
      class="mb-2 w-100"
      placeholder="add new tag"
      @input="tagInputChange"
      @keyup.enter="addTagByName"
    />
    
    <b-dropdown-item
      v-for="tag in filteredTags"
      :key="tag.id"
      @click="addTagById(tag.id)"
    >
      <TagButton
        :tag="tag"
        :tag-id="tag.id"
      />
    </b-dropdown-item>
  </b-dropdown>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import TagButton from './TagButton.vue'

export default {
  name: 'TagInput',

  components: {
    TagButton
  },

  props: {
    taskId: {
      type: String,
      required: true
    }
  },
  
  data: () => ({
    inputTagName: '',
    filteredTags: []
  }),
  
  computed: {
    ...mapGetters([
      'availableTags'
    ])
  },
  
  methods: {
    ...mapActions([
      'addTaskTagById',
      'addTaskTagByName'
    ]),
    
    tagInputChange () {
      this.filteredTags = this.availableTags(this.taskId, this.inputTagName)
    },
    
    addTagById (tagId) {
      this.addTaskTagById({ taskId: this.taskId, tagId })
      this.resetInput()
    },
    
    addTagByName () {
      if (this.inputTagName && this.inputTagName.length) {
        this.addTaskTagByName({ taskId: this.taskId, tagName: this.inputTagName })
        this.resetInput()
      }
    },
    
    resetInput () {
      this.inputTagName = ''
      this.tagInputChange()
      this.$nextTick(() => {
        this.$refs.addTagInput.focus()
      })
    }
  }
}
</script>

<style scoped>

</style>
