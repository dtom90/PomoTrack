<template>
  <div>
    <div class="d-flex">
      <div class="flex-1 text-right align-self-center">
        <BButton
          v-show="selectedDay !== null"
          variant="light"
          class="rounded-circle"
          @click="daysBack++"
        >
          <font-awesome-icon icon="chevron-left" />
        </BButton>
      </div>
      <div class="flex-1">
        <h4>{{ selectedDayRelative }}</h4>
        <h6>{{ selectedDayDisplay }}</h6>
      </div>
      <div class="flex-1 text-left align-self-center">
        <BButton
          :disabled="daysBack === 0"
          variant="light"
          class="rounded-circle"
          @click="daysBack--"
        >
          <font-awesome-icon icon="chevron-right" />
        </BButton>
      </div>
    </div>
    <h5 class="my-3">
      Total Time: {{ displayDuration(totalTime) }}
    </h5>
    <div class="activity-summary">
      <div
        v-for="task of selectedDayActivity"
        :key="task[0]"
        class="d-flex align-items-top justify-content-between mb-3"
      >
        <div class="completed-section">
          <CompleteStatus :completed="completedTasks.filter(completedTask => completedTask.name === task[0]).length > 0" />
        </div>
        <div class="name-section">
          <span>{{ task[0] }}</span>
        </div>
        <div class="duration-section">
          {{ displayDuration(task[1]) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type PropType } from 'vue'
import { useStore } from 'vuex'
import { dayjs, displayDuration, displayFullDateHuman } from '../lib/time'
import CompleteStatus from '@/components/CompleteStatus.vue'
import type { ModalActivityItem } from '@/types';

// Props
const props = defineProps({
  filteredActivity: {
    type: Array as PropType<ModalActivityItem[] | null>,
    default: null
  }
})

// Store
const store = useStore()

// Refs
const daysBack = ref(0)

// Vuex State and Getters as Computed
// Assuming completedTasks getter returns an array of objects with at least a 'name' property.
// Adjust the type if more specific information is available.
const completedTasks = computed<Array<{ name: string }>>(() => store.getters.completedTasks || [])

// Computed Properties
const selectedDay = computed<dayjs.Dayjs | null>(() => {
  if (!props.filteredActivity || props.filteredActivity.length === 0) {
    return null;
  }
  let currentDaysBackCounter = -1;
  let day: dayjs.Dayjs | null = null;
  for (let i = props.filteredActivity.length - 1; i >= 0; i--) {
    const activityStarted = props.filteredActivity[i]?.started;
    if (activityStarted) {
        if (day === null || dayjs(activityStarted).isBefore(day, 'day')) {
            day = dayjs(activityStarted);
            currentDaysBackCounter++;
        }
        if (currentDaysBackCounter === daysBack.value) {
            return day;
        }
    }
  }
  return null;
});

const selectedDayRelative = computed<string | null>(() => {
  if (selectedDay.value === null) {
    return 'No Activity Yet'
  }
  if (selectedDay.value.isToday()) {
    return 'Today'
  } else if (selectedDay.value.isYesterday()) {
    return 'Yesterday'
  }
  return null // Or some other default string like selectedDay.value.format('MMM D')
})

const selectedDayDisplay = computed<string>(() => {
  return selectedDay.value === null ? 'No Activity Yet' : displayFullDateHuman(selectedDay.value)
})

const selectedDayActivity = computed<[string, number][]>(() => {
  if (selectedDay.value === null || !props.filteredActivity) {
    return []
  }
  const currentSelectedDay = selectedDay.value;
  const selectedDayLogs = props.filteredActivity.filter(log => {
    return log.started &&
           currentSelectedDay &&
           dayjs(log.started).dayOfYear() === currentSelectedDay.dayOfYear() &&
           dayjs(log.started).year() === currentSelectedDay.year()
  })

  const activitySum = selectedDayLogs.reduce<Record<string, number>>((sum, log) => {
    if (log.task && typeof log.timeSpent === 'number') {
      sum[log.task] = (sum[log.task] || 0) + log.timeSpent
    }
    return sum
  }, {})

  return Object.entries(activitySum).sort((a, b) => b[1] - a[1])
})

const totalTime = computed<number>(() => {
  if (selectedDay.value === null) {
    return 0
  }
  return selectedDayActivity.value.reduce((sum, task) => {
    return sum + task[1]
  }, 0)
})

</script>

<style scoped lang="scss">
@use "../styles/variables";

.activity-summary {
  padding-left: 100px;
  padding-right: 100px;
}

.completed-section {
  width: 115px;
}

.name-section {
  width: 224px;
}

.duration-section {
  width: 161px;
  flex-wrap: nowrap;
}
</style>
