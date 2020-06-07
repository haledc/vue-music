import * as types from "./mutation-types";
import { playMode } from "../utils/config";
import { shuffle } from "../utils/util";
import {
  saveSearch,
  deleteSearch,
  clearSearch,
  savePlay,
  saveFavorite,
  deleteFavorite,
} from "../utils/cache";

// 查找索引，封装一个函数
function findIndex(list, song) {
  return list.findIndex((item) => item.id === song.id);
}

// 选中歌曲并且播放
export const selectPlay = ({ commit, state }, { list, index }) => {
  commit(types.SET_SEQUENCE_LIST, list);
  if (state.mode === playMode.random) {
    const randomList = shuffle(list);
    commit(types.SET_PLAYLIST, randomList);
    index = findIndex(randomList, list[index]);
  } else {
    commit(types.SET_PLAYLIST, list);
  }

  commit(types.SET_CURRENT_INDEX, index);
  commit(types.SET_FULL_SCREEN, true);
  commit(types.SET_PLAYING_STATE, true);
};

// 随机播放
export const randomPlay = ({ commit }, { list }) => {
  commit(types.SET_PLAY_MODE, playMode.random);
  commit(types.SET_SEQUENCE_LIST, list);
  const randomList = shuffle(list);
  commit(types.SET_PLAYLIST, randomList);
  commit(types.SET_CURRENT_INDEX, 0);
  commit(types.SET_FULL_SCREEN, true);
  commit(types.SET_PLAYING_STATE, true);
};

// 插入歌曲
export const insertSong = ({ commit, state }, song) => {
  const playlist = state.playlist.slice();
  const sequenceList = state.sequenceList.slice();
  let currentIndex = state.currentIndex;
  const currentSong = playlist[currentIndex];
  const fpIndex = findIndex(playlist, song);
  currentIndex++;
  playlist.splice(currentIndex, 0, song);
  if (fpIndex > -1) {
    if (currentIndex > fpIndex) {
      playlist.splice(fpIndex, 1);
      currentIndex--;
    } else {
      playlist.splice(fpIndex + 1, 1);
    }
  }

  const currentSIndex = findIndex(sequenceList, currentSong) + 1;
  const fsIndex = findIndex(sequenceList, song);
  sequenceList.splice(currentSIndex, 0, song);
  if (fsIndex > -1) {
    if (currentSIndex > fsIndex) {
      sequenceList.splice(fsIndex, 1);
    } else {
      sequenceList.splice(fsIndex + 1, 1);
    }
  }
  commit(types.SET_PLAYLIST, playlist);
  commit(types.SET_SEQUENCE_LIST, sequenceList);
  commit(types.SET_CURRENT_INDEX, currentIndex);
  commit(types.SET_FULL_SCREEN, true);
  commit(types.SET_PLAYING_STATE, true);
};

// 保存关键词到搜索历史中
export const saveSearchHistory = ({ commit }, query) => {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query));
};

// 从搜索历史中删除关键词
export const deleteSearchHistory = ({ commit }, query) => {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query));
};

// 清空搜索历史
export const clearSearchHistory = ({ commit }) => {
  commit(types.SET_SEARCH_HISTORY, clearSearch());
};

// 删除歌曲
export const deleteSong = ({ commit, state }, song) => {
  const playlist = state.playlist.slice();
  const sequenceList = state.sequenceList.slice();
  let currentIndex = state.currentIndex;
  const pIndex = findIndex(playlist, song);
  playlist.splice(pIndex, 1);
  const sIndex = findIndex(sequenceList, song);
  sequenceList.splice(sIndex, 1);
  // 如果索引在当前歌曲之前 || 播放的是最后一首歌时，当前歌曲的索引 -1
  if (currentIndex > pIndex || currentIndex === playlist.length) {
    currentIndex--;
  }
  commit(types.SET_PLAYLIST, playlist);
  commit(types.SET_SEQUENCE_LIST, sequenceList);
  commit(types.SET_CURRENT_INDEX, currentIndex);

  const playingState = playlist.length > 0;
  commit(types.SET_PLAYING_STATE, playingState);
};

// 清空歌曲列表，重置为初始值
export const deleteSongList = ({ commit }) => {
  commit(types.SET_CURRENT_INDEX, -1);
  commit(types.SET_PLAYLIST, []);
  commit(types.SET_SEQUENCE_LIST, []);
  commit(types.SET_PLAYING_STATE, false);
};

// 保存到播放历史
export const savePlayHistory = ({ commit }, song) => {
  commit(types.SET_PLAY_HISTORY, savePlay(song));
};

// 保存到收藏列表
export const saveFavoriteList = ({ commit }, song) => {
  commit(types.SET_FAVORITE_LIST, saveFavorite(song));
};

// 从收藏列表中删除
export const deleteFavoriteList = ({ commit }, song) => {
  commit(types.SET_FAVORITE_LIST, deleteFavorite(song));
};
