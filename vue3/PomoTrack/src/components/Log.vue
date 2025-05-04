<template>
  <div class="log">
    <!-- Display Day -->
    <h5
      v-if="day"
    >
      {{ displayDateHuman(day) }}
    </h5>
    
    <!-- Time Spent on Task -->
    <h6>Time Spent: {{ displayDuration(timeSpent) }}</h6>
    
    <!-- Task Activity Log -->
    <table
      class="activityLog table"
    >
      <tr
        v-for="(event, index) in log"
        :key="index"
      >
        <template v-if="!event.completed">
          <td
            v-if="event.task"
            class="align-middle"
          >
            <span>{{ event.task }}</span>
          </td>
          
          <td v-if="event.started">
            <span>Started {{ displayTimeHuman(event.started) }}</span>
          </td>
          <td>
            <font-awesome-icon icon="arrow-right" />
          </td>
          <td>
            <span>{{ event.stopped ? 'Stopped' : 'Running' }} {{ displayTimeHuman(event.stopped || Date.now()) }}</span>
          </td>
          <td v-if="event.timeSpent">
            <span>Time Spent: {{ displayDuration(event.timeSpent) }}</span>
          </td>
          <td
            v-if="!event.task && !event.completed"
            class="btn-container"
          >
            <IntervalDropdownForm :log-id="event.id" />
          </td>
        </template>
        
        <template v-if="event.completed">
          <td v-if="event.task">
            <span>{{ event.task }}</span>
          </td>
          <td />
          <td>
            <span>Completed {{ displayTimeHuman(event.completed) }}</span>
          </td>
          <td />
          <td />
        </template>
      </tr>
    </table>
  </div>
</template>

<script>
import time, { displayDuration } from '../lib/time'
import IntervalDropdownForm from '@/components/IntervalDropdownForm.vue'

export default {
  name: 'Log',

  components: { IntervalDropdownForm },
  
  mixins: [time],
  
  props: {
    day: {
      type: String,
      default: null
    },
    log: {
      type: Array,
      default: () => []
    },
    timeSpent: {
      type: Number,
      default: 0
    },
    deleteIntervalButtonClicked: {
      type: Function,
      default: () => {
      }
    }
  },
  
  methods: {
    
    displayEventDuration (event) {
      const end = event.stopped || Date.now()
      return displayDuration(end - event.started)
    },
  
    deleteInterval ({ log, index }) {
      this.deleteIntervalButtonClicked({ logId: log.id })
    }
  }
}
</script>

<style scoped lang="scss">
@use "../styles/variables";

.log {
  margin-top: 32px;
}

.activityLog {
  margin-top: 20px;
  margin-bottom: 0;
  font-size: 16px;
  text-align: center;
}

.btn-container {
  padding: 0;
  vertical-align: middle;
}

td {
  font-size: variables.$font-size-small;
  span {
    padding: 0 !important;
  }
}
</style>
