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
      >{{ tag?.tagName }}</span>
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

<script setup lang="ts">
import { ref, computed, watch, type PropType } from 'vue';
import getTextColor from '../lib/getTextColor';
import type { Tag } from '@/types';
import { useStore } from 'vuex';

type TagActionFunc = (payload: { tagId: string }) => void;

const props = defineProps({
  tagId: {
    type: String,
    required: true
  },
  selectText: {
    type: String,
    default: 'View tag activity'
  },
  selectTag: {
    type: Function as PropType<TagActionFunc>,
    default: null
  },
  removeText: {
    type: String,
    default: 'Remove tag from task'
  },
  removeTag: {
    type: Function as PropType<TagActionFunc>,
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
});

const store = useStore();

const tag = computed<Tag | undefined>(() => store.state.tags[props.tagId]);

const textColor = ref('#FFFFFF');

watch(() => tag.value?.color, (newColor) => {
  if (newColor) {
    textColor.value = getTextColor(newColor);
  }
}, { immediate: true });

const tagButtonStyle = computed(() => {
  return {
    backgroundColor: tag.value?.color,
    color: textColor.value
  };
});

const onSelectTag = () => {
  if (props.selectTag) {
    props.selectTag({ tagId: props.tagId });
  }
};
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
