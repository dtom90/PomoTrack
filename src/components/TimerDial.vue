<template>
  <div id="color-scheme">
    <div :style="cssProps">
      <div class="dial-container">
        <div class="red-arc-reducer" />
        <div class="gray-outer-circle" />
        <div
          class="white-inner-circle d-flex justify-content-center align-items-center"
        >
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTime } from '../lib/time'

const props = defineProps({
  size: {
    type: Number,
    default: 300
  },
  circleThickness: {
    type: Number,
    default: 18
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const { settings, tempState } = useTime()

const totalSeconds = computed(() => {
  return (
    (tempState.value.active
      ? (settings.value.activeMinutes ?? 0)
      : (settings.value.restMinutes ?? 0)) * 60
  )
})

const progress = computed(() => {
  if (!totalSeconds.value) return 0 // Avoid division by zero
  return tempState.value.secondsRemaining / totalSeconds.value
})

const cssProps = computed(() => {
  const currentProgressValue = progress.value // progress already handles totalSeconds being 0
  const arcAngle = currentProgressValue * 100 // Grows counterclockwise as timer decreases

  // Determine the countdown color based on disabled state
  const countdownColor = props.disabled
    ? 'var(--dark-quaternary)'
    : tempState.value.active
      ? 'var(--error-red)'
      : 'darkseagreen'

  return {
    '--rotation-factor': currentProgressValue.toString() + 'turn',
    '--arc-angle': arcAngle.toString(),
    '--countdown-color': countdownColor,
    '--dial-size': `${props.size}px`,
    '--circle-thickness': `${props.circleThickness}px`
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/_variables.scss' as variables;

#color-scheme {
  --error-red: #{variables.$error-red};
  --dark-quaternary: #{variables.$dark-quaternary};
}

.dial-container {
  position: relative;
  width: var(--dial-size) !important;
  height: var(--dial-size) !important;
}

.gray-outer-circle {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: variables.$dark-quaternary var(--circle-thickness) solid;
}

//noinspection CssInvalidFunction,CssInvalidPropertyValue
.red-arc-reducer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  mask: radial-gradient(
    transparent 0,
    transparent calc(71% - var(--circle-thickness)),
    black calc(71% - var(--circle-thickness)),
    black 71%,
    transparent 71%
  );
  -webkit-mask: radial-gradient(
    transparent 0,
    transparent calc(71% - var(--circle-thickness)),
    black calc(71% - var(--circle-thickness)),
    black 71%,
    transparent 71%
  );
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

.white-inner-circle {
  position: absolute;
  top: 0;
  left: 0;
  width: calc(100% - var(--circle-thickness) * 2);
  height: calc(100% - var(--circle-thickness) * 2);
  border-radius: 50%;
  margin: var(--circle-thickness);
  z-index: 2;
  background-color: transparent;
}
</style>
