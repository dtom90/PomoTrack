<template>
  <BModal
    id="activityModal"
    v-model="modalVisible"
    size="lg"
    no-footer
    scrollable
    @hidden="onModalHidden"
  >
    <template #header="{ close }">
      <div class="w-100 d-flex justify-content-center align-items-center position-relative">
        <span v-if="!tempState.modalTagId">All Activity</span>
        <template v-else>
          <span id="activity-for">Activity for</span>
          <TagSettingsButton :tag-id="tempState.modalTagId" />
        </template>
        <button type="button" class="btn-close position-absolute top-0 end-0 m-0 p-1" aria-label="Close" @click="close()"></button>
      </div>
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
  </BModal>
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
