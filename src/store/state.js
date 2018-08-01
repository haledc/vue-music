import {playMode} from "common/js/config"
import {loadSearch} from "common/js/cache"

const state = {
  // 歌手
  singer: {},
  // 是否播放
  playing: false,
  // 是否全屏
  fullScreen: false,
  // 播放列表
  playlist: [],
  // 顺序播放列表
  sequenceList: [],
  // 播放模式（默认是顺序播放）
  mode: playMode.sequence,
  // 当前播放歌曲索引
  currentIndex: -1,
  // 推荐页面歌单
  disc: {},
  // 排行榜列表
  topList: {},
  // 搜索历史 【从本地缓存中获取】
  searchHistory: loadSearch(),
  // 播放历史
  playHistory: [],
  // 收藏歌曲列表
  favoriteList: []
}

export default state
