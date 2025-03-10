<template>
  <div
    id="countdown-container"
    class="d-flex justify-content-center"
    :style="cssProps"
  >
    <div id="dial-container">
      <button
        id="skip-btn"
        class="btn btn-light"
        title="Skip current interval"
        :disabled="editing"
        @click="onSkipTimerClick"
      >
        <font-awesome-icon icon="times" />
      </button>
      
      <div
        id="countdown-settings-dropdown"
        class="dropright"
      >
        <button
          id="countdown-menu-button"
          class="btn btn-light"
          data-toggle="dropdown"
        >
          <font-awesome-icon icon="gear" />
        </button>
        <div
          id="countdown-menu"
          class="dropdown-menu"
        >
          <div
            class="form-check form-check-inline"
          >
            <input
              id="continueTimer"
              v-model="continueOnComplete"
              type="checkbox"
              class="form-check-input"
            >
            <label
              class="form-check-label"
              for="continueTimer"
              style="margin-left: 6px;"
              @click.stop=""
            >Continue Timer when Interval Complete</label>
          </div>
          <div class="dropdown-divider" />
          <form class="form-inline">
            <fieldset :disabled="!continueOnComplete">
              <div class="form-group">
                <input
                  id="secondReminderEnabled"
                  v-model="secondReminderEnabled"
                  type="checkbox"
                  class="form-check-input"
                >
                <label
                  class="form-check-label"
                  for="secondReminderEnabled"
                  style="margin-left: 6px;"
                  @click.stop=""
                >Second Reminder</label>
              </div>
              
              <div class="form-group">
                <label for="secondReminderMinutes">after&nbsp;</label>
                <input
                  id="secondReminderMinutes"
                  v-model="secondReminderMinutes"
                  type="number"
                  class="form-control mx-sm-1"
                  style="max-width: 60px;"
                  :disabled="!secondReminderEnabled"
                >
                <span>&nbsp;minutes</span>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
      
      <div id="countdown-button-rotator">
        <div id="countdown-button" />
      </div>
      
      <div id="countdown-trail">
        <p
          v-if="!editing"
          id="timer-display"
          @click="onTimerClick"
        >
          {{ displayTime }}
        </p>
        
        <div class="d-flex justify-content-center">
          <div
            v-if="editing"
            id="edit-wrapper"
            class="input-group"
          >
            <input
              v-if="active"
              v-model="newActiveMinutes"
              type="number"
              class="form-control"
              @keyup.enter="changeMinutes"
            >
            <input
              v-if="!active"
              v-model="newRestMinutes"
              type="number"
              class="form-control"
              @keyup.enter="changeMinutes"
            >
            <div class="input-group-append">
              <button
                id="timer-save-button"
                type="button"
                class="btn btn-primary"
                @click="changeMinutes"
              >
                <font-awesome-icon icon="save" />
              </button>
            </div>
          </div>
        </div>
        
        <button
          id="play-pause-btn"
          type="button"
          class="btn btn-light btn-lg"
          :disabled="editing"
          :title="playPauseTitle"
          @click="toggleTimer"
        >
          <font-awesome-icon :icon="playPauseIcon" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import CountdownTimer from '../lib/CountdownTimer'
import notifications from '../lib/notifications'

