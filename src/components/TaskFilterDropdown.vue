<template>
  <BDropdown
    ref="dropdown"
    v-b-tooltip.hover.left="filterButtonTooltip"
    :disabled="Object.keys(tags).length === 0"
    placement="right-start"
    boundary="viewport"
    variant="light"
    :toggle-class="settings.selectedTagIds.length > 0 ? 'filter-btn-active' : ''"
    :style="filterBtnStyle"
    no-caret
  >
    <template #button-content>
      <font-awesome-icon icon="filter" />
    </template>

    <BDropdownHeader>
      <div class="d-flex justify-content-between">
        <div>Filter by Tag</div>
        <a
          :href="settings.selectedTagIds.length ? '#' : undefined"
          @click="clearAllTags"
        >Clear All</a>
      </div>

      <div class="d-flex align-items-center">
        <b-form-checkbox
          v-if="settings.selectedTagIds.length"
          v-model="addSelectedTags"
          class="mt-2"
        >
          Include in new tasks
        </b-form-checkbox>
      </div>
    </BDropdownHeader>

    <BDropdownDivider />

    <BDropdownItemButton
      v-for="tagId in tagOrder"
      :key="tagId"
      :class="unselectedTags.includes(tagId) ? '' : 'selected'"
      @click="itemClicked(tagId)"
    >
      <TagButton
        :tag="tags[tagId]"
        :tag-id="tagId"
        :unselected="unselectedTags.includes(tagId)"
      />
    </BDropdownItemButton>
  </BDropdown>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ComponentPublicInstance } from 'vue';
import { useStore } from 'vuex';
import TagButton from './TagButton.vue';
import type { Tag, TaskForState, Settings } from '@/types'; // Assuming types are defined in @/types

const store = useStore();

const dropdown = ref<ComponentPublicInstance | null>(null);

// Vuex State
const tags = computed<Record<string, Tag>>(() => store.state.tags);
const tagOrder = computed<string[]>(() => store.state.tagOrder);
const tasks = computed<TaskForState[]>(() => store.state.tasks);
const selectedTask = computed<TaskForState | null>(() => store.state.selectedTask);
const settings = computed<Settings>(() => store.state.settings);

// Vuex Getters
const unselectedTags = computed<string[]>(() => store.getters.unselectedTags);
const incompleteTasks = computed<TaskForState[]>(() => store.getters.incompleteTasks);
const completedTasksFiltered = computed<TaskForState[]>(() => store.getters.completedTasksFiltered);

// Computed properties
const filterBtnStyle = computed(() => {
  return {
    '--filter-btn-background-color': settings.value.selectedTagIds.length > 0 && tags.value[settings.value.selectedTagIds[0]]
      ? tags.value[settings.value.selectedTagIds[0]].color
      : 'white',
  };
});

const filterButtonTooltip = computed(() => {
  if (tasks.value.length === 0) {
    return 'Add a task enable filtering';
  } else if (Object.keys(tags.value).length === 0) {
    return 'Add a tag to a task to enable filtering';
  }
  return 'Filter tasks';
});

const addSelectedTags = computed({
  get: () => settings.value.addSelectedTags,
  set: (value: boolean) => {
    store.dispatch('updateSetting', { key: 'addSelectedTags', value });
  },
});

// Methods
const itemClicked = (tagId: string) => {
  toggleSelectedTag({ tagId });
};

const toggleSelectedTag = async ({ tagId }: { tagId: string }) => {
  if (!settings.value.selectedTagIds.includes(tagId)) {
    await store.dispatch('addTagFilter', { tagId });
  } else {
    await store.dispatch('removeTagFilter', { tagId });
  }
  await updateSelectedTask();
};

const updateSelectedTask = () => {
  if (!selectedTask.value || (selectedTask.value && !(
    (settings.value.filterOperator === 'or' && settings.value.selectedTagIds.some(tag => selectedTask.value!.tags.includes(tag))) ||
    (settings.value.filterOperator === 'and' && settings.value.selectedTagIds.every(tag => selectedTask.value!.tags.includes(tag)))
  ))) {
    let tasksWithTag: TaskForState | undefined;
    if (settings.value.filterOperator === 'or') {
      tasksWithTag = incompleteTasks.value.find(task => settings.value.selectedTagIds.some(tag => task.tags.includes(tag)));
    } else {
      tasksWithTag = incompleteTasks.value.find(task => settings.value.selectedTagIds.every(tag => task.tags.includes(tag)));
    }

    if (!tasksWithTag) {
      const CTasksFiltered = completedTasksFiltered.value.filter(t => !t.archived);
      if (settings.value.filterOperator === 'or') {
        tasksWithTag = CTasksFiltered.find(task => settings.value.selectedTagIds.some(tag => task.tags.includes(tag)));
      } else {
        tasksWithTag = CTasksFiltered.find(task => settings.value.selectedTagIds.every(tag => task.tags.includes(tag)));
      }
    }

    if (tasksWithTag) {
      store.dispatch('selectTask', { taskId: tasksWithTag.id });
    } else {
      store.dispatch('selectTask', { taskId: null });
    }
  }
};

const clearAllTags = () => {
  store.dispatch('removeAllTagFilters');
};

</script>

<style scoped>
.filter-btn-active > svg {
  color: white;
  -webkit-filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, .7));
  filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, .7));
}

.filter-btn-active:hover > svg {
  color: lightgrey;
}
</style>

<style>

</style>
