<template>
  <div
    class="dial-container"
    :style="cssProps"
  >
    <div class="red-arc-reducer" />
    <div class="gray-outer-circle" />
    <div
      class="white-inner-circle d-flex justify-content-center align-items-center"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'CountdownDial',
  
  props: {
    active: {
      type: Boolean,
      default: true
    },
    size: {
      type: Number,
      default: 300
    },
    circleThickness: {
      type: Number,
      default: 18
    }
  },
  
  computed: {
    ...mapState([
      'tempState',
      'settings'
    ]),
    
    totalSeconds() {
      return (this.active ? this.settings.activeMinutes : this.settings.restMinutes) * 60
    },
    
    progress() {
      return this.tempState.secondsRemaining / this.totalSeconds
    },
    
    cssProps() {
      const arcAngle = this.progress * 100; // Grows counterclockwise as timer decreases
      
      return {
        '--rotation-factor': this.progress.toString() + 'turn',
        '--arc-angle': arcAngle.toString(),
        '--countdown-color': this.active ? 'red' : 'darkseagreen',
        '--dial-size': `${this.size}px`,
        '--circle-thickness': `${this.circleThickness}px`
      };
    }
  }
};
</script>

<style scoped lang="scss">
.dial-container {
  position: relative;
  width: var(--dial-size);
  height: var(--dial-size);
  margin: 0 auto;
}

.gray-outer-circle {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: gray var(--circle-thickness) solid;
}

.red-arc-reducer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
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
  background-color: white;
}
</style> 