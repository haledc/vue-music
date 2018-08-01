import {getLyric, getSongsUrl} from 'api/song'
import {ERR_OK} from 'api/config'
import {Base64} from 'js-base64'

/**
 * 歌曲总类
 */
export default class Song {
  constructor({id, mid, singer, name, album, duration, image, url}) {
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

  /**
   * 获取歌词
   * 类的方法，后面可以直接通过实例调用该方法获取歌词
   * @return {Promise<any>}
   */
  getLyric() {
    // 如果已经有歌词，直接返回Promise.resolve对象
    if (this.lyric) {
      return Promise.resolve(this.lyric)
    }

    // 用promise对象封装
    return new Promise((resolve, reject) => {
      getLyric(this.mid).then((res) => {
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

/**
 * 生成歌曲
 * 通过返回类的实例来生成歌曲
 * @param musicData
 * @return {Song}
 */
export function createSong(musicData) {
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: filterSinger(musicData.singer),
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    // 播放地址
    url: musicData.url
  })
}

/**
 * 处理歌手  Array => String(xxx, xxx/xxx)
 * @param singer
 * @return {string}
 */
export function filterSinger(singer) {
  let ret = []
  if (!singer) {
    return ''
  }
  singer.forEach((item) => {
    ret.push(item.name)
  })
  // 如果有2个以上歌手用'/'分割成字符串
  return ret.join('/')
}

/**
 * 确定是否为可行歌曲（非付费歌曲）
 * @param musicData
 * @return {*|boolean}
 */
export function isValidMusic(musicData) {
  return musicData.songid && musicData.albummid && (!musicData.pay || musicData.pay.payalbumprice === 0)
}

/**
 * 处理歌曲播放链接
 * @param songs
 * @return {*}
 */
export function processSongsUrl(songs) {
  if (!songs.length) {
    return Promise.resolve(songs)
  }
  return getSongsUrl(songs)
    .then(res => {
      if (res.code === ERR_OK) {
        let midUrlInfo = res.url_mid.data.midurlinfo
        midUrlInfo.forEach((info, index) => {
          let song = songs[index]
          song.url = `http://dl.stream.qqmusic.qq.com/${info.purl}`
        })
      }
      return songs
    })
}
