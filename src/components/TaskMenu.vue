<template>
  <div ref="taskMenu">
    <b-dropdown
      right
      variant="light"
      no-caret
    >
      <template #button-content>
        <font-awesome-icon icon="ellipsis-vertical" />
      </template>
      
      <div>
        <b-dropdown-item-button
          variant="danger"
          title="Archive task"
          @click="archiveTask({taskId: taskId})"
        >
          <span v-if="!isArchived">
            <span>&nbsp;&nbsp;Archive</span>
          </span>
          <span v-if="isArchived">
            <span>&nbsp;&nbsp;Unarchive</span>
          </span>
        </b-dropdown-item-button>
      </div>
    </b-dropdown>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'TaskMenu',
  
  props: {
    taskId: {
      type: String,
      required: true
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
