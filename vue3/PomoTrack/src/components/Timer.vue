<template>
  <div
    id="countdown-container"
    :style="cssProps"
  >
    <div
      id="dial-section"
      class="width-100 d-flex justify-content-center"
    >
      <TimerDial :disabled="disabled">
        <p
          v-if="!editing"
          id="timer-display"
          @click="onTimerClick"
        >
          {{ disabled ? '00:00' : displayCountdownTime }}
        </p>
        
        <div class="d-flex justify-content-center">
          <div
            v-if="editing"
            id="edit-wrapper"
            class="input-group"
          >
            <input
              v-if="tempState.active"
              v-model="newActiveMinutes"
              type="number"
              class="form-control"
              @keyup.enter="changeMinutes"
            >
            <input
              v-if="!tempState.active"
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
      </TimerDial>
    </div>
    
    <div
      id="controls-section"
      class="d-flex justify-content-center mt-3"
    >
      <div
        id="controls-wrapper"
        class="d-flex justify-content-center align-items-center"
      >
        <b-button
          id="skip-btn"
          variant="light"
          class="mx-2 circular-button"
          title="Skip current interval"
          :disabled="disabled || editing"
          size="sm"
          @click="onSkipTimerClick"
        >
          <font-awesome-icon icon="times" />
        </b-button>
        
        <b-button
          id="play-pause-btn"
          variant="light"
          class="mx-2 circular-button"
          :disabled="disabled || editing"
          :title="playPauseTitle"
          size="lg"
          @click="toggleTimer"
        >
          <font-awesome-icon :icon="playPauseIcon" />
        </b-button>
        
        <b-dropdown
          id="countdown-settings-dropdown"
          right
          variant="light"
          class="mx-2"
          toggle-class="circular-button btn-sm"
          no-caret
          dropright
          boundary="viewport"
          :disabled="disabled"
        >
          <template #button-content>
            <font-awesome-icon icon="gear" />
          </template>
          
          <b-dropdown-form>
            <b-form-checkbox
              id="continueTimer"
              v-model="continueOnComplete"
            >
              <div>Continue Timer </div>
              <div>on Interval Complete</div>
            </b-form-checkbox>
            
            <b-dropdown-divider />
            
            <fieldset :disabled="!continueOnComplete">
              <b-form-group>
                <b-form-checkbox
                  id="secondReminderEnabled"
                  v-model="secondReminderEnabled"
                >
                  Second Reminder
                </b-form-checkbox>
              </b-form-group>
              
              <b-form-group>
                <label for="secondReminderMinutes">after</label>
                <b-form-input
                  id="secondReminderMinutes"
                  v-model="secondReminderMinutes"
                  type="number"
                  class="mx-2"
                  style="max-width: 60px; display: inline-block;"
                  :disabled="!secondReminderEnabled"
                />
                <span>minutes</span>
              </b-form-group>
            </fieldset>
          </b-dropdown-form>
        </b-dropdown>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import CountdownTimer from '../lib/CountdownTimer'
import notifications from '../lib/notifications'
import TimerDial from './TimerDial.vue'
import time from '../lib/time'

