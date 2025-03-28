<template>
  <div
    style="display: flex; justify-content: flex-end;"
  >
    <b-dropdown
      id="add-interval-dropdown"
      ref="addIntervalDropdown"
      dropright
      boundary="viewport"
      variant="light"
      no-caret
      @show="dropdownWillShow"
      @shown="dropdownShown = true"
      @hide="dropdownWillHide"
      @hidden="dropdownShown = false"
    >
      <template v-slot:button-content>
        <img
          src="/icons/add-to-bottom.svg"
          alt="Add interval"
        >
      </template>
      <b-dropdown-form @keydown.enter="addIntervalButtonClicked">
        <b-form-group>
          Started:
          <VueCtkDateTimePicker
            :value="startTime"
            :format="displayDateTimeFormat()"
            :right="true"
            @input="onStartTimeInput"
          />
        </b-form-group>
        
        <b-form-group>
          Duration:
          <b-input-group>
            <b-form-input
              ref="appendMinutesInput"
              :value="durationMinutes"
              :state="durationMinutes > 0 ? null : false"
              aria-describedby="input-live-feedback"
              type="number"
              @input="onDurationMinutesInput"
              @blur="handleBlur"
            />
            <b-input-group-append is-text>
              Minutes
            </b-input-group-append>
            <b-form-invalid-feedback id="input-live-feedback">
              Duration must be greater than 0
            </b-form-invalid-feedback>
          </b-input-group>
        </b-form-group>
        
        <b-form-group>
          Stopped:
          <VueCtkDateTimePicker
            :value="stopTime"
            :format="displayDateTimeFormat()"
            :right="true"
            @input="onStopTimeInput"
          />
        </b-form-group>
        
        <b-btn
          variant="primary"
          class="w-100"
          :disabled="durationMinutes <= 0"
          @click="addIntervalButtonClicked"
        >
          Add Interval
        </b-btn>
      </b-dropdown-form>
    </b-dropdown>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import time from '../lib/time'
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker'
import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css'

export default {
  name: 'AddIntervalDropdown',
  
  components: {
    VueCtkDateTimePicker
  },
  
  mixins: [time],
  
  props: {
    taskId: {
      type: String,
      default: null
    }
  },
  
  data: function () {
    return {
      dropdownShown: false,
      dropdownHide: null,
      intentionalEnter: false,
      startTime: null,
      durationMinutes: 25,
      stopTime: this.displayDateTimeHuman(),
      anchored: ['stopTime', 'durationMinutes']
    }
  },
  
  methods: {
    ...mapActions(['addInterval']),
    
    dropdownWillShow () {
      this.stopTime = this.displayDateTimeHuman()
      this.updateStartTime()
    },
    
    onStartTimeInput (newValue) {
      this.startTime = newValue
      if (!this.anchored.includes('startTime')) {
        this.anchored.shift()
        this.anchored.push('startTime')
      }
      if (this.anchored.includes('durationMinutes')) {
        this.updateStopTime()
      } else if (this.anchored.includes('stopTime')) {
        this.updateDurationMinutes()
      }
      const start = this.stringToMs(this.stopTime) - this.minutesToMs(this.durationMinutes)
      this.startTime = this.displayDateTimeHuman(start)
    },
    onDurationMinutesInput (newValue) {
      this.durationMinutes = newValue
      if (!this.anchored.includes('durationMinutes')) {
        this.anchored.shift()
        this.anchored.push('durationMinutes')
      }
      if (this.anchored.includes('startTime')) {
        this.updateStopTime()
      } else if (this.anchored.includes('stopTime')) {
        this.updateStartTime()
      }
    },
    onStopTimeInput (newValue) {
      this.stopTime = newValue
      if (!this.anchored.includes('stopTime')) {
        this.anchored.shift()
        this.anchored.push('stopTime')
      }
      if (this.anchored.includes('durationMinutes')) {
        this.updateStartTime()
      } else if (this.anchored.includes('startTime')) {
        this.updateDurationMinutes()
      }
    },
    
    updateStartTime () {
      this.startTime = this.displayDateTimeHuman(this.stringToMs(this.stopTime) - this.minutesToMs(this.durationMinutes))
    },
    
    updateDurationMinutes () {
      this.durationMinutes = this.msToMinutes(this.stringToMs(this.stopTime) - this.stringToMs(this.startTime))
    },
    
    updateStopTime () {
      this.stopTime = this.displayDateTimeHuman(this.stringToMs(this.startTime) + this.minutesToMs(this.durationMinutes))
    },
    
    dropdownWillHide (event) {
      if (!this.intentionalEnter) {
        this.dropdownHide = event
        setTimeout(this.clearDropdownHide, 1000)
      } else {
        this.intentionalEnter = false
      }
    },
    
    clearDropdownHide () {
      this.dropdownHide = null
    },
    
    handleBlur (event) {
      if (event.sourceCapabilities === null && this.dropdownHide !== null) {
        setTimeout(() => {
          this.$refs.addIntervalDropdown.show()
          setTimeout(() => event.target.focus(), 50)
        }, 50)
      }
    },
    
    addIntervalButtonClicked (event) {
      this.intentionalEnter = true
      event.preventDefault()
      this.addInterval({
        taskId: this.taskId,
        started: this.stringToMs(this.startTime),
        timeSpent: this.minutesToMs(this.durationMinutes),
        stopped: this.stringToMs(this.stopTime)
      })
      this.$refs.addIntervalDropdown.hide()
    }
  }
}
</script>

<style>
  #add-interval-dropdown {
    .dropdown-menu {
      width: 260px !important;
    }
  }
</style>
