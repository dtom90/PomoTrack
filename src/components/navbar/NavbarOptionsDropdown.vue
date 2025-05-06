<template>
  <b-nav-item-dropdown
    text="Options"
    boundary="viewport"
    no-caret
    @show="refreshNotificationsEnabled"
  >
    <BDropdownItemButton
      vBTooltip.hover.left="notificationsEnabled ? 'Notifications are enabled (to disable, revoke in URL settings)' : 'Enable notifications'"
      :disabled="notificationsEnabled"
      @click.stop="toggleEnableNotifications"
    >
      <input
        type="checkbox"
        :checked="notificationsEnabled"
        :disabled="notificationsEnabled"
      >
      Enable Notifications
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
      App version: {{ appVersion }}
    </BDropdownText>
    <BDropdownItemButton
      v-if="isInElectron"
      @click="checkForUpdates"
    >
      Check for Updates
    </BDropdownItemButton>
  </b-nav-item-dropdown>
</template>

<script setup lang="ts">
import { ref, computed, getCurrentInstance } from 'vue'
import { useStore } from 'vuex'
import isElectron from '@/lib/isElectron'
import { useNotifications } from '@/lib/notifications'

// Global properties (e.g., app version)
const appVersion = getCurrentInstance()?.appContext.config.globalProperties.$appVersion ?? 'N/A'

// Store
const store = useStore()

// --- Use Notifications Composable ---
const { notificationsEnabled, refreshNotificationsEnabled, toggleEnableNotifications } = useNotifications()

// --- Component Specific State ---
const isInElectron = ref(isElectron())

// --- Component Specific Computed ---
const timeFormat24 = computed({
  get: () => store.state.settings.timeFormat24 as boolean,
  set: (value: boolean) => {
    store.dispatch('updateSetting', { key: 'timeFormat24', value })
  }
})

// --- Component Specific Methods ---
const checkForUpdates = () => {
  if (window.electronAPI) {
    window.electronAPI.checkForUpdates()
  }
}

</script>

<style scoped>
.time-format-checkbox {
  margin-bottom: 0; /* Align checkbox properly in dropdown */
}
</style>
