import { ISingerResult, INormalizeSinger, ISinger } from '../types'

export default class Singer implements ISinger {
  public id: string
  public name: string
  public avatar: string
  constructor({ id, name }: { id: string; name: string }) {
    this.id = id
    this.name = name
    this.avatar = `http://y.gtimg.cn/music/photo_new/T001R300x300M000${id}.jpg?max_age=2592000`
  }
}

const HOT_NAME = '热门'
const HOT_SINGER_LEN = 10

export const normalizeSingers = (list: ISingerResult[]): INormalizeSinger[] => {
  const map: any = {
    hot: {
      title: HOT_NAME,
      items: []
    }
  }

  list.forEach((item, index) => {
    if (index < HOT_SINGER_LEN) {
      map.hot.items.push(
        new Singer({
          id: item.Fsinger_mid,
          name: item.Fsinger_name
        })
      )
    }

    const key = item.Findex

    if (!map[key]) {
      map[key] = {
        title: key,
        items: []
      }
    }

    map[key].items.push(
      new Singer({
        id: item.Fsinger_mid,
        name: item.Fsinger_name
      })
    )
  })

  const hot = []
  const ret = []

  for (const key of Object.keys(map)) {
    const val = map[key]
    if (val.title.match(/[a-zA-Z]/)) {
      ret.push(val)
    } else if (val.title === HOT_NAME) {
      hot.push(val)
    }
  }

  ret.sort((a, b) => a.title.charCodeAt(0) - b.title.charCodeAt(0))
  return hot.concat(ret)
}
