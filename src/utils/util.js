// 获取两个数之间的随机数（偏上限）
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// 洗牌数组
export function shuffle(arr) {
  const ret = arr.slice()
  for (let i = 0; i < arr.length; i++) {
    const j = getRandomInt(0, i)
    ;[ret[i], ret[j]] = [ret[j], ret[i]]
  }
  return ret
}

// 防抖函数
export function debounce(func, delay) {
  let timer
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
