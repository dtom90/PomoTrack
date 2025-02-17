<template>
  <div>
    <div class="d-flex">
      <div class="flex-1 text-right">
        <b-button
          v-show="selectedDay !== null"
          variant="light"
          @click="daysBack++"
        >
          <font-awesome-icon icon="chevron-left" />
        </b-button>
      </div>
      <div class="flex-1">
        <h4>{{ selectedDayRelative }}</h4>
        <h6>{{ selectedDayDisplay }}</h6>
      </div>
      <div class="flex-1 text-left">
        <b-button
          v-show="daysBack > 0"
          variant="light"
          @click="daysBack--"
        >
          <font-awesome-icon icon="chevron-right" />
        </b-button>
      </div>
    </div>
    <br>
    <table class="table">
      <tr
        v-for="task of selectedDayActivity"
        :key="task[0]"
      >
        <td class="d-flex align-items-center">
          <Checkbox
            :checked="completedTasks.filter(completedTask => completedTask.name === task[0]).length > 0"
            :disabled="true"
          />
          <span>{{ task[0] }}</span>
        </td>
        <td>{{ displayDuration(task[1]) }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import time, { dayjs } from '../../lib/time'
import Checkbox from '@/components/Checkbox'

export default {
  name: 'DailyActivitySummary',
  components: { Checkbox },
  mixins: [time],
  
  data () {
    return {
      daysBack: 0
    }
  },
  
  computed: {
    ...mapGetters([
      'allActivity',
      'completedTasks'
    ]),
    
    selectedDay () {
      let daysBack = -1
      let day = null
      for (let i = this.allActivity.length - 1; i > 0; i--) {
        if (day === null || dayjs(this.allActivity[i].started).isBefore(day, 'day')) {
          day = dayjs(this.allActivity[i].started)
          daysBack++
        }
        if (daysBack === this.daysBack) {
          return day
        }
      }
      return null
    },
    
    selectedDayRelative () {
      if (this.selectedDay === null) {
        return 'No Activity Yet'
      }
      return this.selectedDay.day() === dayjs().day() ? 'Today' : this.selectedDay.day() === dayjs().day() - 1 ? 'Yesterday' : null
    },
    
    selectedDayDisplay () {
      return this.selectedDay === null ? 'No Activity Yet' : this.displayFullDateHuman(this.selectedDay)
    },
    
    selectedDayActivity () {
      if (this.selectedDay === null) {
        return []
      }
      const selectedDayTasks = this.allActivity.filter(log => {
        return log.started && dayjs(log.started).dayOfYear() === this.selectedDay.dayOfYear() &&
          dayjs(log.started).year() === this.selectedDay.year()
      })
      return Object.entries(selectedDayTasks.reduce((sum, task) => {
        sum[task.task] = task.task in sum ? sum[task.task] + task.timeSpent : task.timeSpent
        return sum
      }, {})).sort((a, b) => b[1] - a[1])
    }
  }
}
</script>

<style scoped>

</style>
