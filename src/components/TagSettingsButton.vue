<template>
  <BDropdown
    v-if="tag"
    ref="dropdown"
    class="tag"
    :text="tag.tagName"
    placement="right-start"
    @show="handleDropdownShow"
  >
    <TagEditMenu
      v-if="tagId"
      ref="tagEditMenu"
      :tag-id="tagId"
      @update-tag="handleDropdownHide"
    />
  </BDropdown>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, type PropType, nextTick } from 'vue';
import { useStore } from 'vuex';
import TagEditMenu from './TagEditMenu.vue';
import getTextColor from '../lib/getTextColor';

interface Tag {
  tagName: string;
  color: string;
}

interface RootState {
  tags: Record<string, Tag>;
}

interface BDropdownComponent {
  $el: HTMLElement;
  hide: () => void;
}

const props = defineProps({
  tagId: {
    type: String as PropType<string | null>,
    default: null
  }
});

const store = useStore<RootState>();

const dropdown = ref<BDropdownComponent | null>(null);
const tagEditMenu = ref<InstanceType<typeof TagEditMenu> | null>(null);

const tag = computed<Tag | undefined>(() => {
  if (props.tagId && store.state.tags) {
    return store.state.tags[props.tagId];
  }
  return undefined;
});

const setButtonColor = () => {
  if (tag.value && dropdown.value?.$el) {
    const toggleButton = dropdown.value.$el.querySelector('.dropdown-toggle') as HTMLElement | null;
    if (toggleButton) {
      toggleButton.style.backgroundColor = tag.value.color;
      toggleButton.style.color = getTextColor(tag.value.color);
    }
  }
};

const handleDropdownShow = () => {
  if (!tag.value) {
    return;
  }
  if (tagEditMenu.value && typeof tagEditMenu.value.refreshTagNameAndColor === 'function') {
    tagEditMenu.value.refreshTagNameAndColor();
  }
};

const handleDropdownHide = () => {
  setButtonColor();
  if (dropdown.value && typeof dropdown.value.hide === 'function') {
    dropdown.value.hide();
  }
};

onMounted(() => {
  if (tag.value) {
    nextTick(() => {
      setButtonColor();
    });
  }
});

watch(tag, (newTagValue) => {
  if (newTagValue) {
    nextTick(() => {
      setButtonColor();
    });
  }
}, { deep: true });
</script>

<style lang="scss">

</style>
