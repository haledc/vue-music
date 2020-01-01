import { playMode } from '../utils/config'
import { loadSearch } from '../utils/cache'

const state = {
  singer: {}, // 歌手信息
  playing: false, // 是否播放
  fullScreen: false, // 是否全屏
  playlist: [], // 播放列表
  sequenceList: [], // 顺序播放列表
  mode: playMode.sequence, // 播放模式（默认是顺序播放）
  currentIndex: -1, // 当前播放歌曲索引
  disc: {}, // 推荐页面歌单
  topList: {}, // 排行榜列表
  searchHistory: loadSearch(), // 搜索历史 【从本地缓存中获取】
  playHistory: [], // 播放历史
  favoriteList: [] // 收藏歌曲列表
}

export default state
