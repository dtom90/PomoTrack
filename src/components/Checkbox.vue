<template>
  <div class="d-flex align-items-center">
    <div
      :class="[
        'checkbox-container',
        {
          'checkbox-large': size === 'large' && !disabled,
        }
      ]"
    >
      <input
        :checked="checked"
        :class="'task-checkbox' + (disabled ? '' : ' enabled-checkbox')"
        type="checkbox"
        :title="'Mark task ' + (checked ? 'in' : '') + 'complete'"
        :disabled="disabled"
        @change="onCheckboxClick"
      >
      <span class="check-custom" />
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import notifications from '../lib/notifications'

export default {
  name: 'Checkbox',
  
  mixins: [notifications],
  
  props: {
    checked: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    taskId: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: 'small',
      validator: value => ['small', 'large'].includes(value)
    }
  },
  
  methods: {
    ...mapActions([
      'completeTask'
    ]),
    
    onCheckboxClick () {
      this.clearNotifications()
      this.completeTask({ taskId: this.taskId })
    }
  }
}
</script>

<style scoped lang="scss">
@import "../styles/_variables.scss";

/* Adapted from https://hackernoon.com/hacking-custom-checkboxes-and-radios-5d48230440d */
.checkbox-container {
  position: relative;
  min-width: $checkbox-size;
  width: $checkbox-size;
  height: $checkbox-size;

  > * {
    position: absolute;
    left: 0;
    width: $checkbox-size;
    height: $checkbox-size;
  }
  
  &.checkbox-large {
    min-width: $checkbox-large-size;
    width: $checkbox-large-size;
    height: $checkbox-large-size;
    
    > * {
      width: $checkbox-large-size;
      height: $checkbox-large-size;
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
  border: 2px solid $checkbox-border;
  border-radius: 50%;
}

/* Styles for the hover state of the custom checkbox */
.enabled-checkbox:hover ~ .check-custom {
  border-color: $primary-blue-light;
  box-shadow: 0 0 0 2px rgba($primary-blue, 0.25);
}

/* Styles for the checked state of the custom checkbox */
.task-checkbox:checked ~ .check-custom {
  border-color: $primary-blue;
  background: $primary-blue url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSIyMCA2IDkgMTcgNCAxMiI+PC9wb2x5bGluZT48L3N2Zz4=) center no-repeat;
  background-size: 75%;
}
</style>
