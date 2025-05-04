<template>
  <b-modal
    id="activityModal"
    v-model="modalVisible"
    size="lg"
    no-footer
    scrollable
    @hidden="onModalHidden"
  >
    <template v-slot:modal-title>
      <span class="title-spacer" />
      <span v-if="!tempState.modalTagId">All Activity</span>
      <template v-else>
        <span id="activity-for">Activity for</span>
        <TagSettingsButton :tag-id="tempState.modalTagId" />
      </template>
    </template>
    
    <template v-slot:modal-header-close>
      <span class="close-icon" />
    </template>
    
    <div v-if="modalActivity !== null">
      <DailyActivitySummary
        :filtered-activity="modalActivity"
      />
      <ActivityView
        v-if="!tempState.modalTagId"
        id="allActivity"
        label="All Activity"
        :log="modalActivity"
      />
      <ActivityView
        v-else
        id="tagActivity"
        :tag-id="tag.id"
        :label="tag.tagName"
        :color="tag.color"
        :log="modalActivity"
      />
    </div>
  </b-modal>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import DailyActivitySummary from './DailyActivitySummary.vue'
import ActivityView from './ActivityView.vue'
import TagSettingsButton from './TagSettingsButton.vue'

export default {
  name: 'ActivityModal',
  
  components: {
    TagSettingsButton,
    DailyActivitySummary,
    ActivityView
  },

  computed: {
    ...mapState([
      'tags',
      'modalActivity',
      'tempState',
      'isActivityModalVisible'
    ]),
    
    tag: function () {
      return this.tags[this.tempState.modalTagId]
    },

    modalVisible: {
      get () {
        return this.isActivityModalVisible
      },
      set (value) {
        this.setActivityModalVisible(value)
      }
    }
  },
  
  methods: {
    ...mapActions([
      'loadAllActivity',
      'loadTagActivity'
    ]),
    ...mapMutations([
      'unloadModalActivity',
      'setActivityModalVisible'
    ]),
    
    onModalHidden () {
      this.unloadModalActivity()
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
