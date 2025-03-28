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

<script>
import { mapState } from 'vuex'

export default {
  name: 'TimerDial',
  
  props: {
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
  },
  
  computed: {
    ...mapState([
      'tempState',
      'settings'
    ]),
    
    totalSeconds () {
      return (this.tempState.active ? this.settings.activeMinutes : this.settings.restMinutes) * 60
    },
    
    progress () {
      return this.tempState.secondsRemaining / this.totalSeconds
    },
    
    cssProps () {
      const arcAngle = this.progress * 100 // Grows counterclockwise as timer decreases
      
      // Determine the countdown color based on disabled state
      const countdownColor = this.disabled
        ? 'var(--dark-quaternary)'
        : (this.tempState.active ? 'var(--error-red)' : 'darkseagreen')
      
      return {
        '--rotation-factor': this.progress.toString() + 'turn',
        '--arc-angle': arcAngle.toString(),
        '--countdown-color': countdownColor,
        '--dial-size': `${this.size}px`,
        '--circle-thickness': `${this.circleThickness}px`
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "../styles/_variables.scss";

#color-scheme {
  --error-red: #{$error-red};
  --dark-quaternary: #{$dark-quaternary};
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
  border: $dark-quaternary var(--circle-thickness) solid;
}

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
