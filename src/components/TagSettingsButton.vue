<template>
  <b-dropdown
    v-if="tag"
    ref="dropdown"
    toggle-class="tag-button"
    :text="tag.tagName"
    dropright
    @show="handleDropdownShow"
  >
    <b-dropdown-form @submit.prevent="updateTagSubmit">
      <b-input-group>
        <b-form-input
          id="tag-name-input"
          ref="tagNameInput"
          v-model="newTagName"
          title="Rename tag"
          :style="`backgroundColor: ${newTagColor}`"
        />
        <b-input-group-append>
          <b-button
            variant="primary"
            @click="updateTagSubmit"
          >
            <font-awesome-icon icon="save" />
          </b-button>
        </b-input-group-append>
      </b-input-group>
    </b-dropdown-form>
    <div class="dropdown-divider" />
    <sketch-picker
      v-model="newTagColor"
      @input="newTagColor = $event.hex"
    />
    <div class="dropdown-divider" />
    <button
      id="delete-tag-btn"
      type="button"
      class="btn btn-danger"
      title="Delete tag"
      @click="deleteTag({ tagId })"
    >
      <font-awesome-icon icon="trash-can" />&nbsp;&nbsp;Delete Tag
    </button>
  </b-dropdown>
</template>

<script>
import Sketch from 'vue-color/src/components/Sketch'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'TagSettingsButton',
  
  components: {
    'sketch-picker': Sketch
  },
  
  props: {
    tagId: {
      type: String,
      default: null
    }
  },
  
  data: () => ({
    newTagColor: '#FFFFFF',
    newTagName: ''
  }),
  
  computed: {
    ...mapState([
      'tags'
    ]),
    tag: function () {
      return this.tags[this.tagId]
    }
  },
  
  mounted () {
    if (this.tag) {
      this.$el.querySelector('.dropdown-toggle').style.setProperty('background-color', this.tag.color)
    }
    // Prevent clicking within the dropdown from dragging the tag button
    this.$el.querySelector('.dropdown-menu').addEventListener('mousedown', (event) => {
      event.preventDefault()
    })
    // override the above event listener for the tag name input
    this.$refs.tagNameInput.$el.addEventListener('mousedown', (event) => {
      event.stopPropagation()
    })
    // NOTE: the input element, due to being withing draggable, cannot be highlighted in firefox for some reason (chrome works)
  },
  
  methods: {
    ...mapActions([
      'updateTag',
      'deleteTag'
    ]),
    
    handleDropdownShow () {
      if (!this.tag) {
        return
      }
      this.newTagName = this.tag.tagName
      this.newTagColor = this.tag.color
    },
    
    async updateTagSubmit () {
      await this.updateTag({
        tagId: this.tagId,
        tagName: this.newTagName,
        color: this.newTagColor
      })
      this.$el.querySelector('.dropdown-toggle').style.setProperty('background-color', this.tag.color)
      this.$refs.dropdown.hide()
    }
  }
}
</script>

<style scoped>

#tag-name-input {
  color: white;
}

</style>

<style lang="scss">
.tag-button {
  border: 1px solid transparent !important;
}

.tag-button:hover {
  color: lightgrey !important;
}
</style>
