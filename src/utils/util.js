// 获取2个数之间的随机数（偏上限）
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// 洗牌数组
export function shuffle(arr) {
  // 复制数组, 不会影响原数组
  let _arr = arr.slice()
  // 遍历数组
  for (let i = 0; i < _arr.length; i++) {
    // 获取随机数
    let j = getRandomInt(0, i)

    // 元素交换
    ;[_arr[i], _arr[j]] = [_arr[j], _arr[i]]
  }

  return _arr
}

// 防抖函数
export function debounce(func, delay) {
  let timer = null
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
