<template>
  <b-modal
    id="activityModal"
    size="lg"
    hide-footer
    scrollable
    @shown="onModalShown"
    @hidden="onModalHidden"
  >
    <template v-slot:modal-title>
      <span class="title-spacer" />
      <span id="activity-for">Activity for</span>
      <TagSettingsButton :tag-id="tempState.modalTagId" />
    </template>
    
    <template v-slot:modal-header-close>
      <span class="close-icon" />
    </template>
    
    <div v-if="tempState.modalTagId && isModalShown && tagActivity !== null">
      <DailyActivitySummary
        :tag-id="tempState.modalTagId"
      />
      <ActivityView
        id="tagActivity"
        :tag-id="tag.id"
        :label="tag.tagName"
        :color="tag.color"
        :log="tagActivity"
      />
    </div>
  </b-modal>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
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
      'tagActivity',
      'tempState'
    ]),
    
    tag: function () {
      return this.tags[this.tempState.modalTagId]
    }
  },
  
  methods: {
    ...mapActions([
      'loadTagActivity'
    ]),
    
    onModalShown () {
      this.isModalShown = true
      this.loadTagActivity()
    },
    
    onModalHidden () {
      this.isModalShown = false
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
