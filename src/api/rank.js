import jsonp from 'common/js/jsonp'
import {commonParams, options} from "./config"

/**
 * 获取排行榜列表
 */
export function getToplist() {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_myqq_toplist.fcg'

  const data = Object.assign({}, commonParams, {
    uin: 0,
    platform: 'h5',
    needNewCode: 1
  })

  return jsonp(url, data, options)
}

/**
 * 获取排行榜详情
 * @param topid
 */
export function getMusicList(topid) {
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
