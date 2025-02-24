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

new Vue({
  store,
  mounted () {
    if (isElectron()) {
      persistStorage()
    }
    this.$store.dispatch('loadInitialData')
  },
  render: h => h(App)
}).$mount('#app')
