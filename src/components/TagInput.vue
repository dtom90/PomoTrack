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

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import TagButton from './TagButton.vue';

interface Tag {
  id: string;
  tagName: string;
}

type RootState = object;

type AvailableTagsGetter = (taskId: string, filterText: string) => Tag[];

interface BDropdownComponent {
  hide: () => void;
  show: () => void;
}

interface BFormInputComponent {
  focus: () => void;
}

const props = defineProps({
  taskId: {
    type: String,
    required: true
  }
});

const store = useStore<RootState>();

const inputTagName = ref('');
const filteredTags = ref<Tag[]>([]);

const dropdown = ref<BDropdownComponent | null>(null);
const addTagInput = ref<BFormInputComponent | null>(null);

const availableTags = computed<AvailableTagsGetter>(() => store.getters.availableTags);

const updateTagOptions = () => {
  if (props.taskId) {
    filteredTags.value = availableTags.value(props.taskId, inputTagName.value);
  }
};

const addTagById = async (tagId: string) => {
  if (props.taskId) {
    await store.dispatch('addTaskTagById', { taskId: props.taskId, tagId });
    resetInput();
  }
};

const addTagByName = async () => {
  if (props.taskId && inputTagName.value && inputTagName.value.length) {
    await store.dispatch('addTaskTagByName', { taskId: props.taskId, tagName: inputTagName.value });
    dropdown.value?.hide();
    resetInput();
  }
};

const resetInput = () => {
  inputTagName.value = '';
  updateTagOptions();
  addTagInput.value?.focus();
  dropdown.value?.show();
};
</script>

<style>
.add-tag-btn {
  margin-top: 8px;
}

.dropend {
  margin-top: 8px;
}
</style>
