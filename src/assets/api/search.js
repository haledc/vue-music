import axios from 'axios'
import jsonp from '../helpers/jsonp'
import { commonParams, options } from './config'

const debug = process.env.NODE_ENV !== 'production'

// 获取搜索关键词
export function getHotKey() {
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'

  const data = Object.assign({}, commonParams, {
    uin: 0,
    platform: 'h5',
    needNewCode: 1
  })

  return jsonp(url, data, options)
}

/**
 * 搜索方法，获得搜索结果
 * @param query 关键字
 * @param page 页数
 * @param {Boolean} zhida 是否直达
 * @param perpage 每页数目
 */
export function search(query, page, zhida, perpage) {
  const url = debug ? '/api/search' : 'http://127.0.0.1:9095/api/search'

  const data = Object.assign({}, commonParams, {
    w: query,
    p: page,
    perpage,
    n: perpage,
    catZhida: zhida ? 1 : 0,
    zhidaqu: 1,
    t: 0,
    flag: 1,
    ie: 'utf-8',
    sem: 1,
    aggr: 0,
    remoteplace: 'txt.mqq.all',
    uin: 0,
    platform: 'h5',
    format: 'json',
    needNewCode: 1
  })

  return axios
    .get(url, {
      params: data
    })
    .then(res => {
      return Promise.resolve(res.data)
    })
}
