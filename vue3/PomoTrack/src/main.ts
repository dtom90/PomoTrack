import './styles/main.scss';

// Vuex store
import store from './store/index.js'

// Bootstrap
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

// Font Awesome Icons
import { FontAwesomeIcon } from './lib/font-awesome-icons.js'

import packageInfo from '../package.json'

import { createApp } from 'vue'
import { createBootstrap } from 'bootstrap-vue-next'

import App from './components/App.vue'

const app = createApp(App)

app.config.globalProperties.$appVersion = packageInfo.version

app.component('font-awesome-icon', FontAwesomeIcon)
app.use(store)
app.use(createBootstrap())
app.mount('#app')

// Vue.config.productionTip = false

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
