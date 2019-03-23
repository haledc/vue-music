import { SearchResponse } from '../api/apiInterface'
import Song, { processSongUrl, normalizeSongs } from './song'

const PER_PAGE = 20
const TYPE_SINGER = 'singer'

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

export function genResult(res: SearchResponse, page: number) {
  let ret: Array<SingerZhida | Song> = []
  if (res.data.zhida && res.data.zhida.singerid && page === 1) {
    ret.push({
      ...res.data.zhida,
      type: TYPE_SINGER
    })
  }

  return processSongUrl(normalizeSongs(res.data.song.list)).then(songs => {
    ret = ret.concat(songs)
    return ret
  })
}
export function hasMore(res: SearchResponse) {
  const song = res.data.song
  if (
    !song.list.length ||
    song.curnum + song.curpage * PER_PAGE >= song.totalnum
  ) {
    return false
  }
  return true
}
