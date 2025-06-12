<template>
  <BDropdown
    id="add-interval-dropdown"
    ref="addIntervalDropdown"
    placement="right-start"
    boundary="viewport"
    variant="light"
    no-caret
    @show="dropdownWillShow"
    @shown="onDropdownShown"
    @hide="onDropdownHidden"
    @hidden="onDropdownHidden"
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

    <BDropdownItem
      v-if="isActiveLog"
      disabled
    >
      Stop Timer to Update Interval
    </BDropdownItem>

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
          :format="displayDateTimeFormat"
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
          :format="displayDateTimeFormat"
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
        class="w-100"
        @click="deleteIntervalHandler"
      >
        Delete Interval
      </BButton>
    </BDropdownForm>
  </BDropdown>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import {
  msToMinutes,
  minutesToMs,
  stringToMs,
  useTime
} from '../lib/time'
// @ts-expect-error This library is not typed
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker'
import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css'
import type { BDropdown } from 'bootstrap-vue-next'
import type { TaskLog } from '@/types'

const props = defineProps({
  taskId: {
    type: String,
    default: null
  },
  logId: {
    type: String,
    default: null
  }
})

const store = useStore()
const { displayDateTimeFormat, displayDateTimeHuman: localDisplayDateTimeHumanFn } = useTime()

const addIntervalDropdown = ref<InstanceType<typeof BDropdown> | null>(null)
const appendMinutesInput = ref<HTMLInputElement | null>(null)

const dropdownShown = ref(false)
const startTime = ref<string | null>(null)
const durationMinutes = ref<number>(25)
const stopTime = ref<string | null>(localDisplayDateTimeHumanFn())
const anchored = ref<string[]>(props.logId ? ['stopTime', 'startTime'] : ['stopTime', 'durationMinutes'])
const log = ref<TaskLog | null>(null)

const startLockIcon = computed(() => anchored.value.includes('startTime') ? 'lock' : 'unlock')
const durationLockIcon = computed(() => anchored.value.includes('durationMinutes') ? 'lock' : 'unlock')
const stopLockIcon = computed(() => anchored.value.includes('stopTime') ? 'lock' : 'unlock')
const isActiveLog = computed(() => log.value !== null && log.value.stopped === null)

const updateStartTime = () => {
  if (stopTime.value && durationMinutes.value > 0) {
    const start = stringToMs(stopTime.value) - minutesToMs(durationMinutes.value)
    startTime.value = localDisplayDateTimeHumanFn(start)
  }
}

const updateDurationMinutes = () => {
  if (startTime.value && stopTime.value) {
    const duration = stringToMs(stopTime.value) - stringToMs(startTime.value)
    durationMinutes.value = msToMinutes(duration)
  }
}

const updateStopTime = () => {
  if (startTime.value && durationMinutes.value > 0) {
    const stop = stringToMs(startTime.value) + minutesToMs(durationMinutes.value)
    stopTime.value = localDisplayDateTimeHumanFn(stop)
  }
}

const dropdownWillShow = async () => {
  if (props.logId) {
    log.value = await store.dispatch('getLogById', { logId: props.logId })
    if (log.value) {
      startTime.value = localDisplayDateTimeHumanFn(log.value.started)
      durationMinutes.value = msToMinutes(log.value.timeSpent || 0)
      stopTime.value = log.value.stopped ? localDisplayDateTimeHumanFn(log.value.stopped) : null
      anchored.value = ['stopTime', 'startTime']
    }
  } else {
    durationMinutes.value = 25
    stopTime.value = localDisplayDateTimeHumanFn()
    updateStartTime()
    anchored.value = ['stopTime', 'durationMinutes']
    log.value = null
  }
}

const onStartTimeInput = (newValue: string) => {
  startTime.value = newValue
  if (!anchored.value.includes('startTime')) {
    anchored.value.shift()
    anchored.value.push('startTime')
  }
  if (anchored.value.includes('durationMinutes')) {
    updateStopTime()
  } else if (anchored.value.includes('stopTime')) {
    updateDurationMinutes()
  }
  if (anchored.value[1] === 'startTime') {
    if (stopTime.value && durationMinutes.value > 0 && anchored.value[0] === 'stopTime') {
      updateDurationMinutes()
    } else if (stopTime.value && durationMinutes.value > 0 && anchored.value[0] === 'durationMinutes') {
      updateStopTime()
    }
  } else {
    if (stopTime.value && durationMinutes.value > 0) {
      const calculatedStart = stringToMs(stopTime.value) - minutesToMs(durationMinutes.value)
      startTime.value = localDisplayDateTimeHumanFn(calculatedStart)
    }
  }
}

const onDurationMinutesInput = (newValue: string | number) => {
  durationMinutes.value = Math.max(0, typeof newValue === 'string' ? parseFloat(newValue) : newValue)
  if (!anchored.value.includes('durationMinutes')) {
    anchored.value.shift()
    anchored.value.push('durationMinutes')
  }
  if (anchored.value.includes('startTime')) {
    updateStopTime()
  } else if (anchored.value.includes('stopTime')) {
    updateStartTime()
  }
}

const onStopTimeInput = (newValue: string) => {
  stopTime.value = newValue
  if (!anchored.value.includes('stopTime')) {
    anchored.value.shift()
    anchored.value.push('stopTime')
  }
  if (anchored.value.includes('startTime')) {
    updateDurationMinutes()
  } else if (anchored.value.includes('durationMinutes')) {
    updateStartTime()
  }
}

const onSubmit = async () => {
  if (durationMinutes.value <= 0) {
    if (appendMinutesInput.value && typeof appendMinutesInput.value.focus === 'function') {
      appendMinutesInput.value.focus()
    }
    return
  }

  const intervalData = {
    started: stringToMs(startTime.value!),
    timeSpent: minutesToMs(durationMinutes.value),
    stopped: stopTime.value ? stringToMs(stopTime.value) : null,
    taskId: props.taskId,
    logId: props.logId
  }

  if (props.logId) {
    await store.dispatch('updateInterval', intervalData)
  } else {
    await store.dispatch('addInterval', intervalData)
  }
  if (addIntervalDropdown.value && typeof addIntervalDropdown.value.hide === 'function') {
    addIntervalDropdown.value.hide()
  }
}

const deleteIntervalHandler = async () => {
  if (props.logId) {
    await store.dispatch('deleteInterval', { logId: props.logId })
    if (addIntervalDropdown.value && typeof addIntervalDropdown.value.hide === 'function') {
      addIntervalDropdown.value.hide()
    }
  }
}

const handleBlur = () => {
  // Original method was empty, kept for consistency if any @blur binding relies on it
}

const onDropdownShown = () => {
  dropdownShown.value = true
}

const onDropdownHidden = () => {
  dropdownShown.value = false
  if (!props.logId) {
    durationMinutes.value = 25
    stopTime.value = localDisplayDateTimeHumanFn()
    updateStartTime()
    anchored.value = ['stopTime', 'durationMinutes']
    log.value = null
  }
}

watch(() => props.logId, (newLogId, oldLogId) => {
  if (newLogId !== oldLogId) {
    dropdownWillShow()
  }
})
</script>

<style>
/*noinspection CssUnusedSymbol*/
#add-interval-dropdown-menu {
  width: 270px !important;

  .b-form-group {
    margin-bottom: 0.5rem;
  }
}

</style>

<style scoped lang="scss">
#add-interval-dropdown-menu {
  .btn {
    margin-top: 0.5rem;
  }
}
</style>