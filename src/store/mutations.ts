import * as types from './mutation-types'

const mutations = {
  // 设置歌手
  [types.SET_SINGER](state: any, singer: object) {
    state.singer = singer
  },

  // 设置是否播放
  [types.SET_PLAYING_STATE](state: any, flag: boolean) {
    state.playing = flag
  },

  // 设置是否全屏
  [types.SET_FULL_SCREEN](state: any, flag: boolean) {
    state.fullScreen = flag
  },

  // 设置播放列表
  [types.SET_PLAYLIST](state: any, list: any[]) {
    state.playlist = list
  },

  // 设置顺序播放列表
  [types.SET_SEQUENCE_LIST](state: any, list: any[]) {
    state.sequenceList = list
  },

  // 设置播放模式
  [types.SET_PLAY_MODE](state: any, mode: number) {
    state.mode = mode
  },

  // 设置当前播放歌曲索引
  [types.SET_CURRENT_INDEX](state: any, index: number) {
    state.currentIndex = index
  },

  // 设置歌单
  [types.SET_DISC](state: any, disc: object) {
    state.disc = disc
  },

  // 设置排行榜列表
  [types.SET_TOP_LIST](state: any, topList: any[]) {
    state.topList = topList
  },

  // 设置搜索历史
  [types.SET_SEARCH_HISTORY](state: any, history: object) {
    state.searchHistory = history
  },

  // 设置播放历史
  [types.SET_PLAY_HISTORY](state: any, history: object) {
    state.playHistory = history
  },

  // 设置收藏歌曲列表
  [types.SET_FAVORITE_LIST](state: any, list: any[]) {
    state.favoriteList = list
  }
}

export default mutations