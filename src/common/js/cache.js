// 第三方操作缓存的库
import storage from 'good-storage'

// 搜索的key
const SEARCH_KEY = '__SEARCH__'
const SEARCH_MAX_LENGTH = 15

// 播放的key
const PLAY_KEY = '__PLAY__'
const PLAY_MAX_LENGTH = 200

// 收藏的key
const FAVORITE_KEY = '__FAVORITE__'
const FAVORITE_MAX_LENGTH = 200

/**
 * 把元素插入数组的方法
 * @param arr
 * @param val
 * @param compare
 * @param maxLen
 */
function insertArray(arr, val, compare, maxLen) {
  // 查找数组中是否有这个值
  const index = arr.findIndex(compare)
  // 数组中存在这个值并且在第一个位置，不执行操作
  if (index === 0) {
    return
  }
  // 数组中存在这个值但是不在第一个，删掉这个值
  if (index > 0) {
    arr.splice(index, 1)
  }
  // 把这个值添加到数组的最前面
  arr.unshift(val)
  // 如果参数中传入了最大值并且数组中的长度超过了这个最大值时，删掉数组的最后一个元素
  if (maxLen && arr.length > maxLen) {
    arr.pop()
  }
}

/**
 * 在数组中删除元素的方法
 * @param arr
 * @param compare
 */
function deleteFromArray(arr, compare) {
  // 在数组中查找这个元素
  const index = arr.findIndex(compare)
  // 如果找到就把它删掉
  if (index > -1) {
    arr.splice(index, 1)
  }
}

/**
 * 保存搜索历史到缓存中
 * @param query
 * @return {*|Object}
 */
export function saveSearch(query) {
  // 从本地中获取搜索缓存，没有则为空数组
  let searches = storage.get(SEARCH_KEY, [])

  // 把搜索关键词插入到数组中
  insertArray(searches, query, (item) => {
    return item === query
  }, SEARCH_MAX_LENGTH)

  // 保存最新的搜索历史数组到本地缓存中
  storage.set(SEARCH_KEY, searches)
  // 返回数组，用来保存在vuex中去，下同
  return searches
}

/**
 * 获取本地缓存中的搜索历史，没有则为空数组
 * @return {*|Object}
 */
export function loadSearch() {
  return storage.get(SEARCH_KEY, [])
}

/**
 * 删除本地缓存中的某个关键词
 * @param query
 * @return {*|Object}
 */
export function deleteSearch(query) {
  // 先从本地中获取搜索缓存，没有则为空数组
  let searches = storage.get(SEARCH_KEY, [])
  // 把数组中的搜索关键词删掉
  deleteFromArray(searches, (item) => {
    return item === query
  })
  // 保存最新的搜索历史数组到本地缓存中
  storage.set(SEARCH_KEY, searches)
  // 返回数组，用来保存在vuex中去，下同
  return searches
}

/**
 * 情况缓存，调用remove API，并返回空数组
 * @return {Array}
 */
export function clearSearch() {
  // 清空缓存
  storage.remove(SEARCH_KEY)
  // 返回空数组，用来保存到vuex中去，下同
  return []
}

/**
 * 保存播放的歌曲到本地缓存
 * @param song
 * @return {*|Object}
 */
export function savePlay(song) {
  let songs = storage.get(PLAY_KEY, [])
  insertArray(songs, song, (item) => {
    return item.id === song.id
  }, PLAY_MAX_LENGTH)
  storage.set(PLAY_KEY, songs)
  return songs
}

/**
 * 获取本地缓存的播放历史
 * @return {*|Object}
 */
export function loadPlay() {
  return storage.get(PLAY_KEY, [])
}

/**
 * 保存收藏的歌曲到本地缓存
 * @param song
 * @return {*|Object}
 */
export function saveFavorite(song) {
  let songs = storage.get(FAVORITE_KEY, [])
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, FAVORITE_MAX_LENGTH)
  storage.set(FAVORITE_KEY, songs)
  return songs
}

/**
 * 从本地缓存中删除收藏的歌曲
 * @param song
 * @return {*|Object}
 */
export function deleteFavorite(song) {
  let songs = storage.get(FAVORITE_KEY, [])
  deleteFromArray(songs, (item) => {
    return song.id === item.id
  })
  storage.set(FAVORITE_KEY, songs)
  return songs
}

/**
 * 从本地缓存中获取收藏的歌曲
 * @return {*|Object}
 */
export function loadFavorite() {
  return storage.get(FAVORITE_KEY, [])
}
