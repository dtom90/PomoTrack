<template>
  <div class="d-flex align-items-center">
    <div
      :class="[
        'checkbox-container',
        {
          'checkbox-large': props.size === 'large' && !props.disabled,
        }
      ]"
    >
      <input
        :checked="props.checked"
        :class="'task-checkbox' + (props.disabled ? '' : ' enabled-checkbox')"
        type="checkbox"
        :title="'Mark task ' + (props.checked ? 'in' : '') + 'complete'"
        :disabled="props.disabled"
        @change="onCheckboxClick"
      >
      <span class="check-custom" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex'
import { defineProps, withDefaults } from 'vue'
import { useNotifications } from '@/lib/notifications'

// Define props with defaults and validator
const props = withDefaults(defineProps<{
  checked?: boolean
  disabled?: boolean
  taskId?: string | null
  size?: 'small' | 'large'
}>(), {
  checked: false,
  disabled: false,
  taskId: null,
  size: 'small'
})

// Validate size prop (included for completeness, though type restricts it)
if (props.size && !['small', 'large'].includes(props.size)) {
  console.warn(`Invalid prop: 'size' must be 'small' or 'large', received '${props.size}'.`)
}

// Store access
const store = useStore()

const { clearNotifications } = useNotifications()

// Methods
const completeTask = (payload: { taskId: string | null }) => {
  if (payload.taskId) { // Only dispatch if taskId is present
    store.dispatch('completeTask', payload)
  }
}

const onCheckboxClick = () => {
  clearNotifications()
  completeTask({ taskId: props.taskId })
}

</script>

<style scoped lang="scss">
@use "../styles/_variables.scss";

/* Adapted from https://hackernoon.com/hacking-custom-checkboxes-and-radios-5d48230440d */
.checkbox-container {
  position: relative;
  min-width: variables.$checkbox-size;
  width: variables.$checkbox-size;
  height: variables.$checkbox-size;

  > * {
    position: absolute;
    left: 0;
    width: variables.$checkbox-size;
    height: variables.$checkbox-size;
  }

  &.checkbox-large {
    min-width: variables.$checkbox-large-size;
    width: variables.$checkbox-large-size;
    height: variables.$checkbox-large-size;

    > * {
      width: variables.$checkbox-large-size;
      height: variables.$checkbox-large-size;
    }
  }
}

/* Styles for hiding the native checkbox */
.task-checkbox {
  z-index: 2;
  opacity: 0;
}

.task-checkbox.enabled-checkbox {
  cursor: pointer;
}

/* Styles for the basic appearance of the custom checkbox */
.check-custom {
  border: 2px solid variables.$checkbox-border;
  border-radius: 50%;
}

/* Styles for the hover state of the custom checkbox */
.enabled-checkbox:hover ~ .check-custom {
  border-color: variables.$primary-blue-light;
  box-shadow: 0 0 0 2px rgba(variables.$primary-blue, 0.25);
}

/* Styles for the checked state of the custom checkbox */
.task-checkbox:checked ~ .check-custom {
  border-color: variables.$primary-blue;
  background: variables.$primary-blue url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSIyMCA2IDkgMTcgNCAxMiI+PC9wb2x5bGluZT48L3N2Zz4=) center no-repeat;
  background-size: 75%;
}
</style>
