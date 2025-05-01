<template>
  <b-modal
    id="allActivityModal"
    size="lg"
    hide-footer
    scrollable
    @shown="onModalShown"
    @hidden="onModalHidden"
  >
    <template v-slot:modal-title>
      <div class="title-spacer" />
      <span>All Activity</span>
    </template>
    
    <template v-slot:modal-header-close>
      <span class="close-icon" />
    </template>
    
    <div v-if="isModalShown && allActivity !== null">
      <DailyActivitySummary />
      <ActivityView
        id="allActivity"
        label="All Activity"
        :log="allActivity"
      />
    </div>
  </b-modal>
</template>

<script>
import ActivityView from '../ActivityView'
import { mapState, mapActions, mapMutations } from 'vuex'
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
    ...mapState([
      'allActivity'
    ])
  },
  
  methods: {
    ...mapActions([
      'loadAllActivity'
    ]),
    ...mapMutations([
      'unloadAllActivity'
    ]),
    
    onModalShown () {
      this.isModalShown = true
      this.loadAllActivity()
    },

    onModalHidden () {
      this.isModalShown = false
      this.unloadAllActivity()
    }
  }
}
</script>

<style scoped>
.title-spacer {
  width: 32px;
}
</style>
