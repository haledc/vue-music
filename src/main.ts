import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'
import './assets/styles/index.styl'
import VueLazyLoad from 'vue-lazyload'

Vue.config.productionTip = false

Vue.use(VueLazyLoad, {
  loading: require('./assets/images/default.png')
})

new Vue({
  router,
  store,
  render: (h: any) => h(App)
}).$mount('#app')
