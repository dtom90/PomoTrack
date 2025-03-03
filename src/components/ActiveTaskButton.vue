<template v-if="activeTask">
  <div class="d-flex justify-content-center align-items-center">
    <button
      id="active-task-button"
      class="btn btn-light border d-flex justify-content-center align-items-center"
      @click="selectTask({ taskId: activeTask.id })"
    >
      <TimerDial
        :size="60"
        :circle-thickness="9"
      />
      <div id="active-task-name-and-time">
        <div id="active-task-time">
          {{ displayCountdownTime }}
        </div>
        <div id="active-task-name">
          {{ activeTask.name }}
        </div>
      </div>
    </button>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import TimerDial from './TimerDial.vue'
import time from '../lib/time'
export default {
  name: 'ActiveTaskButton',
  
  components: {
    TimerDial
  },

  mixins: [
    time
  ],
  
  computed: {
    ...mapGetters([
      'activeTask'
    ])
  },
  
  methods: {
    ...mapActions(['selectTask'])
  }
}
</script>

<style scoped lang="scss">
@import "../styles/_variables.scss";

#active-task-button {
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  width: 400px;
}

#active-task-name-and-time {
  font-weight: $font-weight-bold;
  margin-left: 10px;
  text-align: left;
}

#active-task-name {
  font-size: $font-size-base;
}

#active-task-time {
  font-size: $font-size-large;
}
</style>
