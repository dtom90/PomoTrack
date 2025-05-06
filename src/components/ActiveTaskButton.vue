<template v-if="activeTask">
  <div
    id="active-task-container"
    class="d-flex justify-content-center align-items-center"
  >
    <button
      id="active-task-button"
      class="btn btn-light border d-flex justify-content-center align-items-center oval-border"
      @click="selectTaskHandler"
    >
      <TimerDial
        :size="60"
        :circle-thickness="9"
      />
      <div id="active-task-name-and-time">
        <div id="active-task-time">
          {{ displayCountdownTime }}
        </div>
        <div id="active-task-name">
          {{ activeTask.name }}
        </div>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import TimerDial from './TimerDial.vue'
import { useTime } from '../lib/time'

// Get store instance
const store = useStore()

// Composables
const { displayCountdownTime } = useTime()

// Computed properties (replacing mapGetters)
const activeTask = computed(() => store.getters.activeTask)

// Methods (replacing mapActions)
const selectTaskHandler = () => {
  if (activeTask.value) {
    store.dispatch('selectTask', { taskId: activeTask.value.id })
  }
}

// Props (if any, none in the original so defineProps is not strictly needed unless future props are added)
// defineProps({ ... })
</script>

<style scoped lang="scss">
@use "../styles/_variables.scss";

#active-task-button {
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  width: 400px;
}

#active-task-name-and-time {
  font-weight: variables.$font-weight-bold;
  margin-left: 10px;
  text-align: left;
}

#active-task-name {
  font-size: variables.$font-size-base;
}

#active-task-time {
  font-size: variables.$font-size-large;
}
</style>
