<template>
  <div v-if="completed" class="d-flex align-items-center">
    <img
      src="@/assets/icons/complete.svg"
      alt="completed"
      class="status-icon status-icon-small"
    >
    <span class="task-checkbox-label ms-2">
      Completed
    </span>
  </div>

  <div v-else class="d-flex align-items-center">
    <img
      src="@/assets/icons/incomplete.svg"
      alt="incomplete"
      class="status-icon status-icon-small"
    >
    <span class="task-checkbox-label ms-2">
      Incomplete
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps({
  completed: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped lang="scss">
@use "../styles/_variables.scss";

$status-icon-size: 24px;

.status-icon {
  width: $status-icon-size;
  height: $status-icon-size;

  &.status-icon-small {
    width: variables.$checkbox-size-small;
    height: variables.$checkbox-size-small;
  }
}
</style>
