export interface ISlider {
  id: number
  linkUrl: string
  picUrl: string
}

export interface ISliderListResult {
  code: number
  data: {
    slider: ISlider[]
  }
}

export interface IDisc {
  creator: {
    name: string
  }
  dissid: string
  dissname: string
  imgurl: string
}

export interface IDiscListResult {
  code: number
  data: {
    list: IDisc[]
  }
}

export interface ISinger {
  name: string
}

export interface IDiscSong {
  songid: string
  songmid: string
  singer: ISinger[]
  songname: string
  albummid: string
  albumname: string
  interval: number
  url: string
  pay: {
    payalbumprice: number
  }
}

export interface IDiscSongListResult<T = IDiscSong> {
  code: number
  cdlist: [
    {
      dissid: number
      songlist: T[]
    }
  ]
}

export interface ISingerResult {
  Fsinger_mid: string
  Fsinger_name: string
  Findex: string
}

export interface ISingerListResult {
  code: number
  data: {
    list: ISingerResult[]
  }
}

export interface ISingerSong<T> {
  musicData: T
}

export interface ISingerDetailResult {
  code: number
  data: {
    list: ISingerSong<IDiscSong>[]
  }
}

export interface ITopList {
  id: number
  picUrl: string
  topTitle: string
  songList: [
    {
      singername: string
      songname: string
    }
  ]
}

export interface ITopListResult {
  code: number
  data: {
    topList: ITopList[]
  }
}

export interface ITopSong<T> {
  data: T
}

export interface ITopSongListResult {
  code: number
  songlist: ITopSong<IDiscSong>[]
}

export interface ILyricResult {
  lyric: string
  retcode: number
}

export interface ISongsUrlResult {
  [key: string]: string
}

export interface SingerZhida {
  albumnum: number
  singerid: number
  singermid: string
  singername: string
  songnum: number
  type: string
  name?: string
  singer?: string
}

export interface ISearchResult {
  code: number
  data: {
    keyword: string
    song: {
      curnum: number
      curpage: number
      totalnum: number
      list: IDiscSong[]
    }
    zhida: SingerZhida
  }
}

export interface IHotKey {
  k: string
  n: number
}

export interface IHotKeyResult {
  code: number
  data: {
    hotkey: IHotKey[]
  }
}
