import axios, { AxiosResponse } from 'axios'
import { commonParams, ERR_OK } from './config'
import { getUid } from '../utils/uid'
import { ILyricResult, ISongsUrlResult } from '../types'
import Song from '../utils/song'

const debug = process.env.NODE_ENV !== 'production'

export function getLyric(mid: string): Promise<ILyricResult> {
  const url = debug ? '/api/lyric' : 'http://127.0.0.1:9095/api/lyric'

  const data = Object.assign({}, commonParams, {
    songmid: mid,
    pcachetime: +new Date(),
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0,
    categoryId: 10000000,
    format: 'json'
  })

  return axios
    .get(url, {
      params: data
    })
    .then((res: AxiosResponse) => Promise.resolve(res.data))
}

interface IPurlMap {
  [key: string]: string
}

interface IMidURLInfo {
  songmid: string
  purl: string
  [key: string]: string
}

interface IUMid {
  code: number
  data: {
    midurlinfo: IMidURLInfo[]
  }
}

export function getSongsUrl(songs: Song[]): Promise<ISongsUrlResult> {
  const url = debug ? '/api/getPurlUrl' : 'http://127.0.0.1:9095/api/getPurlUrl'
  const mids: string[] = []
  const types: number[] = []

  songs.forEach(song => {
    mids.push(song.mid)
    types.push(0)
  })

  const urlMid = genUrlMid(mids, types)

  const data = Object.assign({}, commonParams, {
    g_tk: 5381,
    format: 'json',
    platform: 'h5',
    needNewCode: 1,
    uin: 0
  })

  return new Promise((resolve, reject) => {
    let tryTime = 3

    function request() {
      return axios
        .post(url, {
          comm: data,
          req_0: urlMid
        })
        .then(response => {
          const ret = response.data
          if (ret.code === ERR_OK) {
            const uMid: IUMid = ret.req_0
            if (uMid && uMid.code === ERR_OK) {
              const purlMap: IPurlMap = {}
              uMid.data.midurlinfo.forEach(item => {
                if (item.purl) {
                  purlMap[item.songmid] = item.purl
                }
              })
              if (Object.keys(purlMap).length > 0) {
                resolve(purlMap)
              } else {
                retry()
              }
            } else {
              retry()
            }
          } else {
            retry()
          }
        })
    }

    function retry() {
      if (--tryTime >= 0) {
        request()
      } else {
        reject(new Error('Can not get the songs url'))
      }
    }

    request()
  })
}

function genUrlMid(mids: string[], types: number[]) {
  const guid = getUid()
  return {
    module: 'vkey.GetVkeyServer',
    method: 'CgiGetVkey',
    param: {
      guid,
      songmid: mids,
      songtype: types,
      uin: '0',
      loginflag: 0,
      platform: '23'
    }
  }
}
