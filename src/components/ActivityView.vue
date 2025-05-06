<template>
  <div
    :id="props.id"
    class="activity-view"
  >
    <!-- Daily / Weekly / Monthly view switch -->
    <div class="view-select d-flex justify-content-center position-relative">
      <BFormRadioGroup
        v-model="chartType"
        :options="chartTypeOptions"
        buttons
        button-variant="light"
        class="chart-type-buttons"
        @change="onChartTypeChange"
      />

      <div
        v-if="!isTaskActivity"
        class="position-absolute"
        style="right: 0"
      >
        <BDropdown
          no-caret
          right
          text="Set Target"
          variant="light"
        >
          <BDropdownForm>
            <label>{{ chartType }} Target</label>
            <BInputGroup append="hours">
              <BFormInput
                v-model="target"
                type="number"
                min="0"
              />
            </BInputGroup>
          </BDropdownForm>
        </BDropdown>
      </div>
    </div>

    <!-- ActivityChart -->
    <ActivityChart
      ref="activityChartRef"
      :chart-data="chartData"
      :styles="chartStyles"
      :target="target && typeof target === 'number' ? target * 60 : undefined"
    />

    <br>

    <!-- Activity Data -->
    <div>
      <div
        id="activity-log-title"
        class="d-flex justify-content-center"
      >
        <span>Activity Log</span>
      </div>

      <!-- Dropdown to add interval manually -->
      <div style="display: flex; justify-content: flex-end;">
        <IntervalDropdownForm
          v-if="isTaskActivity"
          :task-id="props.taskId"
        />
      </div>

      <!-- Log -->
      <div id="task-log">
        <br>
        <Log
          v-for="([day, dayActivityItem]) in dailyActivityComputed"
          :key="day"
          :day="day"
          :log="dayActivityItem.log"
          :time-spent="dayActivityItem.timeSpent"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import Log from './Log.vue'
import ActivityChart from './ActivityChart.vue'
import IntervalDropdownForm from './IntervalDropdownForm.vue'
import {
  msToMinutes,
  stringToMs,
  displayDateHuman,
  displayDateISO,
  dateDiffInDays,
  daysLater,
  displayWeekISO,
  displayWeekHuman,
  displayMonthISO,
  displayMonthHuman
} from '../lib/time'
import type { TaskLog, Task, Tag, Settings, ModalActivityItem } from '@/types'

const props = defineProps({
  id: {
    type: String,
    default: 'taskActivity'
  },
  taskId: {
    type: String,
    default: null
  },
  tagId: {
    type: String,
    default: null
  },
  label: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: '#2020FF'
  },
  log: {
    type: Array as () => ModalActivityItem[] | TaskLog[],
    default: () => []
  }
})

const store = useStore()

// Template refs
const activityChartRef = ref<InstanceType<typeof ActivityChart> | null>(null)

// Data properties
const chartTypeOptions = ref(['Daily', 'Weekly', 'Monthly'])
const chartType = ref('Daily')

// Store state
const tasks = computed<Task[]>(() => store.state.tasks)
const tags = computed<Record<string, Tag>>(() => store.state.tags)
const settings = computed<Settings>(() => store.state.settings)

// Computed properties
const isTaskActivity = computed(() => props.taskId !== null)

const target = computed({
  get: () => {
    if (isTaskActivity.value) {
      return null
    }
    const typeKey = chartType.value + 'Target' as keyof (Tag | Settings)
    const targetElement = props.label === 'All Activity' ? settings.value : tags.value[props.tagId!]
    return targetElement?.[typeKey] as number | undefined;
  },
  set: (value: string | number) => {
    let numValue = parseFloat(value as string)
    if (isNaN(numValue) || numValue < 0) {
      numValue = 0
    }
    const typeKey = chartType.value + 'Target'
    if (props.label === 'All Activity') {
      store.dispatch('updateSetting', {
        key: typeKey,
        value: numValue
      })
    } else {
      store.dispatch('updateTag', {
        tagId: props.tagId,
        [typeKey]: numValue
      })
    }
  }
})

const calculateTimeSpent = (logItems: ModalActivityItem[]): number => {
  return logItems
    .filter(interval => interval.timeSpent)
    .reduce((total, interval) => total + (interval.timeSpent || 0), 0)
}

interface DailyActivityItem {
  log: ModalActivityItem[];
  timeSpent?: number; // Made optional as it's calculated later
}

const dailyActivityComputed = computed<[string, DailyActivityItem][]>(() => {
  const dailyActivity: Record<string, DailyActivityItem> = {}
  let day

  if (isTaskActivity.value) {
    const task = tasks.value.find(task => task.id === props.taskId)
    if (task?.completed) {
      day = displayDateISO(task.completed)
      dailyActivity[day] = { log: [{ completed: task.completed }] }
    }
  }

  // Create dailyActivity Object from a copy of descending log
  for (const event of [...props.log].reverse()) {
    const timestamp = 'started' in event ? event.started : event.completed
    if (!timestamp) continue
    day = displayDateISO(timestamp)
    if (day in dailyActivity) {
      dailyActivity[day].log.push(event)
    } else {
      dailyActivity[day] = { log: [event] }
    }
  }

  for (const day in dailyActivity) {
    dailyActivity[day].log.sort((a, b) => {
      const aTime = a.completed || a.started
      const bTime = b.completed || b.started
      if (!aTime || !bTime) return 0
      return bTime - aTime
    })
  }

  const dailyActivityArray = Object.entries(dailyActivity)
  dailyActivityArray.sort(([day1], [day2]) => stringToMs(day2) - stringToMs(day1))
  return dailyActivityArray
})

