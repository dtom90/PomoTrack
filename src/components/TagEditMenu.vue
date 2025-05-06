<template>
  <div>
    <!-- Tag Edit Form -->
    <BDropdownForm @submit.prevent="updateTag">
      <BInputGroup>
        <BFormInput
          :id="`tag-name-input-${props.tagId}`"
          ref="tagNameInput"
          v-model="tagName"
          title="Rename tag"
          class="tag-name-input"
          :style="`backgroundColor: ${tagColor}; color: ${textColor}`"
        />
      </BInputGroup>
    </BDropdownForm>

    <div class="dropdown-divider" />

    <sketch-picker
      v-model="tagColor"
      class="color-picker"
      @input="tagColor = $event.hex"
    />

    <div class="dropdown-divider" />

    <BButton
      variant="primary"
      class="w-100 mb-2"
      @click="updateTagAction"
    >
      Confirm
    </BButton>

    <BButton
      :id="`delete-tag-btn-${props.tagId}`"
      title="Delete tag"
      variant="danger"
      class="w-100"
      @click="deleteTagAction"
    >
      Delete
    </BButton>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import type { ComponentPublicInstance } from 'vue';
import { SketchPicker } from 'vue-color';
import getTextColor from '../lib/getTextColor';
import { useStore } from 'vuex';
import type { Tag } from '@/types';

interface Props {
  tagId: string;
}

const props = defineProps<Props>();

const emit = defineEmits(['update-tag']);

const store = useStore();

interface BFormInputInstance extends ComponentPublicInstance {
  $el: HTMLElement;
}

const tagNameInput = ref<BFormInputInstance | null>(null);
const tagName = ref('');
const tagColor = ref('#000000');
const textColor = ref('#FFFFFF');

const tags = computed(() => store.state.tags);
const tag = computed<Tag | undefined>(() => tags.value[props.tagId]);

watch(tagColor, (newVal) => {
  textColor.value = getTextColor(newVal);
}, { immediate: true });

const refreshTagNameAndColor = () => {
  if (tag.value) {
    tagName.value = tag.value.tagName;
    tagColor.value = tag.value.color;
    textColor.value = getTextColor(tagColor.value);
  }
};

const updateTagAction = async () => {
  await store.dispatch('updateTag', {
    tagId: props.tagId,
    tagName: tagName.value,
    color: tagColor.value
  });
  emit('update-tag');
};

const deleteTagAction = () => {
  store.dispatch('deleteTag', { tagId: props.tagId });
};

onMounted(() => {
  refreshTagNameAndColor();

  nextTick(() => {
    if (tagNameInput.value) {
      const inputElement = tagNameInput.value.$el;
      if (inputElement instanceof HTMLElement) {
        inputElement.addEventListener('mousedown', (event) => {
            event.stopPropagation();
        });
      }
    }
  });
});

const updateTag = () => {
  updateTagAction();
};

defineExpose({
  refreshTagNameAndColor
});

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
