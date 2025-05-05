<template>
  <b-nav-item-dropdown
    text="Options"
    boundary="viewport"
    no-caret
    @show="refreshNotificationsEnabled"
  >
    <BDropdownItemButton
      v-b-tooltip.hover.left="notificationsEnabled ? 'Notifications are enabled (to disable, revoke in URL settings)' : 'Enable notifications'"
      :disabled="notificationsEnabled"
      @click.stop="toggleEnableNotifications"
    >
      <input
        type="checkbox"
        :checked="notificationsEnabled"
        :disabled="notificationsEnabled"
      > Enable Notifications
    </BDropdownItemButton>
    <BDropdownItemButton>
      <b-form-checkbox
        v-model="timeFormat24"
        class="time-format-checkbox"
      >
        Use 24-hour Clock
      </b-form-checkbox>
    </BDropdownItemButton>
    <BDropdownDivider />
    <BDropdownText>
      App version: {{ $appVersion }}
    </BDropdownText>
    <BDropdownItemButton
      v-if="isInElectron"
      @click="checkForUpdates"
    >
      Check for Updates
    </BDropdownItemButton>
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

</style>