// Chart helper functions (moved inside setup and refactored)
const initializeChartData = () => {
  return {
    labels: [] as string[],
    datasets: [{
      label: props.label || '',
      backgroundColor: props.color,
      data: [] as (number | null)[],
      barThickness: 70
    }]
  }
}

const getDailyChartData = () => {
  const data = initializeChartData()
  let nextDay: string | null = null

  dailyActivityComputed.value.forEach(([day, dayActivityItem]) => {
    const daysDiff = nextDay ? dateDiffInDays(day, nextDay) : 0;
    if (nextDay && daysDiff > 1) {
      const a = displayDateHuman(daysLater(day, 1))
      if (daysDiff === 2) {
        data.labels.unshift(a)
      } else {
        const b = displayDateHuman(daysLater(nextDay, -1))
        data.labels.unshift(a + ' - ' + b)
      }
      data.datasets[0].data.unshift(0)
    }
    // timeSpent is already calculated in dailyActivityComputed
    data.labels.unshift(displayDateHuman(day))
    data.datasets[0].data.unshift(msToMinutes(dayActivityItem.timeSpent || 0))
    nextDay = day
  })
  return data
}

const getWeeklyChartData = () => {
  const weeklyActivity: Record<string, { log: ModalActivityItem[] }> = {}
  let week: string

  for (const event of props.log) {
    if (event.started) { // Ensure event.started exists
      week = displayWeekISO(event.started)
      if (week in weeklyActivity) {
        weeklyActivity[week].log.push(event)
      } else {
        weeklyActivity[week] = { log: [event] }
      }
    }
  }

  const data = initializeChartData()

  Object.keys(weeklyActivity).slice().sort((a, b) => {
    const [ay, aw] = a.split('-').map(n => parseInt(n, 10))
    const [by, bw] = b.split('-').map(n => parseInt(n, 10))
    return (ay - by) * 100 + (aw - bw)
  }).forEach(wk => {
    data.labels.push(displayWeekHuman(wk).join(' '))
    data.datasets[0].data.push(msToMinutes(calculateTimeSpent(weeklyActivity[wk].log)))
  })
  return data
}

const getMonthlyChartData = () => {
  const monthlyActivity: Record<string, { log: ModalActivityItem[] }> = {}
  let month: string

  for (const event of props.log) {
    if (event.started) { // Ensure event.started exists
      month = displayMonthISO(event.started)
      if (month in monthlyActivity) {
        monthlyActivity[month].log.push(event)
      } else {
        monthlyActivity[month] = { log: [event] }
      }
    }
  }

  const data = initializeChartData()

  Object.keys(monthlyActivity).slice().sort((a, b) => {
    const [ay, am] = a.split('-').map(n => parseInt(n, 10))
    const [by, bm] = b.split('-').map(n => parseInt(n, 10))
    return (ay - by) * 100 + (am - bm)
  }).forEach(mnth => {
    data.labels.push(displayMonthHuman(mnth))
    data.datasets[0].data.push(msToMinutes(calculateTimeSpent(monthlyActivity[mnth].log)))
  })
  return data
}

const chartData = computed(() => {
  switch (chartType.value) {
    case 'Daily': return getDailyChartData()
    case 'Weekly': return getWeeklyChartData()
    case 'Monthly': return getMonthlyChartData()
    default: return initializeChartData() // Should not happen
  }
})

const chartStyles = computed(() => {
  const numLabels = chartData.value.labels.length;
  const width = 50 + numLabels * 100

  return width > 600 ? {
    width: `${width}px`,
    height: '400px',
    position: 'relative'
  } : {
    height: '400px',
    position: 'relative' // Added position relative for consistency
  }
})

// Methods
const onChartTypeChange = () => {
  if (activityChartRef.value && typeof activityChartRef.value.scrollRight === 'function') {
    activityChartRef.value.scrollRight()
  }
}

</script>

<style scoped lang="scss">
@use '../styles/variables';

.view-select {
  margin-bottom: 20px;
}

.activity-view {
  padding: 20px;
}

#activity-log-title {
  font-size: variables.$font-size-large;
  font-weight: variables.$font-weight-bold;
  margin-bottom : 20px;
}

#task-log {
  margin-top: -38px;
}

</style>

<style lang="scss">
@use '../styles/variables';

.chart-type-buttons > .btn-light {
  background-color: variables.$dark-quaternary !important;
}

.chart-type-buttons > .btn-light.active {
  background-color: white !important;
  border-color: variables.$dark-tertiary !important;
}
</style>
