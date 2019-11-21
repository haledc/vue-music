import { ActionTree } from 'vuex'
import * as types from './mutation-types'
import { playMode } from '../utils/config'
import { shuffle } from '../utils/util'
import {
  saveSearch,
  deleteSearch,
  clearSearch,
  savePlay,
  saveFavorite,
  deleteFavorite
} from '../utils/cache'
import { State } from './state'
import Song from '../utils/song'

const findIndex = (list: any[], song: Song): number => {
  return list.findIndex(item => item.id === song.id)
}

const actions: ActionTree<State, State> = {
  selectAndPlay: ({ commit, state }, { list, index }) => {
    commit(types.SET_SEQUENCE_LIST, list)

    if (state.mode === playMode.random) {
      const randomList = shuffle(list)
      commit(types.SET_PLAYLIST, randomList)
      index = findIndex(randomList, list[index])
    } else {
      commit(types.SET_PLAYLIST, list)
    }

    commit(types.SET_CURRENT_INDEX, index)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
  },

  randomPlay: ({ commit }, { list }) => {
    commit(types.SET_PLAY_MODE, playMode.random)
    commit(types.SET_SEQUENCE_LIST, list)
    const randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)

    commit(types.SET_CURRENT_INDEX, 0)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
  },

  insertSong: ({ commit, state }, song) => {
    const playlist = state.playlist.slice()
    const sequenceList = state.sequenceList.slice()
    let currentIndex = state.currentIndex
    const currentSong = playlist[currentIndex]
    const fpIndex = findIndex(playlist, song)
    currentIndex++
    playlist.splice(currentIndex, 0, song)
    if (fpIndex > -1) {
      if (currentIndex > fpIndex) {
        playlist.splice(fpIndex, 1)
        currentIndex--
      } else {
        playlist.splice(fpIndex + 1, 1)
      }
    }
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
  },

  saveSearchHistory: ({ commit }, query) => {
    commit(types.SET_SEARCH_HISTORY, saveSearch(query))
  },

  deleteSearchHistory: ({ commit }, query) => {
    commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
  },

  clearSearchHistory: ({ commit }) => {
    commit(types.SET_SEARCH_HISTORY, clearSearch())
  },

  deleteSong: ({ commit, state }, song) => {
    const playlist = state.playlist.slice()
    const sequenceList = state.sequenceList.slice()
    let currentIndex = state.currentIndex
    const pIndex = findIndex(playlist, song)
    playlist.splice(pIndex, 1)
    const sIndex = findIndex(sequenceList, song)
    sequenceList.splice(sIndex, 1)
    if (currentIndex > pIndex || currentIndex === playlist.length) {
      currentIndex--
    }
    commit(types.SET_PLAYLIST, playlist)
    commit(types.SET_SEQUENCE_LIST, sequenceList)
    commit(types.SET_CURRENT_INDEX, currentIndex)
    const playingState = playlist.length > 0
    commit(types.SET_PLAYING_STATE, playingState)
  },

  deleteSongList: ({ commit }) => {
    commit(types.SET_CURRENT_INDEX, -1)
    commit(types.SET_PLAYLIST, [])
    commit(types.SET_SEQUENCE_LIST, [])
    commit(types.SET_PLAYING_STATE, false)
  },

  savePlayHistory: ({ commit }, song) => {
    commit(types.SET_PLAY_HISTORY, savePlay(song))
  },

  saveFavoriteList: ({ commit }, song) => {
    commit(types.SET_FAVORITE_LIST, saveFavorite(song))
  },

  deleteFavoriteList: ({ commit }, song) => {
    commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
  }
}

export default actions
