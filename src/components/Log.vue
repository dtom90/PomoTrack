<template>
  <div class="day-log">
    <!-- Display Day -->
    <h5
      v-if="day"
    >
      {{ displayDateHuman(day) }}
    </h5>

    <!-- Time Spent on Task -->
    <h6>Time Spent: {{ displayDuration(props.timeSpent) }}</h6>

    <!-- Task Activity Log -->
      <div
        class="log"
        v-for="(event, index) in log"
        :key="index"
      >
        <div class="log-wrapper align-items-center flex-wrap">

          <!-- Task Name -->
          <div
            v-if="event.task"
            class="flex-1 text-center me-2"
          >
            <span class="text-bold">{{ event.task }}</span>
          </div>

          <!-- Started/Stopped/Time Spent -->
          <div v-if="!event.completed" class="flex-3 d-flex align-items-center">
            <div class="flex-1 d-flex flex-wrap">
              <div class="flex-2 d-flex align-items-center justify-content-evenly">
                <!-- Started Time -->
                <div v-if="event.started" class="me-2">
                  <span>Started&nbsp;{{ displayTimeHuman(event.started).replace(/\s/g, '&nbsp;') }}</span>
                </div>

                <!-- Arrow -->
                <div class="me-2">
                  <font-awesome-icon icon="arrow-right" />
                </div>

                <!-- Stopped Time -->
                <div class="me-2">
                  <span>{{ event.stopped ? 'Stopped' : 'Running' }}&nbsp;{{ displayTimeHuman(event.stopped || Date.now()).replace(/\s/g, '&nbsp;') }}</span>
                </div>
              </div>

              <!-- Time Spent -->
              <div v-if="event.timeSpent" class="flex-1 text-center me-2">
                <span>Time&nbsp;Spent:&nbsp;{{ displayDuration(event.timeSpent).replace(/\s/g, '&nbsp;') }}</span>
              </div>
            </div>

            <!-- Interval Dropdown -->
            <div
              v-if="!event.task && !event.completed"
              class="btn-container"
            >
              <IntervalDropdownForm :log-id="event.id" />
            </div>
          </div>

          <div v-if="event.completed" class="flex-3 text-center">
            <div>
              <span>Completed {{ displayTimeHuman(event.completed) }}</span>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { displayDuration, displayDateHuman } from '../lib/time'
import IntervalDropdownForm from '@/components/IntervalDropdownForm.vue'
import type { PropType } from 'vue'
import { useTime } from '../lib/time'
import type { ModalActivityItem } from '@/types';

// Props definition
const props = defineProps({
  day: {
    type: String as PropType<string | null>,
    default: null
  },
  log: {
    type: Array as PropType<ModalActivityItem[]>,
    default: () => []
  },
  timeSpent: {
    type: Number,
    default: 0
  }
})

const { displayTimeHuman } = useTime()
</script>

<style scoped lang="scss">
@use "../styles/variables";

.day-log {
  margin-top: 32px;
}

.log {
  margin-top: 20px;
  margin-bottom: 0;
}

.log-wrapper {
  display: flex;
}

@media (max-width: 991px) {
  .log-wrapper {
    display: block;
  }
}

.btn-container {
  padding: 0;
  vertical-align: middle;
}
</style>
