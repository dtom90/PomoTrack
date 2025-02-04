<template>
  <b-modal
    id="activityModal"
    size="lg"
    ok-only
    @shown="isModalShown = true"
    @hidden="isModalShown = false"
  >
    <template v-slot:modal-title>
      <span id="activity-for">Activity for</span>
      <TagSettingsButton :tag-id="tempState.modalTagId" />
    </template>
    <ActivityView
      v-if="tempState.modalTagId && isModalShown"
      id="tagActivity"
      :element="tempState.modalTagId"
      :log="tagActivity(tempState.modalTagId)"
    />
  </b-modal>
</template>

<script>
import ActivityView from '../ActivityView'
import { mapState, mapGetters } from 'vuex'
import TagSettingsButton from '../TagSettingsButton'

export default {
  name: 'TagActivityModal',
  
  components: {
    TagSettingsButton,
    ActivityView
  },
  
  data: () => ({
    isModalShown: false
  }),
  
  computed: {
    ...mapState([
      'tempState'
    ]),
    
    ...mapGetters([
      'tagActivity'
    ])
  }
}
</script>

<style scoped>
#activity-for {
  margin-top: 5px;
  margin-right: 5px;
}
</style>
