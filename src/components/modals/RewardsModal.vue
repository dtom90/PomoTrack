<template>
  <b-modal
    id="rewardsModal"
    content-class="tag-modal-content"
    title="Rewards"
    size="lg"
    scrollable
    ok-only
  >
    <div
      v-for="reward in rewards"
      :key="reward.id"
      class="flex"
    >
      <font-awesome-icon icon="star" />
      <b>&nbsp;{{ getTaskById(reward.taskId).name }}&nbsp;</b>
      <button
        v-if="!reward.isCashedIn"
        class="btn btn-primary"
      >
        Cash In
      </button>
      <b-badge
        v-else
        variant="success"
        class="badge-lg"
      >
        Cashed In
      </b-badge>
    </div>
  </b-modal>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'RewardsModal',

  computed: {
    ...mapState([
      'rewards'
    ]),
    
    ...mapGetters([
      'getTaskById'
    ])
  },

  methods: {
    ...mapActions([
      'reorderTags'
    ])
  }
}
</script>

<style>
.badge-lg {
  font-size: 1rem; /* Adjust the size as needed */
  font-style: normal;
  padding: 0.75rem; /* Adjust the padding as needed */
}
</style>
