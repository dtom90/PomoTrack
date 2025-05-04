/* eslint-disable no-new */
import { mapMutations } from 'vuex'
import isElectron from './isElectron'

// Handle Electron notifications

if (isElectron()) {
  window.electronAPI.onMessage((data) => {
    alert(data)
  })
}

export default {
  data () {
    return {
      updateTrigger: 0
    }
  },

  computed: {
    notificationsEnabled () {
      // eslint-disable-next-line no-unused-expressions,@typescript-eslint/no-unused-expressions
      this.updateTrigger // Trigger recomputation
      return 'Notification' in window && Notification && Notification.permission === 'granted'
    }
  },

  methods: {
    ...mapMutations([
      'saveNotification',
      'clearNotifications'
    ]),

    refreshNotificationsEnabled () {
      this.updateTrigger++
    },

    async toggleEnableNotifications () {
      if (!this.notificationsEnabled) {
        await this.requestPermission()
      }
    },

    async requestPermission () {
      if (!('Notification' in window && Notification)) { // Check if the browser supports notifications
        alert('This browser does not support system notifications')
      } else {
        const formerPermission = Notification.permission
        if (formerPermission === 'default') {
          const newPermission = await Notification.requestPermission()
          this.refreshNotificationsEnabled()
          if (newPermission === 'granted') {
            this.notify('Permissions to notify you have been granted!')
          } else if (newPermission === 'denied') {
            alert('Warning! Permissions to notify you have been denied! You may not tell when your Pomodoro timer ends.')
          }
        } else if (formerPermission === 'denied') {
          alert('Notification permissions are denied. Go to your URL and enable notifications.')
        }
      }
    },

    notify (message) {
      if (!('Notification' in window && Notification)) {
        alert(message)
      } else if (Notification.permission === 'granted') {
        const notification = new Notification(message)
        this.saveNotification({ notification }) // save notification for later closure
      } else {
        alert(message)
      }
    }
  }
}
