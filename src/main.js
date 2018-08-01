// es6的补丁
import 'babel-polyfill'
import 'common/js/hack'
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'

import {SET_PLAY_HISTORY, SET_FAVORITE_LIST} from './store/mutation-types'
import {loadPlay, loadFavorite} from 'common/js/cache'
import {processSongsUrl} from 'common/js/song'

import fastclick from 'fastclick'
// 图片懒加载
import VueLazyLoad from 'vue-lazyload'

import 'common/stylus/index.styl'

/* eslint-disable no-unused-vars */
// import vConsole from 'vconsole'

fastclick.attach(document.body)

Vue.use(VueLazyLoad, {
  // 默认加载的图片
  loading: require('common/image/default.png')
})

const historySongs = loadPlay()
processSongsUrl(historySongs)
  .then(songs => {
    store.commit(SET_PLAY_HISTORY, songs)
  })

const favoriteSongs = loadFavorite()
processSongsUrl(favoriteSongs)
  .then(songs => {
    store.commit(SET_FAVORITE_LIST, songs)
  })

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
