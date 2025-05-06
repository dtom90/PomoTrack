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
        <BButton
          id="skip-btn"
          variant="light"
          class="mx-2 circular-button"
          title="Skip current interval"
          :disabled="disabled || editing"
          size="sm"
          @click="onSkipTimerClick"
        >
          <font-awesome-icon icon="times" />
        </BButton>

        <BButton
          id="play-pause-btn"
          variant="light"
          class="mx-2 circular-button"
          :disabled="disabled || editing"
          :title="playPauseTitle"
          size="lg"
          @click="toggleTimer"
        >
          <font-awesome-icon :icon="playPauseIcon" />
        </BButton>

        <BDropdown
          id="countdown-settings-dropdown"
          right
          variant="light"
          class="mx-2"
          toggle-class="circular-button btn-sm"
          no-caret
          placement="right-start"
          boundary="viewport"
          :disabled="disabled"
        >
          <template #button-content>
            <font-awesome-icon icon="gear" />
          </template>

          <BDropdownForm>
            <b-form-checkbox
              id="continueTimer"
              v-model="continueOnComplete"
            >
              <div>Continue Timer </div>
              <div>on Interval Complete</div>
            </b-form-checkbox>

            <BDropdownDivider />

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
                <BFormInput
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
          </BDropdownForm>
        </BDropdown>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import CountdownTimer from '../lib/CountdownTimer'
import { useNotifications } from '../lib/notifications'
import { useTime } from '../lib/time'
import TimerDial from './TimerDial.vue'
import type { TempState } from '@/types'

