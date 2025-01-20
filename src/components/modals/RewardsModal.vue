<template>
  <b-modal
    id="rewardsModal"
    content-class="tag-modal-content"
    title="Rewards"
    size="lg"
    scrollable
    ok-only
  >
    <p>Rewards to Cash In</p>
    <hr/>
    <div
      v-for="reward in rewards.filter(r => !r.isCashedIn)"
      :key="reward.id"
      class="flex reward"
    >
      <font-awesome-icon icon="star" />
      <b>&nbsp;{{ getTaskById(reward.taskId).name }}&nbsp;&nbsp;</b>
      <b-button
        variant="primary"
        @click="cashInReward({ rewardId: reward.id, isCashedIn: true })"
      >
        <font-awesome-icon icon="money-bill" />
        <span>&nbsp;Cash In</span>
      </b-button>
    </div>
    
    <hr/>
    <p>Cashed-in Rewards</p>
    <hr/>
    <div
      v-for="reward in rewards.filter(r => r.isCashedIn)"
      :key="reward.id"
      class="flex reward"
    >
      <font-awesome-icon icon="star" />
      <b>&nbsp;{{ getTaskById(reward.taskId).name }}&nbsp;&nbsp;</b>
      <b-badge
        variant="success"
        class="badge-lg"
      >
        <font-awesome-icon icon="check" />
        <span>&nbsp;Cashed In</span>
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
