<template>
  <b-modal
    id="rewardsModal"
    content-class="tag-modal-content"
    title="Rewards"
    size="lg"
    scrollable
    ok-only
  >
  </b-modal>
</template>

<script>
// import { mapActions, mapState } from 'vuex'

export default {
  name: 'RewardsModal',
  //
  // computed: {
  //   ...mapState([
  //     'tags'
  //   ]),
  //   tagOrder: {
  //     get () {
  //       return this.$store.state.tagOrder
  //     },
  //     set (newOrder) {
  //       this.reorderTags({ newOrder })
  //     }
  //   }
  // },
  //
  // methods: {
  //   ...mapActions([
  //     'reorderTags'
  //   ]),
  //   startDrag () {
  //     document.body.classList.add('draggable-cursor')
  //   },
  //   endDrag () {
  //     document.body.classList.remove('draggable-cursor')
  //   }
  // }
}
</script>

<style>
</style>
