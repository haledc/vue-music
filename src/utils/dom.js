// 增加 class
export function addClass(el, className) {
  el.classList.add(className)
}

// 判断是否存在 class
export function hasClass(el, className) {
  return el.classList.contains(className)
}

// 获取 data-xxx 的值
export function getData(el, name) {
  const dataName = 'data-' + name
  return el.getAttribute(dataName)
}

// 新建元素的 style
const elementStyle = document.createElement('div').style

// 获取浏览器的前缀
let vendor = (() => {
  const transformNames = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform'
  }
  // 遍历对象，如果新建元素的style中有对应的 value，就返回对应的 key
  for (const key in transformNames) {
    if (elementStyle[transformNames[key]] != null) {
      return key
    }
  }
  return false
})()

// 封装前缀，兼容浏览器
export function prefixStyle(style) {
  if (vendor === false) {
    return false
  }

  if (vendor === 'standard') {
    return style
  }

  return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}
