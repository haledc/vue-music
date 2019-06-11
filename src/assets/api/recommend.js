import axios from 'axios'
import { commonParams, options } from './config'
import jsonp from '../helpers/jsonp'

const debug = process.env.NODE_ENV !== 'production'

// 获取推荐页面轮播图数据
export function getSliderList() {
  const url =
    'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'

  const data = Object.assign({}, commonParams, {
    platform: 'h5',
    uin: 0,
    needNewCode: 1
  })

  return jsonp(url, data, options)
}

// 获取推荐页面歌单数据
export function getDiscList() {
  const url = debug
    ? '/api/getDiscList'
    : 'http://127.0.0.1:9095/api/getDiscList'

  const data = Object.assign({}, commonParams, {
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0,
    sin: 0,
    ein: 29,
    sortId: 5,
    categoryId: 10000000,
    rnd: Math.random(),
    // 不是 jsonp
    format: 'json'
  })

  return axios
    .get(url, {
      params: data
    })
    .then(res => {
      return Promise.resolve(res.data)
    })
}

// 获取歌单歌曲数据
export function getSongList(disstid) {
  const url = debug ? '/api/getCdInfo/' : 'http://127.0.0.1:9095/api/getCdInfo'
  const data = Object.assign({}, commonParams, {
    disstid,
    type: 1,
    json: 1,
    utf8: 1,
    onlysong: 0,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0
  })

  return axios
    .get(url, {
      params: data
    })
    .then(res => {
      return Promise.resolve(res.data)
    })
}
