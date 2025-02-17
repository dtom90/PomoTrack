<template>
  <b-modal
    id="allActivityModal"
    title="All Activity"
    size="lg"
    ok-only
    @shown="isModalShown = true"
    @hidden="isModalShown = false"
  >
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
