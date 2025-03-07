<template>
  <b-modal
    id="allActivityModal"
    size="lg"
    hide-footer
    scrollable
    @shown="isModalShown = true"
    @hidden="isModalShown = false"
  >
    <template v-slot:modal-title>
      <div class="title-spacer" />
      <span>All Activity</span>
    </template>

    <DailyActivitySummary />
    <ActivityView
      v-if="isModalShown"
      id="allActivity"
      label="All Activity"
      :log="allActivity"
    />
  </b-modal>
</template>

<script>
import ActivityView from '../ActivityView'
import { mapGetters } from 'vuex'
import DailyActivitySummary from './DailyActivitySummary.vue'

export default {
  name: 'AllActivityModal',
  
  components: {
    DailyActivitySummary,
    ActivityView
  },
  
  data: () => ({
    isModalShown: false
  }),
  
  computed: {
    ...mapGetters([
      'allActivity'
    ])
  }
}
</script>

<style scoped>
.title-spacer {
  width: 32px;
}
</style>
