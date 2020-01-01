import * as types from './mutation-types'

const mutations = {
  // 设置歌手
  [types.SET_SINGER](state, singer) {
    state.singer = singer
  },

  // 设置播放状态
  [types.SET_PLAYING_STATE](state, flag) {
    state.playing = flag
  },

  // 设置全屏状态
  [types.SET_FULL_SCREEN](state, flag) {
    state.fullScreen = flag
  },

  // 设置播放列表
  [types.SET_PLAYLIST](state, list) {
    state.playlist = list
  },

  // 设置顺序播放列表
  [types.SET_SEQUENCE_LIST](state, list) {
    state.sequenceList = list
  },

  // 设置播放模式
  [types.SET_PLAY_MODE](state, mode) {
    state.mode = mode
  },
  // 设置当前播放歌曲索引
  [types.SET_CURRENT_INDEX](state, index) {
    state.currentIndex = index
  },

  // 设置歌单
  [types.SET_DISC](state, disc) {
    state.disc = disc
  },

  // 设置排行榜列表
  [types.SET_TOP_LIST](state, topList) {
    state.topList = topList
  },

  // 设置搜索历史
  [types.SET_SEARCH_HISTORY](state, history) {
    state.searchHistory = history
  },

  // 设置播放历史
  [types.SET_PLAY_HISTORY](state, history) {
    state.playHistory = history
  },

  // 设置收藏歌曲列表
  [types.SET_FAVORITE_LIST](state, list) {
    state.favoriteList = list
  }
}

export default mutations
