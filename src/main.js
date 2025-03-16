import Vue from 'vue'
import App from './components/App.vue'
import packageInfo from '../package.json'

// Vuex store
import store from './store'
import isElectron from './lib/isElectron'
import { persistStorage } from './store/util'

// Bootstrap
import './lib/bootstrap'

// Font Awesome Icons
import { FontAwesomeIcon } from './lib/font-awesome-icons'
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

Vue.prototype.$appVersion = packageInfo.version

async function initApp () {
  const app = new Vue({
    store,
    render: h => h(App)
  })
  
  if (isElectron()) {
    persistStorage()
  }
  
  // Wait for data to load before mounting
  await store.dispatch('loadInitialData')
  
  // Mount the app after data is loaded
  app.$mount('#app')
}

initApp()
