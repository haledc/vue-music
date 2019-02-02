import originJsonp from 'jsonp'

export default function jsonp(
  url: string,
  data: object,
  option: object
): Promise<any> {
  url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)

  return new Promise((resolve, reject) => {
    originJsonp(url, option, (err, dataObj) => {
      err ? reject(err) : resolve(dataObj)
    })
  })
}

function param(data: any): string {
  let url: string = ''
  for (const key of Object.keys(data)) {
    const value = data[key] !== undefined ? data[key] : ''
    url += `&${key}=${encodeURIComponent(value)}`
  }

  return url ? url.substring(1) : ''
}