export default {
  
  name: 'Countdown',
  
  mixins: [notifications],
  
  props: {
    taskId: {
      type: String,
      default: null
    }
  },
  
  data: () => ({
    editing: false,
    newActiveMinutes: 0,
    newRestMinutes: 0,
    active: true,
    overtime: false,
    secondReminderDisplayed: false,
    secondsRemaining: 0,
    timer: null
  }),
  
  computed: {
    
    ...mapState([
      'tempState',
      'settings'
    ]),
    
    totalSeconds () {
      return (this.active ? this.settings.activeMinutes : this.settings.restMinutes) * 60
    },
    
    playPauseIcon () {
      return this.overtime ? 'stop' : this.tempState.running ? 'pause' : 'play'
    },
    
    playPauseTitle () {
      return this.overtime ? 'Stop' : (this.tempState.running ? 'Pause' : 'Start') + ' timer'
    },
    
    cssProps () {
      return {
        '--rotation-factor': (this.secondsRemaining / this.totalSeconds).toString() + 'turn',
        '--countdown-color': this.active ? 'red' : 'darkseagreen',
        '--button-color': this.active ? 'darkred' : 'green'
      }
    },
    
    displayTime () {
      const totalSecs = this.overtime ? -this.secondsRemaining : this.secondsRemaining
      const mins = Math.floor(totalSecs / 60)
      const secs = totalSecs % 60
      const secString = secs.toString().padStart(2, '0')
      return `${this.overtime ? '+' : ''}${mins}:${secString}`
    },
    
    continueOnComplete: {
      get () {
        return this.settings.continueOnComplete
      },
      async set (value) {
        await this.updateSetting({
          key: 'continueOnComplete',
          value
        })
      }
    },
    
    secondReminderEnabled: {
      get () {
        return this.settings.secondReminderEnabled
      },
      async set (value) {
        await this.updateSetting({
          key: 'secondReminderEnabled',
          value
        })
      }
    },
    
    secondReminderMinutes: {
      get () {
        return this.settings.secondReminderMinutes
      },
      async set (value) {
        await this.updateSetting({
          key: 'secondReminderMinutes',
          value
        })
      }
    },
    
    secondReminderSeconds () {
      return -(this.secondReminderMinutes * 60)
    }
  },
  
  watch: {
    'settings.activeMinutes': function (newVal) {
      if (this.active) {
        this.secondsRemaining = newVal * 60
        this.timer = new CountdownTimer(this.totalSeconds, this.decrementTimer, this.finishTimer)
      }
    }
  },
  
  mounted: function () {
    this.secondsRemaining = this.totalSeconds
    this.timer = new CountdownTimer(this.totalSeconds, this.decrementTimer, this.finishTimer)
  },
  
  methods: {
    
    ...mapActions([
      'startTask',
      'updateTaskTimer',
      'stopTask',
      'updateSetting'
    ]),

    ...mapMutations([
      'updateTempState'
    ]),
    
    onTimerClick () {
      if (this.tempState.running) {
        return
      }
      this.editing = true
      if (this.active) {
        this.newActiveMinutes = this.settings.activeMinutes
      } else {
        this.newRestMinutes = this.settings.restMinutes
      }
    },
    
    onSkipTimerClick () {
      this.clearNotifications()
      this.finishTimer()
    },
    
    async changeMinutes () {
      await this.updateSetting({
        key: this.active ? 'activeMinutes' : 'restMinutes',
        value: this.active ? this.newActiveMinutes : this.newRestMinutes
      })
      this.secondsRemaining = this.totalSeconds
      this.timer.setSeconds(this.totalSeconds)
      this.editing = false
    },
    
    toggleTimer () {
      this.requestPermission()

      this.clearNotifications()
      
      if (this.overtime) {
        this.overtime = false
        this.resetTimer()
      } else if (this.tempState.running) {
        this.timer.pause()
        this.endInterval()
        this.updateTempState({ key: 'running', value: false })
      } else {
        if (this.active) { // start an active interval
          this.startTask({ taskId: this.taskId })
        } else { // this is a rest interval, simply toggle running
          this.updateTempState({ key: 'running', value: !this.tempState.running })
        }
        this.timer.start()
      }
    },
    
    decrementTimer (secondsRemaining) {
      if (this.tempState.running) {
        this.secondsRemaining = secondsRemaining
        if (this.active) {
          this.updateTaskTimer({ taskId: this.taskId })
          if (this.overtime && !this.secondReminderDisplayed && this.secondsRemaining <= this.secondReminderSeconds) {
            this.notify('Finished Working, Take a Break!')
            this.secondReminderDisplayed = true
          }
        }
      } else {
        if (this.overtime) {
          this.overtime = false
          this.resetTimer()
        } else {
          this.timer.pause()
        }
      }
    },
    
    endInterval () {
      if (this.active && this.tempState.running) {
        this.stopTask()
      }
    },
    
    finishTimer (secondsRemaining = null) {
      const fromCountdownFinish = typeof secondsRemaining === 'number'
      let notify = false
      
      if (fromCountdownFinish) { // If this came from the countdown finishing
        this.secondsRemaining = secondsRemaining // reset secondsRemaining
        if (!this.overtime) { // If we're not in overtime
          notify = true // Set notify to true
          if (this.continueOnComplete && this.active) { // If continueOnComplete is set, go into overtime
            this.overtime = true
          }
        }
      } else if (this.overtime) {
        this.overtime = false
      }
      
      // Notify interval finish
      if (notify) {
        if (this.active) {
          this.notify('Finished Working, Take a Break!')
        } else {
          this.notify('Finished Break, Time to Work!')
        }
      }
      
      // If this was a manual finishTimer, or we're not continuing into overtime, then reset the timer
      if (!fromCountdownFinish || !this.active || !this.overtime) {
        this.resetTimer()
      } else {
        this.decrementTimer(this.secondsRemaining)
      }
    },
    
    resetTimer () {
      this.timer.clear()
      this.endInterval()
      this.updateTempState({ key: 'activeTaskID', value: null })
      this.updateTempState({ key: 'running', value: false })
      this.active = !this.active
      this.timer = new CountdownTimer(this.totalSeconds, this.decrementTimer, this.finishTimer)
      this.secondsRemaining = this.totalSeconds
      this.secondReminderDisplayed = false
    }
  }
}

</script>

<style scoped>

#countdown-container {
  text-align: center;
}

#dial-container {
  position: relative;
  width: 200px;
  height: 200px;
}

/*noinspection CssUnresolvedCustomProperty*/
#skip-btn {
  position: absolute;
  right: -38px;
  width: 38px;
  height: 38px;
  border: var(--countdown-color) 2px solid;
  border-radius: 19px;
  color: var(--button-color)
}

#countdown-settings-dropdown {
  position: absolute;
  right: -38px;
  bottom: 0;
}

#countdown-menu {
  width: 210px;
}

/*noinspection CssUnresolvedCustomProperty*/
#countdown-button-rotator {
  position: absolute;
  width: 100%;
  height: 100%;
  transform: rotate(var(--rotation-factor));
  z-index: 1;
  pointer-events: none;
}

/*noinspection CssUnresolvedCustomProperty*/
#countdown-button {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 10px;
  border: var(--countdown-color) 2px solid;
  background-color: white;
  transform: translate(90px, -8px);
}

/*noinspection CssUnresolvedCustomProperty*/
#countdown-trail {
  position: absolute;
  width: 100%;
  height: 100%;
  padding-top: 35px;
  border-radius: 100px;
  border: var(--countdown-color) 4px solid;
}

#timer-display {
  font-size: xx-large;
}

#edit-wrapper {
  height: 48px;
  max-width: 110px;
  margin-bottom: 16px;
}

#edit-wrapper > input {
  height: 100%;
  font-size: 1.2rem;
}

/*noinspection CssUnresolvedCustomProperty*/
#play-pause-btn {
  color: var(--button-color);
}

</style>
