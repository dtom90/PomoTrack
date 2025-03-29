<template>
  <b-modal
    id="activityModal"
    size="lg"
    hide-footer
    scrollable
    @shown="isModalShown = true"
    @hidden="isModalShown = false"
  >
    <template v-slot:modal-title>
      <span class="title-spacer" />
      <span id="activity-for">Activity for</span>
      <TagSettingsButton :tag-id="tempState.modalTagId" />
    </template>
    
    <template v-slot:modal-header-close>
      <span class="close-icon" />
    </template>
    
    <DailyActivitySummary
      v-if="tempState.modalTagId && isModalShown"
      :tag-id="tempState.modalTagId"
    />
    <ActivityView
      v-if="tempState.modalTagId && isModalShown"
      id="tagActivity"
      :tag-id="tag.id"
      :label="tag.tagName"
      :color="tag.color"
      :log="tagActivity(tempState.modalTagId)"
    />
  </b-modal>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import TagSettingsButton from '../TagSettingsButton'
import DailyActivitySummary from './DailyActivitySummary'
import ActivityView from '../ActivityView'

export default {
  name: 'TagActivityModal',
  
  components: {
    TagSettingsButton,
    DailyActivitySummary,
    ActivityView
  },
  
  data: () => ({
    isModalShown: false
  }),
  
  computed: {
    ...mapState([
      'tags',
      'tempState'
    ]),
    
    ...mapGetters([
      'tagActivity'
    ]),
    
    tag: function () {
      return this.tags[this.tempState.modalTagId]
    }
  }
}
</script>

<style scoped>
#activity-for {
  margin-top: 5px;
  margin-right: 5px;
}

.title-spacer {
  width: 32px;
}
</style>
