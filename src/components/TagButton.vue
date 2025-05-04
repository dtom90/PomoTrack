<template>
  <div :class="'tag btn-group' + (unselected ? ' unselected' : '') + (mini ? ' mini' : '')">
    <button
      class="tag-name btn"
      :style="tagButtonStyle"
      :title="selectText"
      @click="onSelectTag"
    >
      <span
        v-if="!mini"
        class="text-wrap"
      >{{ tag.tagName }}</span>
    </button>
    <button
      v-if="removeTag"
      class="tag-close btn"
      :style="tagButtonStyle"
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
import getTextColor from '../lib/getTextColor'

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

  data () {
    return {
      textColor: '#FFFFFF'
    }
  },
  
  watch: {
    'tag.color': {
      handler (newVal) {
        this.textColor = getTextColor(newVal)
      },
      immediate: true
    }
  },
  
  computed: {
    tagButtonStyle() {
      return {
        backgroundColor: this.tag.color,
        color: this.textColor
      };
    }
  },
  
  methods: {
    ...mapMutations([
      'updateTempState'
    ]),

    onSelectTag () {
      if (this.selectTag) {
        this.selectTag({ tagId: this.tagId })
      }
    }
  }
}
</script>

<style scoped lang="scss">
.tag {
  /* Define the CSS variable here using v-bind */
  --tag-button-padding: v-bind('mini ? "0.375rem 1rem" : "0.375rem .75rem"');

  > .btn {
    /* Use the CSS variable */
    padding: var(--tag-button-padding);
  }
  
  &.unselected {
    opacity: 0.5;
  }
}
</style>
