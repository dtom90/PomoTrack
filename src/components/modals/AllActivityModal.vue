<template>
  <b-modal
    id="allActivityModal"
    title="All Activity"
    size="lg"
    ok-only
    @shown="modalShown"
  >
    <ActivityView
      v-if="isModalShown"
      id="allActivity"
      element="All Activity"
      :log="allActivity"
    />
  </b-modal>
</template>

<script>
import ActivityView from '../ActivityView'
import { mapGetters } from 'vuex'

export default {
  name: 'ActivityModal',
  
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
  },
  
  methods: {
    modalShown () {
      // Wait until the modal is shown before rendering ActivityView
      this.isModalShown = true
    }
  }
}
</script>
