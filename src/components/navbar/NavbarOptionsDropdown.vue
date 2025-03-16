<template>
  <b-nav-item-dropdown
    text="Options"
    boundary="viewport"
    no-caret
    @show="refreshNotificationsEnabled"
  >
    <b-dropdown-item-button
      v-b-tooltip.hover.left="notificationsEnabled ? 'Notifications are enabled (to disable, revoke in URL settings)' : 'Enable notifications'"
      :disabled="notificationsEnabled"
      @click.stop="toggleEnableNotifications"
    >
      <input
        type="checkbox"
        :checked="notificationsEnabled"
        :disabled="notificationsEnabled"
      > Enable Notifications
    </b-dropdown-item-button>
    <b-dropdown-item-button>
      <b-form-checkbox v-model="timeFormat24" class="time-format-checkbox">
        Use 24-hour Clock
      </b-form-checkbox>
    </b-dropdown-item-button>
    <b-dropdown-divider />
    <b-dropdown-text>
      App version: {{ $appVersion }}
    </b-dropdown-text>
    <b-dropdown-item-button
      v-if="isInElectron"
      @click="checkForUpdates"
    >
      Check for Updates
    </b-dropdown-item-button>
  </b-nav-item-dropdown>
</template>

<script>
import { mapActions } from 'vuex'
import notifications from '../../lib/notifications'
import isElectron from '../../lib/isElectron'

export default {
  name: 'NavbarOptionsDropdown',
  
  mixins: [notifications],
  
  data () {
    return {
      isInElectron: isElectron()
    }
  },
  
  computed: {
    timeFormat24: {
      get () {
        return this.$store.state.settings.timeFormat24
      },
      set (value) {
        this.updateSetting(
          { key: 'timeFormat24', value }
        )
      }
    }
  },
  
  methods: {
    ...mapActions([
      'updateSetting'
    ]),
    
    checkForUpdates () {
      window.electronAPI.checkForUpdates()
    }
  }
}
</script>

<style scoped>
.time-format-checkbox {
  color: #37352F;
}
</style>
