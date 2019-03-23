import originJsonp from 'jsonp'

interface Data {
  [key: string]: string | number
}

export default function jsonp(
  url: string,
  data: Data,
  option: object
): Promise<any> {
  url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)

  return new Promise((resolve, reject) => {
    originJsonp(url, option, (err, dataObj) => {
      err ? reject(err) : resolve(dataObj)
    })
  })
}

function param(data: Data): string {
  let url: string = ''
  for (const key of Object.keys(data)) {
    const value = data[key] !== undefined ? data[key] : ''
    url += `&${key}=${encodeURIComponent(value.toString())}`
  }

  return url ? url.substring(1) : ''
}
