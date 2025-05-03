import './styles/main.scss';

// Vuex store
import store from './store/index.js'

// Bootstrap
import './lib/bootstrap'

// Font Awesome Icons
import { FontAwesomeIcon } from './lib/font-awesome-icons.js'

import { createApp } from 'vue'
import { createBootstrap } from 'bootstrap-vue-next'
import App from './components/App.vue'

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)
app.use(store)
app.use(createBootstrap())
app.mount('#app')

// import Vue from 'vue'
// import App from './components/App.vue'
// import packageInfo from '../package.json'

// Vue.config.productionTip = false

// Vue.prototype.$appVersion = packageInfo.version

// async function initApp () {
//   const app = new Vue({
//     store,
//     render: h => h(App)
//   })
  
//   if (isElectron()) {
//     persistStorage()
//   }
  
//   // Wait for data to load before mounting
//   await store.dispatch('loadInitialData')
  
//   // Mount the app after data is loaded
//   app.$mount('#app')
// }

// initApp()
