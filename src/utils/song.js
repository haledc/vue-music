import { Base64 } from 'js-base64'
import { getLyric, getSongsUrl } from '../request/song'
import { ERR_OK } from '../request/config'

// 歌曲类
export default class Song {
  constructor({ id, mid, singer, name, album, duration, image, url }) {
    this.id = id
    this.mid = mid
    this.singer = singer
    this.name = name
    this.album = album
    this.duration = duration
    this.image = image
    this.filename = `C400${this.mid}.m4a`
    this.url = url
  }

  // 获取歌词
  getLyric() {
    // 如果已经有歌词，直接返回 Promise.resolve 值
    if (this.lyric) {
      return Promise.resolve(this.lyric)
    }

    // 用 promise 封装返回值
    return new Promise((resolve, reject) => {
      getLyric(this.mid).then(res => {
        if (res.retcode === ERR_OK) {
          // 歌词Base64解码
          this.lyric = Base64.decode(res.lyric)
          resolve(this.lyric)
        } else {
          reject('no lyric')
        }
      })
    })
  }
}

// 生成歌曲
export function createSong(musicData) {
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: filterSinger(musicData.singer),
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    url: musicData.url // 播放地址
  })
}

// 处理歌手  Array => String(xxx, xxx/xxx)
export function filterSinger(singer) {
  let ret = []
  if (!singer) {
    return ''
  }
  singer.forEach(item => {
    ret.push(item.name)
  })

  // 如果有2个以上歌手用'/'分割成字符串
  return ret.join('/')
}

// 确定是否为可行歌曲（非付费歌曲）
export function isValidMusic(musicData) {
  return (
    musicData.songid &&
    musicData.albummid &&
    (!musicData.pay || musicData.pay.payalbumprice === 0)
  )
}

// 处理歌曲播放链接
export function processSongsUrl(songs) {
  if (!songs.length) {
    return Promise.resolve(songs)
  }
  return getSongsUrl(songs).then(purlMap => {
    songs = songs.filter(song => {
      const purl = purlMap[song.mid]
      if (purl) {
        song.url =
          purl.indexOf('http') === -1
            ? `http://d1.stream.qqmusic.com/${purl}`
            : purl
        return true
      }
      return false
    })
    return songs
  })
}

export function normalizeSongs(list) {
  const ret = []
  list.forEach(item => {
    item = item.musicData ? item.musicData : item.data ? item.data : item
    if (isValidMusic(item)) {
      ret.push(createSong(item))
    }
  })
  return ret
}
