<template>
  <div
    id="countdown-container"
    :style="cssProps"
  >
    <div
      id="dial-section"
      class="width-100 d-flex justify-content-center"
    >
      <div id="dial-container">
        <div id="red-arc-reducer" />
        <div id="gray-outer-circle" />
        <div
          id="white-inner-circle"
          class="d-flex justify-content-center align-items-center"
        >
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
        </div>
      </div>
    </div>
    
    <div
      id="controls-section"
      class="d-flex justify-content-center mt-3"
    >
      <div
        id="controls-wrapper"
        class="d-flex justify-content-around align-items-center"
      >
        <b-button
          id="skip-btn"
          variant="light"
          class="mx-2 circular-button"
          title="Skip current interval"
          :disabled="editing"
          size="sm"
          @click="onSkipTimerClick"
        >
          <font-awesome-icon icon="times" />
        </b-button>
        
        <b-button
          id="play-pause-btn"
          variant="light"
          class="mx-2 circular-button"
          :disabled="editing"
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
          no-caret
          dropright
          boundary="viewport"
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
      const progress = this.tempState.secondsRemaining / this.totalSeconds
      const arcAngle = progress * 100 // Grows counterclockwise as timer decreases
      
      return {
        '--rotation-factor': progress.toString() + 'turn',
        '--arc-angle': arcAngle.toString(),
        '--countdown-color': this.active ? 'red' : 'darkseagreen',
        '--button-color': this.active ? 'darkred' : 'green'
      }
    },
    
    displayTime () {
      const totalSecs = this.overtime ? -this.tempState.secondsRemaining : this.tempState.secondsRemaining
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
    'settings.activeMinutes': function () {
      if (this.active) {
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
      this.updateTempState({ key: 'secondsRemaining', value: this.totalSeconds })
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
        this.updateTempState({ key: 'secondsRemaining', value: secondsRemaining })
        if (this.active) {
          this.updateTaskTimer({ taskId: this.taskId })
          if (this.overtime && !this.secondReminderDisplayed && this.tempState.secondsRemaining <= this.secondReminderSeconds) {
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
        this.updateTempState({ key: 'secondsRemaining', value: secondsRemaining }) // reset secondsRemaining
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
        this.decrementTimer(this.tempState.secondsRemaining)
      }
    },
    
    resetTimer () {
      this.timer.clear()
      this.endInterval()
      this.updateTempState({ key: 'activeTaskID', value: null })
      this.updateTempState({ key: 'running', value: false })
      this.active = !this.active
      this.timer = new CountdownTimer(this.totalSeconds, this.decrementTimer, this.finishTimer)
      this.updateTempState({ key: 'secondsRemaining', value: this.totalSeconds })
      this.secondReminderDisplayed = false
    }
  }
}

</script>

<style scoped lang="scss">
@import '../styles/variables.scss';

$dial-size: 300px;
$circle-thickness: 18px;

#countdown-container {
  text-align: center;
}

#dial-section {
  
  #dial-container {
    position: relative;
    width: $dial-size;
    height: $dial-size;
    margin: 0 auto;
  }
  
  #gray-outer-circle {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: gray $circle-thickness solid;
  }
  
  #red-arc-reducer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    //noinspection CssInvalidFunction
    background: conic-gradient(
      from 0deg,
      var(--countdown-color) 0%,
      var(--countdown-color) calc(var(--arc-angle) * 1%),
      transparent calc(var(--arc-angle) * 1%),
      transparent 100%
    );
    z-index: 1;
    pointer-events: none;
  }

  #white-inner-circle {
    position: absolute;
    top: 0;
    left: 0;
    width: calc(100% - $circle-thickness * 2);
    height: calc(100% - $circle-thickness * 2);
    border-radius: 50%;
    margin: $circle-thickness;
    z-index: 2;
    background-color: white;
  }
  
  #timer-display {
    font-size: $xxxxl-font-size;
    font-weight: $large-font-weight;
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
  }
  
  > .btn {
    border: 2px solid var(--countdown-color);
    border-radius: 50px;
    color: var(--button-color)
  }

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
    width: 3.5rem;
    height: 3.5rem;
  }

  .circular-button.btn-sm {
    width: 2rem;
    height: 2rem;
  }

  #play-pause-btn {
    color: var(--button-color);
  }
  
  #countdown-settings-dropdown {
    button {
      border-radius: 50% !important;
      width: 2rem;
      height: 2rem;
      padding: 0;
    }
    
    .dropdown-menu {
      width: 250px;
      padding: 1rem;
    }
  }
}
</style>
