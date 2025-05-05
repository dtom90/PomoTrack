<template>
  <b-dropdown
    id="add-interval-dropdown"
    ref="addIntervalDropdown"
    placement="right-start"
    boundary="viewport"
    variant="light"
    no-caret
    @show="dropdownWillShow"
    @shown="dropdownShown = true"
    @hide="dropdownWillHide"
    @hidden="dropdownShown = false"
    auto-close="outside"
  >
    <template v-slot:button-content>
      <font-awesome-icon
        v-if="logId"
        icon="ellipsis-v"
      />
      <img
        v-else
        src="@/assets/icons/add-to-bottom.svg"
        alt="Add interval"
      >
    </template>

    <b-dropdown-item
      v-if="isActiveLog"
      disabled
    >
      Stop Timer to Update Interval
    </b-dropdown-item>

    <BDropdownForm
      v-else
      :disabled="isActiveLog"
      @keydown.enter="onSubmit"
    >
      <b-form-group>
        <font-awesome-icon :icon="startLockIcon" />
        Started:
        <VueCtkDateTimePicker
          :model-value="startTime"
          :format="displayDateTimeFormat()"
          :right="true"
          @update:model-value="onStartTimeInput"
        />
      </b-form-group>

      <b-form-group>
        <font-awesome-icon :icon="durationLockIcon" />
        Duration:
        <BInputGroup append="Minutes">
          <BFormInput
            ref="appendMinutesInput"
            :model-value="durationMinutes"
            :state="durationMinutes > 0 ? null : false"
            aria-describedby="input-live-feedback"
            type="number"
            @update:model-value="onDurationMinutesInput"
            @blur="handleBlur"
          />
          <b-form-invalid-feedback id="input-live-feedback">
            Duration must be greater than 0
          </b-form-invalid-feedback>
        </BInputGroup>
      </b-form-group>

      <b-form-group>
        <font-awesome-icon :icon="stopLockIcon" />
        Stopped:
        <VueCtkDateTimePicker
          :model-value="stopTime"
          :format="displayDateTimeFormat()"
          :right="true"
          @update:model-value="onStopTimeInput"
        />
      </b-form-group>

      <BButton
        variant="primary"
        class="w-100"
        :disabled="durationMinutes <= 0"
        @click="onSubmit"
      >
        {{ logId ? 'Update Interval' : 'Add Interval' }}
      </BButton>
      <BButton
        v-if="logId"
        variant="danger"
        class="w-100 mt-3"
        @click="deleteInterval({ logId })"
      >
        Delete Interval
      </BButton>
    </BDropdownForm>
  </b-dropdown>
</template>

<script>
import { mapActions } from 'vuex'
import time from '../lib/time'
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker'
import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css'

export default {
  name: 'IntervalDropdownForm',

  components: {
    VueCtkDateTimePicker
  },

  mixins: [time],

  props: {
    taskId: {
      type: String,
      default: null
    },
    logId: {
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
      anchored: ['stopTime', (this.logId ? 'startTime' : 'durationMinutes')],
      log: null
    }
  },

  computed: {
    startLockIcon () {
      return this.anchored.includes('startTime') ? 'lock' : 'unlock'
    },
    durationLockIcon () {
      return this.anchored.includes('durationMinutes') ? 'lock' : 'unlock'
    },
    stopLockIcon () {
      return this.anchored.includes('stopTime') ? 'lock' : 'unlock'
    },
    isActiveLog () {
      return this.log !== null && this.log.stopped === null
    }
  },

  methods: {
    ...mapActions([
      'addInterval',
      'getLogById',
      'updateInterval',
      'deleteInterval'
    ]),

    async dropdownWillShow () {
      if (this.logId) {
        this.log = await this.getLogById({ logId: this.logId })
        this.startTime = this.displayDateTimeHuman(this.log.started)
        this.durationMinutes = this.msToMinutes(this.log.timeSpent)
        this.stopTime = this.log.stopped ? this.displayDateTimeHuman(this.log.stopped) : null
      } else {
        this.stopTime = this.displayDateTimeHuman()
        this.updateStartTime()
      }
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

    onSubmit (event) {
      this.intentionalEnter = true
      event.preventDefault()
      if (this.logId) {
        this.updateInterval({
          logId: this.logId,
          started: this.stringToMs(this.startTime),
          timeSpent: this.minutesToMs(this.durationMinutes),
          stopped: this.stringToMs(this.stopTime)
        })
      } else {
        this.addInterval({
          taskId: this.taskId,
          started: this.stringToMs(this.startTime),
          timeSpent: this.minutesToMs(this.durationMinutes),
          stopped: this.stringToMs(this.stopTime)
        })
      }
      this.$refs.addIntervalDropdown.hide()
    }
  }
}
</script>

<style>
  #add-interval-dropdown-menu {
    width: 270px !important;
  }
</style>
