<template>
  <div>
    <!-- Tag Edit Form -->
    <b-dropdown-form @submit.prevent="updateTag">
      <b-input-group>
        <b-form-input
          :id="`tag-name-input-${tagId}`"
          ref="tagNameInput"
          v-model="tagName"
          title="Rename tag"
          class="tag-name-input"
          :style="`backgroundColor: ${tagColor}; color: ${textColor}`"
        />
      </b-input-group>
    </b-dropdown-form>
        
    <div class="dropdown-divider" />
        
    <sketch-picker
      v-model="tagColor"
      class="color-picker"
      @input="tagColor = $event.hex"
    />
        
    <div class="dropdown-divider" />
        
    <b-button
      variant="primary"
      class="w-100 mb-2"
      @click="updateTagAction"
    >
      Confirm
    </b-button>

    <b-button
      :id="`delete-tag-btn-${tagId}`"
      title="Delete tag"
      variant="danger"
      class="w-100"
      @click="deleteTagAction"
    >
      Delete
    </b-button>
  </div>
</template>

<script>
import Sketch from 'vue-color/src/components/Sketch'
import getTextColor from '../lib/getTextColor'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'TagEditMenu',
  
  components: {
    'sketch-picker': Sketch
  },
  
  props: {
    tagId: {
      type: String,
      required: true
    }
  },
  
  data () {
    return {
      tagName: '',
      tagColor: '#000000',
      textColor: '#FFFFFF'
    }
  },
  
  computed: {
    ...mapState([
      'tags'
    ]),
    tag: function () {
      return this.tags[this.tagId]
    }
  },
  
  watch: {
    tagColor: {
      handler (newVal) {
        this.textColor = getTextColor(newVal)
      },
      immediate: true
    }
  },
  
  mounted () {
    this.refreshTagNameAndColor()

    // override the above event listener for the tag name input
    this.$refs.tagNameInput.$el.addEventListener('mousedown', (event) => {
      event.stopPropagation()
    })
    // NOTE: the input element, due to being withing draggable, cannot be highlighted
    // orignally thought it was just in firefox for some reason (chrome works) but now it seems to be in chrome too
  },
  
  methods: {
    ...mapActions([
      'updateTag',
      'deleteTag'
    ]),

    refreshTagNameAndColor () {
      this.tagName = this.tag.tagName
      this.tagColor = this.tag.color
      this.textColor = getTextColor(this.tagColor)
    },
    
    async updateTagAction () {
      await this.updateTag({
        tagId: this.tagId,
        tagName: this.tagName,
        color: this.tagColor
      })
      this.$emit('update-tag')
    },
    
    deleteTagAction () {
      this.deleteTag({ tagId: this.tagId })
    }
  }
}
</script>

<style scoped>
.color-picker {
  width: 100% !important;
  box-sizing: border-box;
}

.tag-name-input {
  color: white;
}
</style>
