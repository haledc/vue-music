import storage from 'good-storage'
import Song from '@/assets/utils/song'

const SEARCH_KEY = '__SEARCH__'
const SEARCH_MAX_LENGTH = 15

const PLAY_KEY = '__PLAY__'
const PLAY_MAX_LENGTH = 200

const FAVORITE_KEY = '__FAVORITE__'
const FAVORITE_MAX_LENGTH = 200

function insertToArray(
  arr: Array<string | object>,
  val: object | string,
  compare: (params: any) => boolean,
  maxLen: number
) {
  const index = arr.findIndex(compare)
  if (index === 0) {
    return
  }
  if (index > 0) {
    arr.splice(index, 1)
  }
  arr.unshift(val)
  if (maxLen && arr.length > maxLen) {
    arr.pop()
  }
}

function deleteFromArray(
  arr: Array<string | object>,
  compare: (params: any) => boolean
) {
  const index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)
  }
}

export function saveSearch(query: string) {
  const searches = storage.get(SEARCH_KEY, [])
  insertToArray(searches, query, item => item === query, SEARCH_MAX_LENGTH)
  storage.set(SEARCH_KEY, searches)
  return searches
}

export function loadSearch() {
  return storage.get(SEARCH_KEY, [])
}

export function deleteSearch(query: string) {
  const searches = storage.get(SEARCH_KEY, [])
  deleteFromArray(searches, item => item === query)
  storage.set(SEARCH_KEY, searches)
  return searches
}

export function clearSearch() {
  storage.remove(SEARCH_KEY)
  return []
}

export function savePlay(song: Song) {
  const songs = storage.get(PLAY_KEY, [])
  insertToArray(songs, song, item => item.id === song.id, PLAY_MAX_LENGTH)
  storage.set(PLAY_KEY, songs)
  return songs
}

export function loadPlay() {
  return storage.get(PLAY_KEY, [])
}

export function saveFavorite(song: Song) {
  const songs = storage.get(FAVORITE_KEY, [])
  insertToArray(songs, song, item => item.id === song.id, FAVORITE_MAX_LENGTH)
  storage.set(FAVORITE_KEY, songs)
  return songs
}

export function deleteFavorite(song: Song) {
  const songs = storage.get(FAVORITE_KEY, [])
  deleteFromArray(songs, item => item.id === song.id)
  storage.set(FAVORITE_KEY, songs)
  return songs
}

export function loadFavorite() {
  return storage.get(FAVORITE_KEY, [])
}
