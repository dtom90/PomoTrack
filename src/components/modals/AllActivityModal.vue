<template>
  <b-modal
    id="allActivityModal"
    title="All Activity"
    size="lg"
    ok-only
    @shown="isModalShown = true"
    @hidden="isModalShown = false"
  >
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

export default {
  name: 'AllActivityModal',
  
  components: {
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
