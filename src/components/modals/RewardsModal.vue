<template>
  <b-modal
    id="rewardsModal"
    title="Rewards"
    size="lg"
    scrollable
    ok-only
  >
    <p class="text-center">
      Reward yourself for completing tasks! Cash in your rewards here
    </p>
    <hr>
    <h6 class="text-left">Rewards to Cash In</h6>
    <hr>
    <div
      v-for="reward in rewards.filter(r => !r.isCashedIn)"
      :key="reward.id"
      class="flex reward"
    >
      <b-button
        variant="primary"
        @click="cashInReward({ rewardId: reward.id, isCashedIn: true })"
      >
        <font-awesome-icon icon="money-bill" />
        <span>&nbsp;Cash In</span>
      </b-button>
      <b>&nbsp;&nbsp;{{ getTaskById(reward.taskId).name }}</b>
    </div>
    
    <hr>
    <h6 class="text-left">Cashed-in Rewards</h6>
    <hr>
    <div
      v-for="reward in rewards.filter(r => r.isCashedIn)"
      :key="reward.id"
      class="flex reward"
    >
      <b-badge
        variant="success"
        class="badge-lg"
      >
        <font-awesome-icon icon="check" />
        <span>&nbsp;Cashed In</span>
      </b-badge>
      <b>&nbsp;&nbsp;{{ getTaskById(reward.taskId).name }}</b>
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
      'cashInReward'
    ])
  }
}
</script>

<style scoped>
.badge-lg {
  font-size: 1rem; /* Adjust the size as needed */
  font-weight: normal;
  padding: 0.75rem; /* Adjust the padding as needed */
}
</style>
