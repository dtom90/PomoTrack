import { defineComponent } from 'vue'
import { mapMutations } from 'vuex'
import isElectron from './isElectron'
import type { ElectronAPI } from '../../preload'

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

if (isElectron() && window.electronAPI) {
  window.electronAPI.onMessage((data: unknown) => {
    alert(String(data))
  })
}

export default defineComponent({
  data () {
    return {
      updateTrigger: 0 as number
    }
  },

  computed: {
    notificationsEnabled (): boolean {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      this.updateTrigger
      return typeof window !== 'undefined' && 'Notification' in window && Notification?.permission === 'granted'
    }
  },

  methods: {
    ...mapMutations({
        saveNotification: 'saveNotification',
        clearNotifications: 'clearNotifications'
    }),

    refreshNotificationsEnabled (): void {
      this.updateTrigger++
    },

    async toggleEnableNotifications (): Promise<void> {
      if (!this.notificationsEnabled) {
        await this.requestPermission()
      }
    },

    async requestPermission (): Promise<void> {
      if (typeof window === 'undefined' || !('Notification' in window) || !Notification) {
        alert('This browser does not support system notifications')
      } else {
        const formerPermission = Notification.permission
        if (formerPermission === 'default') {
          const newPermission: NotificationPermission = await Notification.requestPermission()
          this.refreshNotificationsEnabled()
          if (newPermission === 'granted') {
            this.notify('Permissions to notify you have been granted!')
          }
        } else if (formerPermission === 'denied') {
            alert('Notification permissions were previously denied. Please enable them in your browser settings.')
        }
      }
    },

    notify (message: string): void {
      if (!('Notification' in window && Notification)) {
        alert(message)
      } else if (Notification.permission === 'granted') {
        new Notification('PomoTrack', { body: message })
      } else if (Notification.permission !== 'denied') {
      }
    }
  }
})
