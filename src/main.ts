/* eslint-disable no-console */
import './styles/main.scss';

import { createApp } from 'vue'

import store from './store/index.ts'

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
  try {
    await store.dispatch('loadInitialData');
    console.log('Initial data loaded successfully.');
  } catch (error) {
    console.error('Failed to load initial data:', error);
  }

  app.mount('#app');
}

initializeApp();
