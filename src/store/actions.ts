import * as types from './mutation-types'
import { playMode } from './../assets/utils/config'
import { shuffle } from '../assets/utils/util'
import {
  saveSearch,
  deleteSearch,
  clearSearch,
  savePlay,
  saveFavorite,
  deleteFavorite
} from '../assets/utils/cache'

/**
 * 查找索引，封装一个函数
 * @param list
 * @param song
 */
function findIndex(list: any[], song: { id: string }): number {
  return list.findIndex(item => item.id === song.id)
}

/**
 * 选中歌曲并且播放
 * @param { commit state }
 * @param { list, index }
 */
export const selectAndPlay = ({ commit, state }: any, { list, index }: any) => {
  // 设置顺序的播放列表
  commit(types.SET_SEQUENCE_LIST, list)

  // 如果为随机播放模式则打乱列表
  if (state.mode === playMode.random) {
    const randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    // 找到当前歌曲在打乱列表的索引
    index = findIndex(randomList, list[index])
  } else {
    commit(types.SET_PLAYLIST, list)
  }

  // 设置当前歌曲索引
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

/**
 * 选择随机播放模式
 * @param { commit }
 * @param { list }
 */
export const randomPlay = ({ commit }: any, { list }: any) => {
  // 设置播放模式为随机播放
  commit(types.SET_PLAY_MODE, playMode.random)
  // 设置顺序播放列表
  commit(types.SET_SEQUENCE_LIST, list)
  // 打乱顺序播放列表
  const randomList = shuffle(list)
  // 设置播放列表为打乱后的列表
  commit(types.SET_PLAYLIST, randomList)

  // 重置当前歌曲索引为0
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

/**
 * 插入歌曲
 * @param { commit, state }
 * @param song
 */
export const insertSong = ({ commit, state }: any, song: any) => {
  // 引用类型不能直接去修改vuex的数据，需要使用slice拷贝 ★
  const playlist = state.playlist.slice()
  const sequenceList = state.sequenceList.slice()
  // 值类型不需要slice
  let currentIndex = state.currentIndex
  // 记录当前歌曲
  const currentSong = playlist[currentIndex]
  // 查找当前列表中是否有待插入的歌曲并返回其索引，【需要在插入前查找】
  const fpIndex = findIndex(playlist, song)
  // 因为插入的歌曲都是在当前歌曲的下一位，所以序号+1
  currentIndex++
  // 插入这首歌到当前索引歌曲的下一位
  playlist.splice(currentIndex, 0, song)
  // 如果播放列表已经包含了这首歌曲，需要删除原来的歌曲
  // 根据原来的歌曲和当前索引的歌曲位置不一样，分情况处理
  if (fpIndex > -1) {
    // 如果当前要插入的序号大于歌曲在列表的序号[歌曲1，歌曲2（播放），歌曲1（插入）]
    // 直接通过序号删除原来的歌曲，然后当前歌曲序号-1
    if (currentIndex > fpIndex) {
      playlist.splice(fpIndex, 1)
      currentIndex--
    } else {
      // 如果当前要插入的序号小于歌曲在列表的序号[歌曲2（播放），歌曲1（插入），歌曲1， ]
      // 因为在播放歌曲之后，要插入歌曲，占了一个位置，所以序号要+1才能删除原来的歌曲
      playlist.splice(fpIndex + 1, 1)
    }
  }

  // 插入的歌曲在sequenceList的索引， 当前歌曲的下一位（+1），后面逻辑和在playlist一样
  // 并且不用操作currentIndex，只有在playlist中需要操作
  const currentSIndex = findIndex(sequenceList, currentSong) + 1

  const fsIndex = findIndex(sequenceList, song)

  sequenceList.splice(currentSIndex, 0, song)

  if (fsIndex > -1) {
    if (currentSIndex > fsIndex) {
      sequenceList.splice(fsIndex, 1)
    } else {
      sequenceList.splice(fsIndex + 1, 1)
    }
  }
  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

/**
 * 保存关键词到搜索历史中
 * @param { commit }
 * @param query
 */
export const saveSearchHistory = ({ commit }: any, query: string) => {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

/**
 * 从搜索历史中删除关键词
 * @param { commit }
 * @param query
 */
export const deleteSearchHistory = ({ commit }: any, query: string) => {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

/**
 * 清空搜索历史
 * @param { commit }
 */
export const clearSearchHistory = ({ commit }: any) => {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}

/**
 * 删除歌曲
 * @param { commit, state }
 * @param song
 */
export const deleteSong = ({ commit, state }: any, song: any) => {
  const playlist = state.playlist.slice()
  const sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  // 找到该歌曲的索引，并且删除
  const pIndex = findIndex(playlist, song)
  playlist.splice(pIndex, 1)
  const sIndex = findIndex(sequenceList, song)
  sequenceList.splice(sIndex, 1)
  // 如果索引在当前歌曲之前 || 播放的是最后一首歌时，当前歌曲的索引-1
  if (currentIndex > pIndex || currentIndex === playlist.length) {
    currentIndex--
  }
  // 更新列表和索引
  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  // 如果列表中已经没有歌曲了则暂停播放，否则继续播放歌曲
  const playingState = playlist.length > 0
  commit(types.SET_PLAYING_STATE, playingState)
}

/**
 * 清空歌曲列表，重置为初始值
 * @param { commit }
 */
export const deleteSongList = ({ commit }: any) => {
  // 当前索引设置为-1
  commit(types.SET_CURRENT_INDEX, -1)
  // 播放列表设置为空数组
  commit(types.SET_PLAYLIST, [])
  // 顺序列表设置为空数组
  commit(types.SET_SEQUENCE_LIST, [])
  // 播放状态设置为不播放
  commit(types.SET_PLAYING_STATE, false)
}

/**
 * 保存到播放历史
 * @param { commit }
 * @param song
 */
export const savePlayHistory = ({ commit }: any, song: any) => {
  commit(types.SET_PLAY_HISTORY, savePlay(song))
}

/**
 * 保存到收藏列表
 * @param { commit }
 * @param song
 */
export const saveFavoriteList = ({ commit }: any, song: any) => {
  commit(types.SET_FAVORITE_LIST, saveFavorite(song))
}

/**
 * 从收藏列表中删除
 * @param { commit }
 * @param song
 */
export const deleteFavoriteList = ({ commit }: any, song: any) => {
  commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}
