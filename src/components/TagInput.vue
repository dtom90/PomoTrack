<template>
  <BDropdown
    id="tagInputDropdown"
    ref="dropdown"
    class="mt-8"
    toggle-class="mt-8 btn-light"
    boundary="viewport"
    no-caret
    placement="right-start"
    @shown="resetInput"
  >
    <template #button-content>
      <font-awesome-icon icon="plus" />
    </template>

    <BFormInput
      id="addTagInput"
      ref="addTagInput"
      v-model="inputTagName"
      type="text"
      class="mb-2 w-100"
      placeholder="add new tag"
      @input="updateTagOptions"
      @keyup.enter="addTagByName"
    />

    <BDropdownItem
      v-for="tag in filteredTags"
      :key="tag.id"
      @click="addTagById(tag.id)"
    >
      <TagButton
        :tag="tag"
        :tag-id="tag.id"
      />
    </BDropdownItem>
  </BDropdown>
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

    updateTagOptions () {
      this.filteredTags = this.availableTags(this.taskId, this.inputTagName)
    },

    async addTagById (tagId) {
      await this.addTaskTagById({ taskId: this.taskId, tagId })
      this.resetInput()
    },

    async addTagByName () {
      if (this.inputTagName && this.inputTagName.length) {
        await this.addTaskTagByName({ taskId: this.taskId, tagName: this.inputTagName })
        this.$refs.dropdown.hide()
        this.resetInput()
      }
    },

    resetInput () {
      this.inputTagName = ''
      this.updateTagOptions()
      this.$refs.addTagInput.focus()
      this.$refs.dropdown.show()
    }
  }
}
</script>

<style>
.add-tag-btn {
  margin-top: 8px;
}

.dropend {
  margin-top: 8px;
}
</style>
