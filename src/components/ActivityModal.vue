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
        v-else-if="tag"
        id="tagActivity"
        :tag-id="tag.id"
        :label="tag.tagName"
        :color="tag.color"
        :log="modalActivity"
      />
    </div>
  </BModal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import DailyActivitySummary from './DailyActivitySummary.vue';
import ActivityView from './ActivityView.vue';
import TagSettingsButton from './TagSettingsButton.vue';
import type { Tag } from '@/types';

const store = useStore();

// Reactive state from Vuex store
const modalActivity = computed(() => store.state.modalActivity);
const tempState = computed(() => store.state.tempState);
const tags = computed(() => store.state.tags);

// Computed property for the specific tag, matching original logic
const tag = computed<Tag | undefined>(() => {
  if (tempState.value.modalTagId && tags.value) {
    return tags.value[tempState.value.modalTagId];
  }
  return undefined;
});

// Computed property for modal visibility, matching original logic
const modalVisible = computed({
  get: () => store.state.isActivityModalVisible,
  set: (value: boolean) => {
    store.commit('setActivityModalVisible', value);
  }
});

// Methods, matching original logic
const onModalHidden = () => {
  store.commit('unloadModalActivity');
};
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
