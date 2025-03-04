<template>
  <div :class="'tag btn-group' + (unselected ? ' unselected' : '')">
    <button
      class="tag-name btn"
      :style="`backgroundColor: ${tag.color}`"
      :title="selectText"
      @click.stop="onSelectTag"
    >
      {{ tag.tagName }}
    </button>
    <button
      v-if="removeTag"
      class="tag-close btn"
      :style="`backgroundColor: ${tag.color}`"
      :title="removeText"
      aria-label="Close"
      @click="removeTag({ tagId })"
    >
      <font-awesome-icon icon="times" />
    </button>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  name: 'TagButton',

  props: {
    tag: {
      type: Object,
      required: true
    },
    tagId: {
      type: String,
      required: true
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
    mini: {
      type: Boolean,
      default: false
    },
    unselected: {
      type: Boolean,
      default: false
    }
  },
  
  methods: {
    ...mapMutations([
      'updateTempState'
    ]),

    onSelectTag () {
      if (this.selectTag) {
        this.selectTag({ tagId: this.tagId })
      } else {
        if (!this.mini) {
          this.updateTempState({ key: 'modalTagId', value: this.tagId })
          this.$root.$emit('bv::toggle::modal', 'activityModal')
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.tag {
  > .btn {
    padding: v-bind('mini ? "0.1rem 0.5rem" : "0.375rem .75rem"');
  }
  
  &.unselected {
    opacity: 0.5;
  }
}
</style>