export default {
  
  name: 'Timer',
  
  components: {
    TimerDial
  },
  
  mixins: [
    time,
    notifications
  ],
  
  props: {
    taskId: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  
  data: () => ({
    editing: false,
    newActiveMinutes: 0,
    newRestMinutes: 0,
    secondReminderDisplayed: false,
    timer: null
  }),
  
  computed: {
    
    ...mapState([
      'tempState',
      'settings'
    ]),
    
    totalSeconds () {
      return (this.tempState.active ? this.settings.activeMinutes : this.settings.restMinutes) * 60
    },
    
    playPauseIcon () {
      return this.tempState.overtime ? 'stop' : this.tempState.running ? 'pause' : 'play'
    },
    
    playPauseTitle () {
      return this.tempState.overtime ? 'Stop' : (this.tempState.running ? 'Pause' : 'Start') + ' timer'
    },
    
    cssProps () {
      const progress = this.tempState.secondsRemaining / this.totalSeconds
      const arcAngle = progress * 100 // Grows counterclockwise as timer decreases
      
      return {
        '--rotation-factor': progress.toString() + 'turn',
        '--arc-angle': arcAngle.toString(),
        '--countdown-color': this.tempState.active ? 'red' : 'darkseagreen'
      }
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
    'settings.activeMinutes': function () {
      if (this.tempState.active) {
        this.timer = new CountdownTimer(this.totalSeconds, this.decrementTimer, this.finishTimer)
      }
    }
  },
  
  mounted: function () {
    this.updateTempState({ key: 'secondsRemaining', value: this.totalSeconds })
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
      if (this.disabled || this.tempState.running) {
        return
      }
      this.editing = true
      if (this.tempState.active) {
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
        key: this.tempState.active ? 'activeMinutes' : 'restMinutes',
        value: this.tempState.active ? this.newActiveMinutes : this.newRestMinutes
      })
      this.updateTempState({ key: 'secondsRemaining', value: this.totalSeconds })
      this.timer.setSeconds(this.totalSeconds)
      this.editing = false
    },
    
    toggleTimer () {
      this.requestPermission()

      this.clearNotifications()
      
      if (this.tempState.overtime) {
        this.updateTempState({ key: 'overtime', value: false })
        this.resetTimer()
      } else if (this.tempState.running) {
        this.timer.pause()
        this.endInterval()
        this.updateTempState({ key: 'running', value: false })
      } else {
        if (this.tempState.active) { // start an active interval
          this.startTask({ taskId: this.taskId })
        } else { // this is a rest interval, simply toggle running
          this.updateTempState({ key: 'running', value: !this.tempState.running })
        }
        this.timer.start()
      }
    },
    
    decrementTimer (secondsRemaining) {
      if (this.tempState.running) {
        this.updateTempState({ key: 'secondsRemaining', value: secondsRemaining })
        if (this.tempState.active) {
          this.updateTaskTimer({ taskId: this.taskId })
          if (this.tempState.overtime && !this.secondReminderDisplayed && this.tempState.secondsRemaining <= this.secondReminderSeconds) {
            this.notify('Finished Working, Take a Break!')
            this.secondReminderDisplayed = true
          }
        }
      } else {
        if (this.tempState.overtime) {
          this.updateTempState({ key: 'overtime', value: false })
          this.resetTimer()
        } else {
          this.timer.pause()
        }
      }
    },
    
    endInterval () {
      if (this.tempState.active && this.tempState.running) {
        this.stopTask()
      }
    },
    
    finishTimer (secondsRemaining = null) {
      const fromCountdownFinish = typeof secondsRemaining === 'number'
      let notify = false
      
      if (fromCountdownFinish) { // If this came from the countdown finishing
        this.updateTempState({ key: 'secondsRemaining', value: secondsRemaining }) // reset secondsRemaining
        if (!this.tempState.overtime) { // If we're not in overtime
          notify = true // Set notify to true
          if (this.continueOnComplete && this.tempState.active) { // If continueOnComplete is set, go into overtime
            this.updateTempState({ key: 'overtime', value: true })
          }
        }
      } else if (this.tempState.overtime) {
        this.updateTempState({ key: 'overtime', value: false })
      }
      
      // Notify interval finish
      if (notify) {
        if (this.tempState.active) {
          this.notify('Finished Working, Take a Break!')
        } else {
          this.notify('Finished Break, Time to Work!')
        }
      }
      
      // If this was a manual finishTimer, or we're not continuing into overtime, then reset the timer
      if (!fromCountdownFinish || !this.tempState.active || !this.tempState.overtime) {
        this.resetTimer()
      } else {
        this.decrementTimer(this.tempState.secondsRemaining)
      }
    },
    
    resetTimer () {
      this.timer.clear()
      this.endInterval()
      this.updateTempState({ key: 'activeTaskID', value: null })
      this.updateTempState({ key: 'running', value: false })
      this.updateTempState({ key: 'active', value: !this.tempState.active })
      this.timer = new CountdownTimer(this.totalSeconds, this.decrementTimer, this.finishTimer)
      this.updateTempState({ key: 'secondsRemaining', value: this.totalSeconds })
      this.secondReminderDisplayed = false
    }
  }
}

</script>

<style scoped lang="scss">
@use '../styles/_variables.scss';

$dial-size: 300px;
$circle-thickness: 18px;

#countdown-container {
  text-align: center;
}

#dial-section {
  #timer-display {
    font-size: variables.$font-size-xxxxl;
    font-weight: variables.$font-weight-bold;
    margin: 0;
    z-index: 2;
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
}

#controls-section {
  width: 100%;

  #controls-wrapper {
    width: $dial-size;

    > * {
      margin-left: 20px !important;
      margin-right: 20px !important;
    }
  }
  
  #play-pause-btn {
    color: variables.$white;
    background-color: variables.$dark-primary;
  }

  #play-pause-btn:hover {
    color: variables.$dark-tertiary;
  }
}
</style>

<style lang="scss">
@use '../styles/_variables.scss';

.circular-button {
  border-radius: 50% !important;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.circular-button.btn-lg {
  width: 48px;
  height: 48px;
}

.circular-button.btn-sm {
  width: 36px;
  height: 36px;
  background-color: variables.$white;
  border: 1px solid variables.$dark-tertiary;
}

// Timer settings form spacing
#countdown-settings-dropdown {
  .form-group {
    margin-bottom: 0.5rem;
  }
  
  fieldset .form-group:last-child {
    margin-bottom: 0;
  }
}
</style>
