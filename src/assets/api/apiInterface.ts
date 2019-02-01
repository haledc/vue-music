interface SingerObject {
  name: string
}

export interface SongResponse {
  songid: string
  songmid: string
  singer: SingerObject[]
  songname: string
  albumname: string
  interval: number
  albummid: string
  url: string
  pay: {
    payalbumprice: number
  }
  musicData?: object
  data?: object
}

export interface LyricResponse {
  code: number
  retcode: number
  lyric: string
  subcode: number
  trans: string
}

export interface SongsUrlResponse {
  code: number
  comn: object
  ts: number
  url_mid: {
    code: number
    data: {
      retcode: number
      midurlinfo: [
        {
          purl: string
        }
      ]
    }
  }
}
// export interface DiscResponse { }
// export interface searchResponse { }
// export interface SingerResponse { }
