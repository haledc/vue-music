import { createApp } from "vue";
import VueLazyLoad from "vue-lazyload";
import VueCompositionApi from "@vue/composition-api";

import App from "./App";
import router from "./router";
import store from "./store";
import { SET_PLAY_HISTORY, SET_FAVORITE_LIST } from "./store/mutation-types";
import { loadPlay, loadFavorite } from "./utils/cache";
import { processSongsUrl } from "./utils/song";

import "./assets/styles/index.scss";

// 设置播放列表
const historySongs = loadPlay();
processSongsUrl(historySongs).then((songs) => {
  store.commit(SET_PLAY_HISTORY, songs);
});

// 设置喜欢的歌曲
const favoriteSongs = loadFavorite();
processSongsUrl(favoriteSongs).then((songs) => {
  store.commit(SET_FAVORITE_LIST, songs);
});

createApp(App)
  .use(router)
  .use(store)
  .mount("#app");
