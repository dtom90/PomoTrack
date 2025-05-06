<template>
  <div ref="taskMenu">
    <BDropdown
      :disabled="!taskId"
      right
      variant="light"
      no-caret
    >
      <template #button-content>
        <font-awesome-icon icon="ellipsis-vertical" />
      </template>

      <div>
        <BDropdownItemButton
          variant="danger"
          title="Archive task"
          @click="archiveTask({taskId: taskId})"
        >
          <span v-if="!isArchived">
            <span>Archive</span>
          </span>
          <span v-if="isArchived">
            <span>Unarchive</span>
          </span>
        </BDropdownItemButton>
      </div>
    </BDropdown>
  </div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex';
import type { PropType } from 'vue';

defineProps({
  taskId: {
    type: String as PropType<string | null>,
    default: null
  },
  isArchived: {
    type: Boolean,
    default: false
  }
});

const store = useStore();

const archiveTask = (payload: { taskId: string | null }) => {
  if (payload.taskId) { // Ensure taskId is not null before dispatching
    store.dispatch('archiveTask', payload);
  }
};
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
