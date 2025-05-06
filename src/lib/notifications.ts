import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import isElectron from './isElectron'
import type { ElectronAPI } from '@/types'

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

if (isElectron() && window.electronAPI) {
  window.electronAPI.onMessage((data: unknown) => {
    console.log('Received electron message in notifications module:', data)
    alert(`Electron Message: ${String(data)}`)
  })
}

export function useNotifications () {
  const store = useStore()
  const updateTrigger = ref(0)

  const notificationsEnabled = computed(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    updateTrigger.value // Depend on updateTrigger for reactivity
    return (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification?.permission === 'granted'
    )
  })

  const refreshNotificationsEnabled = (): void => {
    updateTrigger.value++
  }

  const notify = (message: string): void => {
    if (!('Notification' in window && Notification)) {
      alert(message)
    } else if (Notification.permission === 'granted') {
      const notification = new Notification('PomoTrack', { body: message })
      store.commit('saveNotification', { notification })
    } else {
      alert(message)
    }
  }

  const requestPermission = async (): Promise<void> => {
    if (!('Notification' in window && Notification)) {
      alert('This browser does not support system notifications')
    } else {
      const formerPermission = Notification.permission
      if (formerPermission === 'default') {
        const newPermission = await Notification.requestPermission()
        refreshNotificationsEnabled()
        if (newPermission === 'granted') {
          notify('Permissions to notify you have been granted!')
        } else if (newPermission === 'denied') {
          alert(
            'Warning! Permissions to notify you have been denied! You may not tell when your Pomodoro timer ends.'
          )
        }
      } else if (formerPermission === 'denied') {
        alert(
          'Notification permissions are denied. Go to your URL and enable notifications.'
        )
      }
    }
  }

  const toggleEnableNotifications = async (): Promise<void> => {
    if (!notificationsEnabled.value) {
      await requestPermission()
    }
  }

  const clearNotifications = (): void => {
    store.commit('clearNotifications')
  }

  return {
    notificationsEnabled,
    refreshNotificationsEnabled,
    toggleEnableNotifications,
    notify,
    clearNotifications
  }
}
