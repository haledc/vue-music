import Vue from 'vue'
import VueLazyLoad from 'vue-lazyload'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'
import './assets/styles/index.scss'

Vue.config.productionTip = false

Vue.use(VueLazyLoad, {
  loading: require('./assets/images/default.png')
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
