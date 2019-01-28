import { getLyric, getSongsUrl } from '../api/song'
import { ERR_OK } from '../api/config'
import { Base64 } from 'js-base64'

export default class Song {
  public id: string
  public mid: string
  public singer: object
  public name: string
  public album: string
  public duration: number
  public image: string
  public filename: string
  public url: string

  public lyric: string = ''

  constructor({ id, mid, singer, name, album, duration, image, url }: any) {
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

  public getLyric() {
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

export function createSong(musicData: any) {
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: filterSinger(musicData.singer),
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${
      musicData.albummid
    }.jpg?max_age=2592000`,
    url: musicData.url
  })
}

function filterSinger(singer: any[]): string {
  const ret: any[] = []
  if (!singer) {
    return ''
  }
  singer.forEach(item => ret.push(item.name))
  return ret.join('/')
}

export function isValidMusic(musicData: any) {
  return (
    musicData.songid &&
    musicData.albummid &&
    (!musicData.pay || musicData.pay.payalbumprice === 0)
  )
}

export function processSongUrl(songs: any[]) {
  if (!songs.length) {
    return Promise.resolve(songs)
  }

  return getSongsUrl(songs).then((res: any) => {
    if (res.code === ERR_OK) {
      const midUrlInfo = res.url_mid.data.midurlinfo
      midUrlInfo.forEach((info: any, index: number) => {
        const song = songs[index]
        song.url = `http://dl.stream.qqmusic.qq.com/${info.purl}`
      })
    }
    return songs
  })
}
