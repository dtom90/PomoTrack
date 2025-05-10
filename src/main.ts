import './styles/main.scss';

import { createApp } from 'vue'

import store from './store'
import { initializeStorage, loadInitialData } from './store/storageManager.ts'

import { createBootstrap } from 'bootstrap-vue-next'
import { FontAwesomeIcon } from './lib/font-awesome-icons.ts'

import packageInfo from '../package.json'

import App from './components/App.vue'

const app = createApp(App)

app.config.globalProperties.$appVersion = packageInfo.version

app.use(store)
app.use(createBootstrap({ components: {
  BDropdown: { autoClose: 'outside' } // close dropdown only when clicking outside by default
} }))
app.component('font-awesome-icon', FontAwesomeIcon)

async function initializeApp() {

  app.mount('#app');

  try {
    await initializeStorage()
    await loadInitialData(store)
  } catch (e) {
    const errMessage = `Error during storage initialization: ${e}`
    alert(errMessage)
    // eslint-disable-next-line no-console
    console.error(errMessage)
  }
}

initializeApp();
