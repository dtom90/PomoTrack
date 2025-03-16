<template>
  <b-modal
    id="allActivityModal"
    size="lg"
    hide-footer
    scrollable
    @shown="isModalShown = true"
    @hidden="isModalShown = false"
  >
    <template v-slot:modal-header-close>
      <button
        type="button"
        aria-label="Close"
        class="close"
      >
        <span class="close-icon" />
      </button>
    </template>

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

<style>
/* Add a global style block to override Bootstrap Vue's default styles */
.modal-header .close {
  opacity: 1 !important;
}

.modal-header .close:hover,
.modal-header .close:focus,
.modal-header .close:active {
  opacity: 1 !important;
}
</style>

<style scoped>
.title-spacer {
  width: 32px;
}

.modal-header .close {
  padding: 0;
  margin: 0;
  height: 24px;
  width: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
}

.close-icon {
  width: 15px;
  height: 15px;
  background-image: url('/icons/x.svg');
  background-size: contain;
  background-repeat: no-repeat;
}
</style>
