/**
 * 获取2个数之间的随机数（偏上限）
 * @param min
 * @param max
 * @return {number}
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * 洗牌数组
 * @param arr
 * @return {Array}
 */
export function shuffle(arr) {
  // 复制数组, 不会影响原数组
  let _arr = arr.slice()
  // 遍历数组
  for (let i = 0; i < _arr.length; i++) {
    // 获取随机数
    let j = getRandomInt(0, i)
    // 元素交换
    let temp = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = temp
  }

  return _arr
}

/**
 * 节流函数 ★★★
 * @param func 原函数
 * @param delay 延迟时间
 * @return {Function}
 */
export function debounce(func, delay) {
  // 定义定时器
  let timer
  // 返回函数
  return function (...args) {
    // 如果函数执行，关闭定时器 ？？？
    if (timer) {
      clearTimeout(timer)
    }
    // 调用定时器执行原函数
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
