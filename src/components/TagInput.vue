<template>
  <div class="btn-group">
    <div class="d-flex">
      <button
        id="addTagButton"
        class="btn btn-light"
        :title="showTagInput ? 'Cancel' : 'Add new tag'"
        @click="toggleTagInput"
      >
        <font-awesome-icon
          v-if="!showTagInput"
          icon="plus"
        />
        <font-awesome-icon
          v-if="showTagInput"
          icon="times"
        />
      </button>
      <div
        v-if="showTagInput"
        id="tagDropdown"
      >
        <div
          id="tagDropdownMenu"
          class="btn-group-vertical"
        >
          <button
            v-for="tag in availableTags"
            :key="tag.id"
            class="tag-option btn btn-light"
            :style="`backgroundColor: ${tag.color}`"
            @click="addTagById(tag.id)"
          >
            {{ tag.tagName }}
          </button>
        </div>
      </div>
      <input
        v-if="showTagInput"
        id="addTagInput"
        ref="addTagInput"
        v-model="inputTagName"
        type="text"
        class="form-control"
        placeholder="add new tag"
        @input="tagInputChange"
        @focus="tagInputChange"
        @blur="clickOutside"
        @keyup.enter="addTagByName"
      >
    </div>
  </div>
</template>

<script>
export default {
  name: 'TagInput',
  
  props: {
    taskId: {
      type: String,
      required: true
    },
    getAvailableTags: {
      type: Function,
      required: true
    }
  },
  
  data: () => ({
    showTagInput: false,
    inputTagName: '',
    availableTags: []
  }),
  
  methods: {
    toggleTagInput() {
      this.showTagInput = !this.showTagInput
      if (this.showTagInput) {
        this.$nextTick(() => {
          this.$refs.addTagInput.focus()
        })
      }
    },
    
    tagInputChange() {
      this.availableTags = this.getAvailableTags(this.taskId, this.inputTagName)
    },
    
    addTagById(tagId) {
      this.$emit('add-tag', { taskId: this.taskId, tagId })
      this.resetInput()
    },
    
    addTagByName() {
      if (this.inputTagName && this.inputTagName.length) {
        this.$emit('add-tag', { taskId: this.taskId, tagName: this.inputTagName })
        this.resetInput()
      }
    },
    
    resetInput() {
      this.inputTagName = ''
      this.tagInputChange()
      this.$refs.addTagInput.focus()
    },
    
    clickOutside(event) {
      if (!(event.relatedTarget && event.relatedTarget.classList &&
        event.relatedTarget.classList.contains('tag-option'))) {
        this.availableTags = []
        if (!(event.relatedTarget && event.relatedTarget.id === 'addTagButton')) {
          this.showTagInput = false
        }
      }
    }
  }
}
</script>

<style scoped>
#addTagInput {
  max-width: 160px;
}

#tagDropdown {
  position: relative;
}

#tagDropdownMenu {
  position: absolute;
  top: 48px;
  z-index: 4;
  width: 160px;
}

.tag-option {
  color: white;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.4),
  0 0 13px rgba(0, 0, 0, 0.1),
  0 0 23px rgba(0, 0, 0, 0.1);
  word-break: break-word;
}

.tag-option:hover {
  color: lightgrey;
}

#addTagButton {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 