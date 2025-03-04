<template>
  <div>
    <template v-if="archivedTasks.length">
      <b-dropdown-item
        v-for="task of archivedTasks"
        :key="task.id"
      >
        <div class="d-flex">
          <div class="flex-1 d-flex align-items-center">
            <Checkbox
              :checked="task.completed !== null"
              :disabled="true"
            />
            <span>{{ task.name }}</span>
          </div>
          <div class="text-right">
            <b-button
              block
              variant="archive-color"
              title="Archive task"
              @click="archiveTask({taskId: task.id})"
            >
              <span>
                <font-awesome-icon icon="upload" />
                <span>&nbsp;&nbsp;Unarchive</span>
              </span>
            </b-button>
          </div>
        </div>
      </b-dropdown-item>
    </template>
    
    <b-dropdown-item
      v-if="archivedTasks.length === 0"
      disabled
    >
      <em>No archived tasks</em>
    </b-dropdown-item>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Checkbox from '../Checkbox.vue'

export default {
  name: 'ArchiveDropdownMenu',
  
  components: { Checkbox },
  
  computed: {
    ...mapGetters([
      'archivedTasks'
    ])
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
