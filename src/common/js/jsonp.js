import originJsonp from 'jsonp'

/**
 * 把原始的jsonp的回调函数封装成一个返回Promise对象的函数，方便获取数据
 * @param url
 * @param data
 * @param option
 * @return {Promise<any>}
 */
export default function jsonp(url, data, option) {
  // 判断url中是否带有?号 没有的话加上? 有的话加上& 然后拼接参数段URL
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

/**
 * 把选项的所有参数拼接成URI字符串
 * @param data
 * @return {string}
 */
function param(data) {
  let url = ''
  for (let key in data) {
    let value = data[key] !== undefined ? data[key] : ''
    url += `&${key}=${encodeURIComponent(value)}`
  }
  // 去掉最前面的一个&
  return url ? url.substring(1) : ''
}
