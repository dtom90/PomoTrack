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

<script>
import { mapActions } from 'vuex'

export default {
  name: 'TaskMenu',

  props: {
    taskId: {
      type: String,
      default: null
    },
    isArchived: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    ...mapActions([
      'archiveTask'
    ])
  }
}
</script>

<style scoped>

</style>