// Props
const props = defineProps({
  taskId: {
    type: String,
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

// Store and Notifications
const store = useStore()
const { requestNotificationPermission, notify, clearNotifications } = useNotifications()
const { settings, tempState, displayCountdownTime } = useTime()

// State
const timer = ref<CountdownTimer | null>(null)
const editing = ref(false)
const newActiveMinutes = ref(0)
const newRestMinutes = ref(0)
const secondReminderDisplayed = ref(false)

// Computed Properties
const totalSeconds = computed(() => {
  return (tempState.value.active ? (settings.value.activeMinutes ?? 0) : (settings.value.restMinutes ?? 0)) * 60
})

const progress = computed(() => {
  if (!totalSeconds.value) {
    return {
      '--rotation-factor': '0turn',
      '--arc-angle': '0',
      '--countdown-color': tempState.value.active ? 'red' : 'darkseagreen'
    }
  }
  const currentProgress = tempState.value.secondsRemaining / totalSeconds.value
  const arcAngle = currentProgress * 100 // Grows counterclockwise as timer decreases
  return {
    '--rotation-factor': currentProgress.toString() + 'turn',
    '--arc-angle': arcAngle.toString(),
    '--countdown-color': tempState.value.active ? 'red' : 'darkseagreen'
  }
})

const playPauseIcon = computed(() => {
  return tempState.value.overtime ? 'stop' : tempState.value.running ? 'pause' : 'play'
})

const playPauseTitle = computed(() => {
  return tempState.value.overtime ? 'Stop' : (tempState.value.running ? 'Pause' : 'Start') + ' timer'
})

const cssProps = computed(() => {
  return progress.value
})

const continueOnComplete = computed({
  get: () => settings.value.continueOnComplete,
  async set (value) {
    await store.dispatch('updateSetting', {
      key: 'continueOnComplete',
      value
    })
  }
})

const secondReminderEnabled = computed({
  get: () => settings.value.secondReminderEnabled,
  async set (value) {
    await store.dispatch('updateSetting', {
      key: 'secondReminderEnabled',
      value
    })
  }
})

const secondReminderMinutes = computed({
  get: () => settings.value.secondReminderMinutes ?? 0,
  async set (value) {
    await store.dispatch('updateSetting', {
      key: 'secondReminderMinutes',
      value: Number(value)
    })
  }
})

const secondReminderSeconds = computed(() => {
  return -((secondReminderMinutes.value ?? 0) * 60)
})

// Methods
const updateTempState = (payload: { key: keyof TempState, value: TempState[keyof TempState] }) => {
  store.commit('updateTempState', payload)
}

const onTimerClick = () => {
  if (props.disabled || tempState.value.running) {
    return
  }
  editing.value = true
  if (tempState.value.active) {
    newActiveMinutes.value = settings.value.activeMinutes ?? 0
  } else {
    newRestMinutes.value = settings.value.restMinutes ?? 0
  }
}

const onSkipTimerClick = () => {
  clearNotifications()
  finishTimer()
}

const changeMinutes = async () => {
  await store.dispatch('updateSetting', {
    key: tempState.value.active ? 'activeMinutes' : 'restMinutes',
    value: tempState.value.active ? newActiveMinutes.value : newRestMinutes.value
  })
  updateTempState({ key: 'secondsRemaining', value: totalSeconds.value })
  timer.value?.setSeconds(totalSeconds.value)
  editing.value = false
}

const toggleTimer = () => {
  requestNotificationPermission()
  clearNotifications()

  if (tempState.value.overtime) {
    updateTempState({ key: 'overtime', value: false })
    resetTimer()
  } else if (tempState.value.running) {
    timer.value?.pause()
    endInterval()
    updateTempState({ key: 'running', value: false })
  } else {
    if (tempState.value.active) { // start an active interval
      store.dispatch('startTask', { taskId: props.taskId })
    } else { // this is a rest interval, simply toggle running
      updateTempState({ key: 'running', value: !tempState.value.running })
    }
    timer.value?.start()
  }
}

const decrementTimer = (secondsRemaining: number) => {
  if (tempState.value.running) {
    updateTempState({ key: 'secondsRemaining', value: secondsRemaining })
    if (tempState.value.active) {
      store.dispatch('updateTaskTimer', { taskId: props.taskId })
      if (tempState.value.overtime && !secondReminderDisplayed.value && tempState.value.secondsRemaining <= secondReminderSeconds.value) {
        notify('Finished Working, Take a Break!')
        secondReminderDisplayed.value = true
      }
    }
  } else {
    if (tempState.value.overtime) {
      updateTempState({ key: 'overtime', value: false })
      resetTimer()
    } else {
      timer.value?.pause()
    }
  }
}

const endInterval = () => {
  if (tempState.value.active && tempState.value.running) {
    store.dispatch('stopTask')
  }
}

const finishTimer = (secondsRemaining: number | null = null) => {
  const fromCountdownFinish = typeof secondsRemaining === 'number'
  let doNotify = false

  if (fromCountdownFinish) {
    updateTempState({ key: 'secondsRemaining', value: secondsRemaining! })
    if (!tempState.value.overtime) {
      doNotify = true
      if (continueOnComplete.value && tempState.value.active) {
        updateTempState({ key: 'overtime', value: true })
      }
    }
  } else if (tempState.value.overtime) {
    updateTempState({ key: 'overtime', value: false })
  }

  if (doNotify) {
    if (tempState.value.active) {
      notify('Finished Working, Take a Break!')
    } else {
      notify('Finished Break, Time to Work!')
    }
  }

  if (!fromCountdownFinish || !tempState.value.active || !tempState.value.overtime) {
    resetTimer()
  } else {
    decrementTimer(tempState.value.secondsRemaining)
  }
}

const resetTimer = () => {
  timer.value?.clear()
  endInterval()
  updateTempState({ key: 'activeTaskID', value: null })
  updateTempState({ key: 'running', value: false })
  updateTempState({ key: 'active', value: !tempState.value.active })
  timer.value = new CountdownTimer(totalSeconds.value, decrementTimer, finishTimer)
  updateTempState({ key: 'secondsRemaining', value: totalSeconds.value })
  secondReminderDisplayed.value = false
}

// Watchers
watch(() => settings.value.activeMinutes, () => {
  if (tempState.value.active) {
    timer.value = new CountdownTimer(totalSeconds.value, decrementTimer, finishTimer)
    // If timer was running, preserve state? Current logic resets. For simplicity, stick to reset.
    // If not running and active, update seconds remaining for new activeMinutes
    if (!tempState.value.running) {
      updateTempState({ key: 'secondsRemaining', value: totalSeconds.value })
    }
  }
})

// Lifecycle Hooks
onMounted(() => {
  updateTempState({ key: 'secondsRemaining', value: totalSeconds.value })
  timer.value = new CountdownTimer(totalSeconds.value, decrementTimer, finishTimer)
})
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
