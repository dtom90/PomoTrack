<template>
  <b-modal
    id="archiveModal"
    title="Archived Tasks"
    size="lg"
    scrollable
    ok-only
  >
    <table class="table">
      <tr
        v-for="task of archivedTasks"
        :key="task.id"
      >
        <td class="d-flex">
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
        </td>
      </tr>
    </table>
  </b-modal>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Checkbox from '../Checkbox.vue'

export default {
  name: 'ArchiveModal',
  
  components: {
    Checkbox
  },
  
  data: () => ({
    isModalShown: false
  }),
  
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
