<template>
  <div class="d-flex align-items-center">
    <img
      :src="completed ? '/assets/icons/complete.svg' : '/assets/icons/incomplete.svg'"
      :alt="completed ? 'complete' : 'incomplete'"
      class="status-icon status-icon-small"
    >
    <span class="task-checkbox-label ml-2">
      {{ completed ? 'Completed' : 'Incomplete' }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'CompleteStatus',
  
  props: {
    completed: {
      type: Boolean,
      default: false
    }
  }
}
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
