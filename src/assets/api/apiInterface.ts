interface SingerObject {
  name: string
}

export interface SongInterface {
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
export interface SearchResponse {
  code: number
  data: {
    keyword: string
    song: {
      curnum: number
      curpage: number
      totalnum: number
      list: [SongInterface]
    }
    zhida: {
      albumnum: number
      singerid: number
      singermid: string
      singername: string
      songnum: number
      type: string
    }
  }
}

export interface DiscInterface {
  commit_time: number
  createtime: number
  creator: {
    name: string
  }
  dissid: string
  dissname: string
  imgurl: string
  introduction: string
  listennum: number
  score: number
  version: number
}

export interface DiscListResponse {
  code: number
  data: {
    categoryId: number
    ein: number
    list: [DiscInterface]
  }
  default: number
  message: string
  subcode: number
}

export interface SliderListResponse {
  code: number
  data: {
    slider: [
      {
        id: number
        linkUrl: string
        picUrl: string
      }
    ]
  }
}

export interface SongListResponse {
  accessed_favbase: number
  accessed_plaza_cache: number
  cdnum: number
  code: number
  login: string
  realcdnum: number
  subcode: number
  cdlist: [
    {
      dissid: number
      songlist: [SongInterface]
    }
  ]
}

export interface SingerInterface {
  Farea: string
  Fattribute_3: string
  Fattribute_4: string
  Fgenre: string
  Findex: string
  Fother_name: string
  Fsinger_id: string
  Fsinger_mid: string
  Fsinger_name: string
  Fsinger_tag: string
  Fsort: string
  Ftrend: string
  Ftype: string
  voc: string
}

export interface SingerListResponse {
  code: number
  data: {
    list: [SingerInterface]
    per_page: number
    total: number
    total_page: number
  }
  message: string
  subcode: number
}

export interface SingerDetailResponse {
  code: number
  data: {
    list: [
      {
        Flisten_count1: number
        Fupload_time: string
        index: number
        isnew: number
        listenCount: number
        playurl: string
        price: number
        vid: object
        musicData: SongInterface
      }
    ]
    singer_id: string
    singer_mid: string
    singer_name: string
    total: number
  }
  message: string
  subcode: number
}

export interface TopListInterface {
  id: number
  listenCount: number
  picUrl: string
  topTitle: string
  songList: [
    {
      singername: string
      songname: string
    }
  ]
  type: number
}

export interface TopListResponse {
  code: number
  data: {
    topList: [TopListInterface]
  }
  message: string
  subcode: number
  default: number
}

export interface TopListSongListResponse {
  code: number
  color: number
  comment_num: number
  cur_song_num: number
  date: string
  day_of_year: string
  song_begin: number
  total_song_num: number
  update_time: string
  songlist: [
    {
      Franking_value: string
      cur_count: string
      in_count: string
      old_count: string
      data: SongInterface
    }
  ]
  topinfo: object
}

export interface HotKeyInterface {
  k: string
  n: number
}

export interface HotKeyResponse {
  code: number
  subcode: number
  data: {
    hotkey: [HotKeyInterface]
    special_key: string
    special_url: string
  }
}
