<template>
  <b-modal
    id="allActivityModal"
    size="lg"
    ok-only
    scrollable
    @shown="isModalShown = true"
    @hidden="isModalShown = false"
  >
    <template v-slot:modal-title>
      <ModalTitle
        title="All Activity"
        icon="chart-simple"
      />
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
import ModalTitle from './ModalTitle.vue'

export default {
  name: 'AllActivityModal',
  
  components: {
    ModalTitle,
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
