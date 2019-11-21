import originJsonp from 'jsonp'

// 封装原生 jsonp 为 Promise 对象
export default function jsonp(url, data, option) {
  // 判断 url 中是否带有 ? 号 没有的话加上 ? 有的话加上 & 然后拼接参数段 URL
  url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)

  return new Promise((resolve, reject) => {
    originJsonp(url, option, (err, data) => {
      if (!err) {
        resolve(data)
      } else {
        reject(err)
      }
    })
  })
}

// 把选项的所有参数拼接成 URI 字符串
function param(data) {
  let url = ''
  for (let key in data) {
    let value = data[key] !== undefined ? data[key] : ''
    url += `&${key}=${encodeURIComponent(value)}`
  }

  // 去掉最前面的一个 &
  return url ? url.substring(1) : ''
}
