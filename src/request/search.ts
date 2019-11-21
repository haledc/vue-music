import axios, { AxiosResponse } from 'axios'
import { commonParams, options } from './config'
import jsonp from '../utils/jsonp'
import { ISearchResult, IHotKeyResult } from '../types'

const debug = process.env.NODE_ENV !== 'production'

export function getHotKey(): Promise<IHotKeyResult> {
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'

  const data = Object.assign({}, commonParams, {
    uin: 0,
    platform: 'h5',
    needNewCode: 1
  })

  return jsonp(url, data, options)
}

export function search(
  query: string,
  page: number,
  zhida: boolean,
  perPage: number
): Promise<ISearchResult> {
  const url = debug ? '/api/search' : 'http://127.0.0.1:9095/api/search'

  const data = Object.assign({}, commonParams, {
    w: query,
    p: page,
    perPage,
    n: perPage,
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
    .then((res: AxiosResponse) => Promise.resolve(res.data))
}
