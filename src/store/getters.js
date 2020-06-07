import Song from "../utils/song";

// 获取当前歌手
export const singer = (state) => state.singer;

// 获取播放状态
export const playing = (state) => state.playing;

// 获取全屏状态
export const fullScreen = (state) => state.fullScreen;

// 获取播放列表
export const playlist = (state) => state.playlist;

// 获取顺序播放列表
export const sequenceList = (state) => state.sequenceList;

// 获取当前播放模式
export const mode = (state) => state.mode;

// 获取当前播放歌曲索引
export const currentIndex = (state) => state.currentIndex;

// 获取当前播放歌曲（通过播放列表和播放歌曲索引获取）
export const currentSong = (state) => {
  return state.playlist[state.currentIndex] || {};
};

// 获取歌单
export const disc = (state) => state.disc;

// 获取排行榜列表
export const topList = (state) => state.topList;

// 获取搜索历史
export const searchHistory = (state) => state.searchHistory;

// 获取播放历史
export const playHistory = (state) => {
  return state.playHistory.map((song) => new Song(song));
};

// 获取收藏歌曲列表
export const favoriteList = (state) => {
  return state.favoriteList.map((song) => new Song(song));
};
