<template>
  <b-nav-item-dropdown
    boundary="viewport"
    @show="refreshNotificationsEnabled"
  >
    <template #text>
      <font-awesome-icon icon="cog" />
      Options
    </template>
    <b-dropdown-item-button
      :title="notificationsEnabled ? 'Notifications are enabled (to disable, revoke in URL settings)' : 'Enable notifications'"
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
      <b-form-checkbox v-model="timeFormat24">
        Use 24-hour Clock
      </b-form-checkbox>
    </b-dropdown-item-button>
  </b-nav-item-dropdown>
</template>

<script>
import { mapActions } from 'vuex'
import notifications from '../../lib/notifications'

export default {
  name: 'NavbarOptionsDropdown',
  
  mixins: [notifications],
  
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
    ])
  }
}
</script>

<style scoped>

</style>
