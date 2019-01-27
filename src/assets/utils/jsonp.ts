import originJsonp from 'jsonp'

export default function jsonp(
  url: string,
  obj: object,
  option: object
): Promise<object> {
  url += (url.indexOf('?') < 0 ? '?' : '&') + param(obj)

  return new Promise((resolve, reject) => {
    originJsonp(url, option, (err, data) => {
      err ? reject(err) : resolve(data)
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
