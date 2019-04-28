import { commonParams, options } from './config'
import jsonp from '../utils/jsonp'
import { TopListResponse, TopListSongListResponse } from './apiInterface'

export function getTopList(): Promise<TopListResponse> {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_myqq_toplist.fcg'

  const data = Object.assign({}, commonParams, {
    uin: 0,
    platform: 'h5',
    needNewCode: 1
  })

  return jsonp(url, data, options)
}

export function getMusicList(topid: number): Promise<TopListSongListResponse> {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg'

  const data = Object.assign({}, commonParams, {
    topid,
    page: 'detail',
    type: 'top',
    tpl: 3,
    uin: 0,
    platform: 'h5',
    needNewCode: 1
  })

  return jsonp(url, data, options)
}
