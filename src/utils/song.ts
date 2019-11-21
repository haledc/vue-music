import { Base64 } from 'js-base64'
import { getLyric, getSongsUrl } from '../request/song'
import { ERR_OK } from '../request/config'
import { IDiscSong, ISinger, ISingerSong, ITopSong } from '../types'

interface ISongParams {
  id: string
  mid: string
  singer: string
  name: string
  album: string
  duration: number
  image: string
  url: string
}

export default class Song {
  public id: string
  public mid: string
  public singer: string
  public name: string
  public album: string
  public duration: number
  public image: string
  public filename: string
  public url: string
  public lyric!: string
  public deleting?: boolean

  constructor({
    id,
    mid,
    singer,
    name,
    album,
    duration,
    image,
    url
  }: ISongParams) {
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

  public getLyric(): Promise<string> {
    if (this.lyric) {
      return Promise.resolve(this.lyric)
    }

    return new Promise((resolve, reject) => {
      getLyric(this.mid).then(res => {
        if (res.retcode === ERR_OK) {
          this.lyric = Base64.decode(res.lyric)
          resolve(this.lyric)
        } else {
          reject('no lyric')
        }
      })
    })
  }
}

export function createSong(musicData: IDiscSong) {
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: filterSinger(musicData.singer),
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    url: musicData.url
  })
}

function filterSinger(singer: ISinger[]): string {
  const ret: string[] = []
  if (!singer) {
    return ''
  }
  singer.forEach(item => ret.push(item.name))
  return ret.join('/')
}

export function isValidMusic(musicData: IDiscSong) {
  return (
    musicData.songid &&
    musicData.albummid &&
    (!musicData.pay || musicData.pay.payalbumprice === 0)
  )
}

export function processSongUrl(songs: Song[]) {
  if (!songs.length) {
    return Promise.resolve(songs)
  }

  return getSongsUrl(songs).then(purlMap => {
    songs = songs.filter(song => {
      const purl = purlMap[song.mid]
      if (purl) {
        song.url =
          purl.indexOf('http') === -1
            ? `http:// dl.stream.qqmusic.qq.com/${purl}`
            : purl
        return true
      }
      return false
    })
    return songs
  })
}

export function normalizeSongs(list: any[]) {
  const ret: Song[] = []
  let song: IDiscSong

  list.forEach(item => {
    song = item.musicData ? item.musicData : item.data ? item.data : item
    if (isValidMusic(song)) {
      ret.push(createSong(song))
    }
  })
  return ret
}
