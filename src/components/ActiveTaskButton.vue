<template v-if="activeTask">
  <button
    id="active-task-container"
    class="btn btn-light border d-flex justify-content-center align-items-center"
    @click="selectTask({ taskId: activeTask.id })"
  >
    <CountdownDial size="60" circle-thickness="9" />
    <span id="active-task-name">{{ activeTask.name }}</span>
  </button>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import CountdownDial from './CountdownDial.vue'

export default {
  name: 'ActiveTaskButton',
  
  components: {
    CountdownDial
  },
  
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

<style scoped>
#active-task-container {
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  width: 100%;
}

#active-indicator-icon {
  color: red;
  width: 4rem;
  height: 4rem;
  margin: 2px 0.75rem 2px 0.75rem;
}

#active-task-name {
  font-weight: 600;
  font-size: xx-large;
  text-align: center;
  margin-left: 10px;
}
</style>
